import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface CourierLocationSharingProps {
  deliveryId: string;
}

export const CourierLocationSharing = ({ deliveryId }: CourierLocationSharingProps) => {
  const { user } = useAuth();
  const [isSharing, setIsSharing] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [lastPosition, setLastPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateLocation = async (position: GeolocationPosition) => {
    if (!user) return;

    try {
      const locationData = {
        delivery_id: deliveryId,
        livreur_id: user.id,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
      };

      // Upsert la position (insert ou update)
      const { error } = await supabase
        .from('courier_locations')
        .upsert(locationData, {
          onConflict: 'delivery_id'
        });

      if (error) throw error;

      setLastPosition(position);
      setError(null);
    } catch (err) {
      console.error('Error updating location:', err);
      setError('Erreur lors de la mise à jour de la position');
    }
  };

  const startSharing = () => {
    if (!navigator.geolocation) {
      toast.error('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        updateLocation(position);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Impossible d\'accéder à votre position');
        toast.error('Erreur de géolocalisation');
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    setWatchId(id);
    setIsSharing(true);
    toast.success('Partage de position activé');
  };

  const stopSharing = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsSharing(false);
      toast.info('Partage de position désactivé');
    }
  };

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            {isSharing ? (
              <Navigation className="h-6 w-6 text-primary animate-pulse" />
            ) : (
              <MapPin className="h-6 w-6 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">Partage de position</h3>
              {isSharing && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Actif
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {isSharing
                ? 'Votre position est partagée en temps réel avec le client'
                : 'Activez le partage pour que le client puisse suivre votre position'}
            </p>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive mb-4">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {lastPosition && (
              <div className="text-xs text-muted-foreground mb-4 font-mono bg-muted p-2 rounded">
                Dernière position: {lastPosition.coords.latitude.toFixed(6)}, {lastPosition.coords.longitude.toFixed(6)}
                <br />
                Précision: {lastPosition.coords.accuracy.toFixed(0)}m
              </div>
            )}

            <Button
              onClick={isSharing ? stopSharing : startSharing}
              variant={isSharing ? 'outline' : 'default'}
              className="w-full"
            >
              {isSharing ? 'Arrêter le partage' : 'Commencer le partage'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
