import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify JWT and get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Authorization header requis' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !authUser) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ success: false, message: 'Utilisateur non authentifié' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { accessCode, userId } = await req.json();
    
    console.log('Secure admin registration request for user:', userId);

    // Validate required parameters
    if (!accessCode || !userId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Code d\'accès et ID utilisateur requis' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // CRITICAL: Verify that the authenticated user matches the requested userId
    if (authUser.id !== userId) {
      console.error('User ID mismatch: auth user', authUser.id, 'vs requested', userId);
      return new Response(
        JSON.stringify({ success: false, message: 'Non autorisé à modifier ce compte' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Validate the admin code
    const ADMIN_CODE = Deno.env.get('ADMIN_REGISTRATION_CODE');
    if (!ADMIN_CODE || accessCode !== ADMIN_CODE) {
      console.error('Invalid admin code attempt for user:', authUser.id);
      return new Response(
        JSON.stringify({ success: false, message: 'Code d\'accès incorrect' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Use SERVICE_ROLE_KEY to bypass RLS and securely insert admin role
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user already has admin role
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing role:', checkError);
      throw checkError;
    }

    if (existingRole) {
      console.log('User already has admin role');
      return new Response(
        JSON.stringify({ success: true, message: 'Rôle admin déjà attribué' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deactivate all other roles for this user
    const { error: deactivateError } = await supabase
      .from('user_roles')
      .update({ is_active: false })
      .eq('user_id', userId);

    if (deactivateError) {
      console.error('Error deactivating roles:', deactivateError);
      throw deactivateError;
    }

    // Insert admin role using SERVICE_ROLE privileges
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin',
        is_active: true,
      });

    if (insertError) {
      console.error('Error inserting admin role:', insertError);
      throw insertError;
    }

    console.log('Admin role successfully assigned to user:', userId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Rôle administrateur attribué avec succès' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in secure-admin-register:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur serveur' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
