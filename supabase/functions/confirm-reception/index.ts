import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey =
      Deno.env.get("SUPABASE_ANON_KEY") ??
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const authedClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user },
      error: userError,
    } = await authedClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const orderId = body?.orderId as string | undefined;
    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId manquant" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: order, error: orderError } = await adminClient
      .from("orders")
      .select("id, statut, montant, vendeur_id, livreur_id, acheteur_id, reference_gateway")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Commande introuvable" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (order.acheteur_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const nowIso = new Date().toISOString();

    // 1) Assurer la ligne validations + marquer acheteur_ok
    const { data: validation } = await adminClient
      .from("validations")
      .select("id, acheteur_ok, livreur_ok")
      .eq("order_id", orderId)
      .maybeSingle();

    if (!validation) {
      const { error: insertValidationError } = await adminClient
        .from("validations")
        .insert({ order_id: orderId, acheteur_ok: true, updated_at: nowIso });
      if (insertValidationError) throw insertValidationError;
    } else if (!validation.acheteur_ok) {
      const { error: updateValidationError } = await adminClient
        .from("validations")
        .update({ acheteur_ok: true, updated_at: nowIso })
        .eq("order_id", orderId);
      if (updateValidationError) throw updateValidationError;
    }

    // 2) Vérifier que la livraison est bien terminée
    const { data: delivery } = await adminClient
      .from("deliveries")
      .select("statut")
      .eq("order_id", orderId)
      .maybeSingle();

    const deliveredStatuses = new Set(["livré", "livrée"]);
    const isDelivered =
      deliveredStatuses.has(order.statut) ||
      order.statut === "terminé" ||
      deliveredStatuses.has((delivery?.statut as string) ?? "") ||
      Boolean(validation?.livreur_ok);

    if (!isDelivered) {
      return new Response(
        JSON.stringify({
          error: "Livraison pas encore terminée",
          details: { order_statut: order.statut, delivery_statut: delivery?.statut },
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 3) Créer/débloquer le paiement (certains anciens orders n'ont pas de ligne payments)
    const { data: payment } = await adminClient
      .from("payments")
      .select("id, statut, debloque_at")
      .eq("order_id", orderId)
      .maybeSingle();

    if (!payment) {
      const { error: insertPaymentError } = await adminClient
        .from("payments")
        .insert({
          order_id: orderId,
          montant: order.montant,
          mode: "Paystack",
          statut: "débloqué",
          reference_gateway: order.reference_gateway,
          debloque_at: nowIso,
        });
      if (insertPaymentError) throw insertPaymentError;
    } else if (payment.statut !== "débloqué") {
      const { error: updatePaymentError } = await adminClient
        .from("payments")
        .update({ statut: "débloqué", debloque_at: payment.debloque_at ?? nowIso })
        .eq("id", payment.id);
      if (updatePaymentError) throw updatePaymentError;
    }

    // 4) Mettre la commande en terminé (sauf litige/annulé)
    if (!["terminé", "litige", "annulé"].includes(order.statut)) {
      const { error: updateOrderError } = await adminClient
        .from("orders")
        .update({ statut: "terminé" })
        .eq("id", orderId);
      if (updateOrderError) throw updateOrderError;
    }

    // 5) Notifications
    await adminClient.from("notifications").insert([
      {
        user_id: order.vendeur_id,
        message: `💰 Paiement de ${Number(order.montant).toLocaleString()} FCFA libéré suite à la confirmation de réception par l'acheteur.`,
        canal: "app",
      },
      ...(order.livreur_id
        ? [
            {
              user_id: order.livreur_id,
              message: "✅ Livraison validée par le client. Merci pour votre service !",
              canal: "app",
            },
          ]
        : []),
    ]);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in confirm-reception:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
