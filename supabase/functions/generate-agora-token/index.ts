import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Agora RTC Token Builder
const VERSION = "007";

// Role definitions
const Role = {
  PUBLISHER: 1,
  SUBSCRIBER: 2,
};

// Privilege definitions
const Privileges = {
  JOIN_CHANNEL: 1,
  PUBLISH_AUDIO_STREAM: 2,
  PUBLISH_VIDEO_STREAM: 3,
  PUBLISH_DATA_STREAM: 4,
};

class ByteBuf {
  buffer: number[] = [];

  putUint16(v: number) {
    this.buffer.push((v >> 0) & 0xff);
    this.buffer.push((v >> 8) & 0xff);
  }

  putUint32(v: number) {
    this.buffer.push((v >> 0) & 0xff);
    this.buffer.push((v >> 8) & 0xff);
    this.buffer.push((v >> 16) & 0xff);
    this.buffer.push((v >> 24) & 0xff);
  }

  putBytes(bytes: Uint8Array) {
    this.putUint16(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i]);
    }
  }

  putString(str: string) {
    const bytes = new TextEncoder().encode(str);
    this.putBytes(bytes);
  }

  putTreeMap(map: Map<number, number>) {
    this.putUint16(map.size);
    const sortedKeys = Array.from(map.keys()).sort((a, b) => a - b);
    for (const key of sortedKeys) {
      this.putUint16(key);
      this.putUint32(map.get(key)!);
    }
  }

  pack(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

// Convert Uint8Array to base64
function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

async function hmacSign(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const keyBuffer = new ArrayBuffer(key.length);
  const keyView = new Uint8Array(keyBuffer);
  keyView.set(key);
  
  const dataBuffer = new ArrayBuffer(data.length);
  const dataView = new Uint8Array(dataBuffer);
  dataView.set(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, dataBuffer);
  return new Uint8Array(signature);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generateAccessToken(
  appId: string,
  appCertificate: string,
  channelName: string,
  uid: number,
  role: number,
  privilegeExpireTs: number
): Promise<string> {
  const ts = Math.floor(Date.now() / 1000);
  const salt = randomInt(1, 99999999);
  
  // Build message
  const msgBuf = new ByteBuf();
  msgBuf.putUint32(salt);
  msgBuf.putUint32(ts);
  
  // Build privileges map
  const privileges = new Map<number, number>();
  privileges.set(Privileges.JOIN_CHANNEL, privilegeExpireTs);
  
  if (role === Role.PUBLISHER) {
    privileges.set(Privileges.PUBLISH_AUDIO_STREAM, privilegeExpireTs);
    privileges.set(Privileges.PUBLISH_VIDEO_STREAM, privilegeExpireTs);
    privileges.set(Privileges.PUBLISH_DATA_STREAM, privilegeExpireTs);
  }
  
  msgBuf.putTreeMap(privileges);
  
  const msgPack = msgBuf.pack();
  
  // Build signature content
  const signBuf = new ByteBuf();
  signBuf.putString(appId);
  signBuf.putString(channelName);
  signBuf.putString(String(uid));
  signBuf.putBytes(msgPack);
  
  const signPack = signBuf.pack();
  const certBytes = new TextEncoder().encode(appCertificate);
  const signature = await hmacSign(certBytes, signPack);
  
  // Build final token
  const tokenBuf = new ByteBuf();
  tokenBuf.putString(appId);
  tokenBuf.putUint32(ts);
  tokenBuf.putUint32(salt);
  tokenBuf.putBytes(signature);
  
  // CRC - simple implementation
  const crcBuf = new ByteBuf();
  crcBuf.putString(channelName);
  crcBuf.putUint32(ts);
  crcBuf.putUint32(salt);
  const crcPack = crcBuf.pack();
  
  // Simple CRC32 calculation
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < crcPack.length; i++) {
    crc ^= crcPack[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xEDB88320 : 0);
    }
  }
  crc ^= 0xFFFFFFFF;
  tokenBuf.putUint32(crc >>> 0);
  
  tokenBuf.putUint16(msgPack.length);
  for (let i = 0; i < msgPack.length; i++) {
    tokenBuf.buffer.push(msgPack[i]);
  }
  
  const tokenPack = tokenBuf.pack();
  return VERSION + uint8ArrayToBase64(tokenPack);
}

// Simplified RtcTokenBuilder compatible with Agora SDK
async function buildTokenWithUid(
  appId: string,
  appCertificate: string,
  channelName: string,
  uid: number,
  role: number,
  tokenExpireSeconds: number = 3600
): Promise<string> {
  const privilegeExpireTs = Math.floor(Date.now() / 1000) + tokenExpireSeconds;
  return await generateAccessToken(appId, appCertificate, channelName, uid, role, privilegeExpireTs);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const accessToken = (authHeader || '').replace(/^Bearer\s+/i, '').trim();
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
      hasCertificate: !!appCertificate,
    });

    if (!appId) {
      throw new Error('AGORA_APP_ID not configured');
    }

    if (!appCertificate) {
      throw new Error('AGORA_APP_CERTIFICATE not configured - required for token generation');
    }

    // Generate UID if not provided
    const agoraUid = uid || Math.floor(Math.random() * 1000000);
    
    // Role: 1 = publisher (broadcaster), 2 = subscriber (audience)
    const agoraRole = role === 'publisher' ? Role.PUBLISHER : Role.SUBSCRIBER;

    console.log(`Generating Agora token for user ${user.id}, channel ${channelName}, role ${agoraRole}`);

    // Generate token with 1 hour expiry
    const token = await buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      agoraUid,
      agoraRole,
      3600
    );

    console.log('Token generated successfully');

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
