import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LiveStreamService } from '@/services/LiveStreamService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Users, Loader2, Share2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function WatchLive() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const liveStreamService = useRef<LiveStreamService>(new LiveStreamService());
  
  const [isJoined, setIsJoined] = useState(false);
  const [viewersCount, setViewersCount] = useState(0);

  // Fetch live stream details
  const { data: liveStream, isLoading } = useQuery({
    queryKey: ['live-stream', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('live_streams')
        .select(`
          *,
          shops (
            id,
            nom_boutique,
            logo_url,
            description
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (!liveStream || !liveStream.agora_channel_id) return;

    const joinLive = async () => {
      try {
        // Initialize Agora as subscriber
        await liveStreamService.current.initialize('subscriber', liveStream.agora_channel_id);
        await liveStreamService.current.joinChannel();

        // Notify backend that viewer joined
        if (user) {
          await supabase.functions.invoke('manage-live-stream', {
            body: {
              action: 'join',
              liveStreamId: id,
            },
          });
        }

        // Listen for remote users
        const client = liveStreamService.current.getClient();
        if (client) {
          client.on('user-published', async (remoteUser, mediaType) => {
            // Only handle audio and video, skip datachannel
            if (mediaType === 'video' || mediaType === 'audio') {
              await liveStreamService.current.subscribeToRemoteUser(remoteUser, mediaType);
              
              if (mediaType === 'video' && videoContainerRef.current) {
                remoteUser.videoTrack?.play(videoContainerRef.current);
              }
              if (mediaType === 'audio') {
                remoteUser.audioTrack?.play();
              }
            }
          });

          client.on('user-unpublished', (remoteUser) => {
            console.log('Remote user unpublished:', remoteUser.uid);
          });
        }

        setIsJoined(true);
      } catch (error) {
        console.error('Failed to join live:', error);
        toast.error('Impossible de rejoindre le live');
      }
    };

    joinLive();

    // Subscribe to viewers count updates
    const channel = supabase
      .channel(`live_${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'live_streams',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setViewersCount(payload.new.viewers_count || 0);
        }
      )
      .subscribe();

    return () => {
      // Notify backend that viewer left
      if (user) {
        supabase.functions.invoke('manage-live-stream', {
          body: {
            action: 'leave',
            liveStreamId: id,
          },
        });
      }
      
      liveStreamService.current.leaveChannel();
      channel.unsubscribe();
    };
  }, [liveStream, id, user]);

  const shareLive = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: liveStream?.titre || 'Live',
          text: `Regardez le live : ${liveStream?.titre}`,
          url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      toast.success('Lien copié !');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!liveStream || liveStream.statut !== 'en_cours') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 container py-8">
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Ce live n'est pas disponible.</p>
            <Button onClick={() => window.history.back()} className="mt-4">
              Retour
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="flex-1 container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-black">
                <div ref={videoContainerRef} className="w-full h-full" />
                
                {!isJoined && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                  </div>
                )}

                {/* Live Indicator */}
                <div className="absolute top-4 left-4 flex gap-4">
                  <div className="bg-red-600 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    EN DIRECT
                  </div>
                  <div className="bg-black/80 text-white px-4 py-2 rounded-full flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {viewersCount || liveStream.viewers_count || 0}
                  </div>
                </div>
              </div>

              {/* Live Info */}
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-2">{liveStream.titre}</h1>
                {liveStream.description && (
                  <p className="text-muted-foreground mb-4">{liveStream.description}</p>
                )}
                
                <Button
                  onClick={shareLive}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </Button>
              </div>
            </Card>
          </div>

          {/* Shop Info & Chat (future) */}
          <div className="space-y-4">
            {/* Shop Card */}
            {liveStream.shops && (
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  {liveStream.shops.logo_url && (
                    <img
                      src={liveStream.shops.logo_url}
                      alt={liveStream.shops.nom_boutique}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{liveStream.shops.nom_boutique}</h3>
                    {liveStream.shops.description && (
                      <p className="text-sm text-muted-foreground">{liveStream.shops.description}</p>
                    )}
                  </div>
                </div>
                
                <Button
                  onClick={() => window.location.href = `/boutique/${liveStream.shops.id}`}
                  className="w-full"
                >
                  Voir la boutique
                </Button>
              </Card>
            )}

            {/* Chat Placeholder */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">💬 Chat en direct</h3>
              <p className="text-sm text-muted-foreground text-center py-8">
                Le chat sera bientôt disponible
              </p>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
