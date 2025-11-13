import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, liveStreamId, data } = await req.json();

    console.log(`Live stream action: ${action} by user ${user.id}`);

    switch (action) {
      case 'start': {
        // Start a live stream
        const { titre, description, shopId } = data;
        
        if (!titre || !shopId) {
          throw new Error('Titre and shopId are required');
        }

        // Generate unique channel ID
        const channelId = `live_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        const { data: liveStream, error: insertError } = await supabaseClient
          .from('live_streams')
          .insert({
            shop_id: shopId,
            vendeur_id: user.id,
            titre,
            description,
            statut: 'en_cours',
            agora_channel_id: channelId,
            started_at: new Date().toISOString(),
            viewers_count: 0,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Send notification to shop followers (implement later)
        console.log(`Live stream started: ${liveStream.id}`);

        return new Response(
          JSON.stringify({ liveStream }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      case 'end': {
        // End a live stream
        if (!liveStreamId) {
          throw new Error('liveStreamId is required');
        }

        const { data: liveStream, error: fetchError } = await supabaseClient
          .from('live_streams')
          .select('*')
          .eq('id', liveStreamId)
          .eq('vendeur_id', user.id)
          .single();

        if (fetchError) throw fetchError;

        const { error: updateError } = await supabaseClient
          .from('live_streams')
          .update({
            statut: 'terminé',
            ended_at: new Date().toISOString(),
          })
          .eq('id', liveStreamId);

        if (updateError) throw updateError;

        console.log(`Live stream ended: ${liveStreamId}`);

        return new Response(
          JSON.stringify({ message: 'Live stream ended successfully' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      case 'update_viewers': {
        // Update viewers count
        if (!liveStreamId) {
          throw new Error('liveStreamId is required');
        }

        const { viewersCount } = data;

        const { error: updateError } = await supabaseClient
          .from('live_streams')
          .update({ viewers_count: viewersCount })
          .eq('id', liveStreamId);

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({ message: 'Viewers count updated' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      case 'join': {
        // Track viewer joining
        if (!liveStreamId) {
          throw new Error('liveStreamId is required');
        }

        const { error: insertError } = await supabaseClient
          .from('live_viewers')
          .insert({
            live_stream_id: liveStreamId,
            user_id: user.id,
            joined_at: new Date().toISOString(),
          });

        if (insertError) throw insertError;

        // Increment viewers count
        const { data: liveStream } = await supabaseClient
          .from('live_streams')
          .select('viewers_count')
          .eq('id', liveStreamId)
          .single();

        if (liveStream) {
          await supabaseClient
            .from('live_streams')
            .update({ viewers_count: (liveStream.viewers_count || 0) + 1 })
            .eq('id', liveStreamId);
        }

        return new Response(
          JSON.stringify({ message: 'Viewer joined successfully' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      case 'leave': {
        // Track viewer leaving
        if (!liveStreamId) {
          throw new Error('liveStreamId is required');
        }

        const { error: updateError } = await supabaseClient
          .from('live_viewers')
          .update({ left_at: new Date().toISOString() })
          .eq('live_stream_id', liveStreamId)
          .eq('user_id', user.id)
          .is('left_at', null);

        if (updateError) throw updateError;

        // Decrement viewers count
        const { data: liveStream } = await supabaseClient
          .from('live_streams')
          .select('viewers_count')
          .eq('id', liveStreamId)
          .single();

        if (liveStream && liveStream.viewers_count > 0) {
          await supabaseClient
            .from('live_streams')
            .update({ viewers_count: liveStream.viewers_count - 1 })
            .eq('id', liveStreamId);
        }

        return new Response(
          JSON.stringify({ message: 'Viewer left successfully' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in manage-live-stream:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
