import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Note: For production, use Agora's official token generation library
// This is a simplified version - consider using agora-access-token package
async function generateAgoraToken(
  appId: string,
  appCertificate: string,
  channelName: string,
  uid: number,
  role: number,
  privilegeExpireTime: number = 3600
): Promise<string | null> {
  // For now, return null to use Agora without token (testing mode)
  // In production, implement proper token generation using Agora's algorithm
  console.log('Token generation called - using testing mode (no token)');
  return null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log incoming auth header for debugging
    const authHeader = req.headers.get('Authorization');
    console.log('Received Authorization header:', authHeader ? 'present' : 'missing');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader || '' },
        },
      }
    );

    // Verify user authentication using the access token directly
    const accessToken = (authHeader || '').replace(/^Bearer\s+/i, '').trim();
    console.log('Attempting to verify user with explicit token:', accessToken ? 'present' : 'missing');
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(accessToken);

    console.log('Auth result:', { 
      hasUser: !!user, 
      userId: user?.id,
      authError: authError?.message 
    });

    if (authError || !user) {
      console.error('Authentication failed:', authError?.message || 'No user found');
      throw new Error('Unauthorized');
    }

    const { channelName, role, uid } = await req.json();

    if (!channelName) {
      throw new Error('Channel name is required');
    }

    const appId = Deno.env.get('AGORA_APP_ID');
    const appCertificate = Deno.env.get('AGORA_APP_CERTIFICATE');

    console.log('Agora credentials check:', {
      hasAppId: !!appId,
      appIdValue: appId,
      hasCertificate: !!appCertificate,
      certValue: appCertificate ? '***' + appCertificate.slice(-4) : 'none'
    });

    if (!appId) {
      throw new Error('AGORA_APP_ID not configured');
    }

    // Generate UID if not provided
    const agoraUid = uid || Math.floor(Math.random() * 1000000);
    
    // Role: 1 = publisher (broadcaster), 2 = subscriber (audience)
    const agoraRole = role === 'publisher' ? 1 : 2;

    console.log(`Generating Agora token for user ${user.id}, channel ${channelName}, role ${agoraRole}`);

    // For testing without certificate, return null token
    // Agora will work in testing mode without token validation
    const token = appCertificate 
      ? await generateAgoraToken(appId, appCertificate, channelName, agoraUid, agoraRole, 3600)
      : null;

    return new Response(
      JSON.stringify({
        token,
        appId,
        channelName,
        uid: agoraUid,
        role: agoraRole,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating Agora token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
