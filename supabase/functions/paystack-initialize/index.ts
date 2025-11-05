import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderIds, email, amount } = await req.json();

    console.log('Initializing Paystack payment:', { orderIds, email, amount });

    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      throw new Error('PAYSTACK_SECRET_KEY not configured');
    }

    // Initialiser la transaction Paystack
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Paystack utilise les centimes
        currency: 'XOF',
        metadata: {
          order_ids: orderIds,
          custom_fields: [
            {
              display_name: "Order IDs",
              variable_name: "order_ids",
              value: orderIds.join(',')
            }
          ]
        },
        callback_url: `${req.headers.get('origin')}/mes-commandes`
      }),
    });

    const data = await response.json();
    console.log('Paystack response:', data);

    if (!data.status) {
      throw new Error(data.message || 'Failed to initialize payment');
    }

    // Mettre à jour les commandes avec la référence de transaction
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from('orders')
      .update({ reference_gateway: data.data.reference })
      .in('id', orderIds);

    if (updateError) {
      console.error('Error updating orders:', updateError);
    }

    return new Response(
      JSON.stringify({
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference: data.data.reference
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in paystack-initialize:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
