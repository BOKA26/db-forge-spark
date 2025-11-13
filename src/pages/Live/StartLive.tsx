import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LiveStreamService } from '@/services/LiveStreamService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Video, VideoOff, Mic, MicOff, Loader2, Users, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function StartLive() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const videoPreviewRef = useRef<HTMLDivElement>(null);
  const liveStreamService = useRef<LiveStreamService>(new LiveStreamService());

  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [liveStreamId, setLiveStreamId] = useState<string | null>(null);
  const [viewersCount, setViewersCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  // Fetch vendor's shop
  const { data: shop } = useQuery({
    queryKey: ['vendor-shop', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('vendeur_id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Start live mutation
  const startLiveMutation = useMutation({
    mutationFn: async () => {
      if (!shop) throw new Error('Boutique non trouvée');

      // Initialize Agora
      const channelName = `live_${shop.id}_${Date.now()}`;
      await liveStreamService.current.initialize('publisher', channelName);
      await liveStreamService.current.joinChannel();
      const { videoTrack } = await liveStreamService.current.startBroadcast();

      // Play video in preview
      if (videoPreviewRef.current && videoTrack) {
        videoTrack.play(videoPreviewRef.current);
      }

      // Ensure authenticated request to Edge Function
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session) throw new Error('Vous devez être connecté pour démarrer un live');

      // Create live stream record via Edge Function (with explicit Authorization header)
      const { data, error } = await supabase.functions.invoke('manage-live-stream', {
        body: {
          action: 'start',
          data: {
            titre,
            description,
            shopId: shop.id,
          },
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      return data.liveStream;
    },
    onSuccess: (liveStream) => {
      setLiveStreamId(liveStream.id);
      setIsLive(true);
      toast.success('🎉 Live démarré avec succès !');
      
      // Start duration counter
      durationInterval.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      // Listen to viewers count updates
      const channel = supabase
        .channel(`live_${liveStream.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'live_streams',
            filter: `id=eq.${liveStream.id}`,
          },
          (payload) => {
            setViewersCount(payload.new.viewers_count || 0);
          }
        )
        .subscribe();
    },
    onError: (error: Error) => {
      toast.error(`Erreur : ${error.message}`);
    },
  });

  // End live mutation
  const endLiveMutation = useMutation({
    mutationFn: async () => {
      if (!liveStreamId) throw new Error('Live stream not found');

      await liveStreamService.current.leaveChannel();

      // Ensure authenticated request to Edge Function
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session) throw new Error('Vous devez être connecté pour terminer le live');

      const { error } = await supabase.functions.invoke('manage-live-stream', {
        body: {
          action: 'end',
          liveStreamId,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Live terminé');
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
      queryClient.invalidateQueries({ queryKey: ['live-streams'] });
      navigate('/my-shop');
    },
    onError: (error: Error) => {
      toast.error(`Erreur : ${error.message}`);
    },
  });

  // Preview camera before starting live
  const startPreview = async () => {
    try {
      await liveStreamService.current.initialize('publisher', 'preview_channel');
      const { videoTrack } = await liveStreamService.current.startBroadcast();
      
      if (videoPreviewRef.current && videoTrack) {
        videoTrack.play(videoPreviewRef.current);
        setIsPreviewing(true);
      }
    } catch (error) {
      toast.error('Impossible d\'accéder à la caméra');
      console.error(error);
    }
  };

  useEffect(() => {
    // Wait for user to be loaded before starting preview
    if (user && shop) {
      startPreview();
    }

    return () => {
      liveStreamService.current.leaveChannel();
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [user, shop]);

  const toggleCamera = () => {
    liveStreamService.current.toggleCamera(!isCameraOn);
    setIsCameraOn(!isCameraOn);
  };

  const toggleMic = () => {
    liveStreamService.current.toggleMicrophone(!isMicOn);
    setIsMicOn(!isMicOn);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!shop) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 container py-8">
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Vous devez avoir une boutique pour lancer un live.</p>
            <Button onClick={() => navigate('/create-shop')} className="mt-4">
              Créer ma boutique
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
          {/* Video Preview */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-black">
                <div ref={videoPreviewRef} className="w-full h-full" />
                
                {!isPreviewing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                  </div>
                )}

                {/* Live Indicator */}
                {isLive && (
                  <div className="absolute top-4 left-4 flex gap-4">
                    <div className="bg-red-600 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      EN DIRECT
                    </div>
                    <div className="bg-black/80 text-white px-4 py-2 rounded-full flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {viewersCount}
                    </div>
                    <div className="bg-black/80 text-white px-4 py-2 rounded-full flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatDuration(duration)}
                    </div>
                  </div>
                )}

                {/* Controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={toggleCamera}
                    className="rounded-full"
                  >
                    {isCameraOn ? <Video /> : <VideoOff />}
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={toggleMic}
                    className="rounded-full"
                  >
                    {isMicOn ? <Mic /> : <MicOff />}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Live Settings */}
          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Informations du Live</h2>
              
              {!isLive ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Titre *</label>
                      <Input
                        value={titre}
                        onChange={(e) => setTitre(e.target.value)}
                        placeholder="Ex: Nouvelle collection été 2024"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Décrivez votre live..."
                        className="mt-1"
                        rows={4}
                      />
                    </div>

                    <Button
                      onClick={() => startLiveMutation.mutate()}
                      disabled={!titre.trim() || startLiveMutation.isPending}
                      className="w-full"
                      size="lg"
                    >
                      {startLiveMutation.isPending ? (
                        <><Loader2 className="mr-2 animate-spin" /> Démarrage...</>
                      ) : (
                        '🎬 Lancer le Live'
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    <div>
                      <h3 className="font-semibold">{titre}</h3>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => endLiveMutation.mutate()}
                    disabled={endLiveMutation.isPending}
                    variant="destructive"
                    className="w-full"
                    size="lg"
                  >
                    {endLiveMutation.isPending ? (
                      <><Loader2 className="mr-2 animate-spin" /> Arrêt...</>
                    ) : (
                      '⏹️ Terminer le Live'
                    )}
                  </Button>
                </>
              )}
            </Card>

            {/* Tips */}
            {!isLive && (
              <Card className="p-4 bg-primary/5">
                <h3 className="font-semibold mb-2">💡 Conseils</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Assurez une bonne luminosité</li>
                  <li>• Testez votre connexion internet</li>
                  <li>• Préparez vos produits à présenter</li>
                  <li>• Interagissez avec les spectateurs</li>
                </ul>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
