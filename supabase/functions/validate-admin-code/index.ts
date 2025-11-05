import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();
    const ADMIN_CODE = Deno.env.get('ADMIN_REGISTRATION_CODE');

    if (!code || !ADMIN_CODE) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Code invalide' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const isValid = code === ADMIN_CODE;

    return new Response(
      JSON.stringify({ 
        valid: isValid, 
        message: isValid ? 'Code valide' : 'Code d\'accès incorrect' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ valid: false, message: 'Erreur de validation' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});