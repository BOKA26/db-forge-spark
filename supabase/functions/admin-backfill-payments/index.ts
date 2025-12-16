import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type BackfillResult = {
  scanned: number;
  created: number;
  unlocked: number;
  updatedOrders: number;
  missing: Array<{ order_id: string; reason: string }>;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const authedClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user },
    } = await authedClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Vérifier rôle admin via user_roles
    const { data: roleRow } = await adminClient
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .eq("is_active", true)
      .maybeSingle();

    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(Number(body?.limit ?? 200), 1), 500);

    // Orders récents potentiellement concernés
    const { data: orders, error: ordersError } = await adminClient
      .from("orders")
      .select("id, statut, montant, reference_gateway")
      .in("statut", ["livré", "terminé"]) // on répare les cas déjà livrés/terminés
      .order("created_at", { ascending: false })
      .limit(limit);

    if (ordersError) throw ordersError;

    const orderIds = (orders ?? []).map((o) => o.id);
    if (!orderIds.length) {
      return new Response(JSON.stringify({ scanned: 0, created: 0, unlocked: 0, updatedOrders: 0, missing: [] } satisfies BackfillResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const [{ data: validations }, { data: deliveries }, { data: payments }] = await Promise.all([
      adminClient.from("validations").select("order_id, acheteur_ok, livreur_ok").in("order_id", orderIds),
      adminClient.from("deliveries").select("order_id, statut").in("order_id", orderIds),
      adminClient.from("payments").select("id, order_id, statut, debloque_at").in("order_id", orderIds),
    ]);

    const validationsByOrder = new Map<string, any>((validations ?? []).map((v: any) => [v.order_id, v]));
    const deliveriesByOrder = new Map<string, any>((deliveries ?? []).map((d: any) => [d.order_id, d]));
    const paymentsByOrder = new Map<string, any>((payments ?? []).map((p: any) => [p.order_id, p]));

    const nowIso = new Date().toISOString();
    const deliveredStatuses = new Set(["livré", "livrée"]);

    const result: BackfillResult = {
      scanned: orders.length,
      created: 0,
      unlocked: 0,
      updatedOrders: 0,
      missing: [],
    };

    for (const o of orders) {
      const v = validationsByOrder.get(o.id);
      const d = deliveriesByOrder.get(o.id);
      const p = paymentsByOrder.get(o.id);

      const isDelivered = deliveredStatuses.has(o.statut) || o.statut === "terminé" || deliveredStatuses.has(d?.statut ?? "") || Boolean(v?.livreur_ok);
      const buyerOk = Boolean(v?.acheteur_ok);

      if (!buyerOk || !isDelivered) {
        result.missing.push({ order_id: o.id, reason: "validation/livraison non complète" });
        continue;
      }

      if (!p) {
        const { error: insertPaymentError } = await adminClient.from("payments").insert({
          order_id: o.id,
          montant: o.montant,
          mode: "Paystack",
          statut: "débloqué",
          reference_gateway: o.reference_gateway,
          debloque_at: nowIso,
        });

        if (insertPaymentError) {
          result.missing.push({ order_id: o.id, reason: `insert payment: ${insertPaymentError.message}` });
          continue;
        }

        result.created += 1;
      } else if (p.statut !== "débloqué") {
        const { error: updatePaymentError } = await adminClient
          .from("payments")
          .update({ statut: "débloqué", debloque_at: p.debloque_at ?? nowIso })
          .eq("id", p.id);

        if (updatePaymentError) {
          result.missing.push({ order_id: o.id, reason: `update payment: ${updatePaymentError.message}` });
          continue;
        }

        result.unlocked += 1;
      }

      if (o.statut === "livré") {
        const { error: updateOrderError } = await adminClient.from("orders").update({ statut: "terminé" }).eq("id", o.id);
        if (!updateOrderError) result.updatedOrders += 1;
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in admin-backfill-payments:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
