import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function verifyPaystackSignature(req: Request, body: string): Promise<boolean> {
  const signature = req.headers.get('x-paystack-signature');
  if (!signature) {
    console.error('Missing x-paystack-signature header');
    return false;
  }

  const paystackSecret = Deno.env.get('PAYSTACK_SECRET_KEY');
  if (!paystackSecret) {
    console.error('PAYSTACK_SECRET_KEY not configured');
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(paystackSecret),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return computedSignature === signature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.text();
    
    // Verify Paystack signature
    const isValid = await verifyPaystackSignature(req, body);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const payload = JSON.parse(body);
    console.log('Webhook received:', payload);

    // Verify it's a successful payment
    if (payload.event !== 'charge.success') {
      return new Response(JSON.stringify({ message: 'Event not handled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const { reference, amount, status, currency } = payload.data;

    if (status !== 'success') {
      return new Response(JSON.stringify({ message: 'Payment not successful' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Find order by reference
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('reference_gateway', reference)
      .single();

    if (orderError && orderError.code !== 'PGRST116') {
      throw orderError;
    }

    let orderId = order?.id;

    // Update or create order
    if (order) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ statut: 'fonds_bloques' })
        .eq('id', order.id);

      if (updateError) throw updateError;
    }

    if (!orderId) {
      console.error('Order not found for reference:', reference);
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // Create or update payment
    const { error: paymentError } = await supabase
      .from('payments')
      .upsert({
        order_id: orderId,
        montant: amount / 100, // Paystack amounts are in kobo/cents
        mode: 'Paystack',
        statut: 'bloqué',
        reference_gateway: reference,
      });

    if (paymentError) throw paymentError;

    // Create delivery if not exists
    const { error: deliveryError } = await supabase
      .from('deliveries')
      .upsert({
        order_id: orderId,
        vendeur_id: order.vendeur_id,
        acheteur_id: order.acheteur_id,
        statut: 'en_attente',
      }, { onConflict: 'order_id' });

    if (deliveryError) throw deliveryError;

    // Send notifications
    await supabase.from('notifications').insert([
      {
        user_id: order.acheteur_id,
        message: 'Votre paiement a été sécurisé avec succès.',
        canal: 'app',
      },
      {
        user_id: order.vendeur_id,
        message: 'Nouvelle commande payée. Préparez l\'expédition.',
        canal: 'app',
      },
    ]);

    if (order.livreur_id) {
      await supabase.from('notifications').insert({
        user_id: order.livreur_id,
        message: 'Une nouvelle livraison vous a été assignée.',
        canal: 'app',
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
