import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to generate Agora RTC token
async function generateAgoraToken(
  appId: string,
  appCertificate: string,
  channelName: string,
  uid: number,
  role: number, // 1 = publisher, 2 = subscriber
  privilegeExpireTime: number = 3600
): Promise<string> {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + privilegeExpireTime;

  // Prepare message
  const message = `${appId}${channelName}${uid}${privilegeExpiredTs}`;
  
  // Generate HMAC-SHA256 signature
  const encoder = new TextEncoder();
  const keyData = encoder.encode(appCertificate);
  const messageData = encoder.encode(message);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const signatureArray = Array.from(new Uint8Array(signature));
  const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Build token string
  const tokenString = `${appId}${channelName}${uid}${privilegeExpiredTs}${signatureHex}`;
  
  // Base64 encode
  const tokenBytes = encoder.encode(tokenString);
  const base64Token = btoa(String.fromCharCode(...tokenBytes));
  
  return base64Token;
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

    if (!appId || !appCertificate) {
      throw new Error('Agora credentials not configured');
    }

    // Generate UID if not provided
    const agoraUid = uid || Math.floor(Math.random() * 1000000);
    
    // Role: 1 = publisher (broadcaster), 2 = subscriber (audience)
    const agoraRole = role === 'publisher' ? 1 : 2;

    console.log(`Generating Agora token for user ${user.id}, channel ${channelName}, role ${agoraRole}`);

    const token = await generateAgoraToken(
      appId,
      appCertificate,
      channelName,
      agoraUid,
      agoraRole,
      3600 // Token valid for 1 hour
    );

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
