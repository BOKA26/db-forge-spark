import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';

interface DeliveryMapProps {
  deliveryId: string;
  initialPosition?: { latitude: number; longitude: number };
}

const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTBlZGJxNW0wMDFxMmtzZnRscG1hdDhvIn0.rV5KlPh0Z9P3PcXXxTKZRg';

export const DeliveryMap = ({ deliveryId, initialPosition }: DeliveryMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const courierMarker = useRef<mapboxgl.Marker | null>(null);
  const [currentLocation, setCurrentLocation] = useState(initialPosition);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialiser la carte
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    const defaultCenter: [number, number] = initialPosition 
      ? [initialPosition.longitude, initialPosition.latitude]
      : [2.3522, 48.8566]; // Paris par défaut

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: defaultCenter,
      zoom: 14,
    });

    // Ajouter les contrôles de navigation
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Créer le marqueur du livreur
    const el = document.createElement('div');
    el.className = 'courier-marker';
    el.style.width = '40px';
    el.style.height = '40px';
    el.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMyNTYzZWIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTIgMjJzLTgtNC04LTEwYTggOCAwIDAgMSAxNiAwYzAgNi04IDEwLTggMTBaIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMyIvPjwvc3ZnPg==)';
    el.style.backgroundSize = 'cover';

    courierMarker.current = new mapboxgl.Marker(el)
      .setLngLat(defaultCenter)
      .addTo(map.current);

    // S'abonner aux mises à jour en temps réel
    const channel = supabase
      .channel(`delivery-${deliveryId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'courier_locations',
          filter: `delivery_id=eq.${deliveryId}`
        },
        (payload) => {
          console.log('Location update:', payload);
          
          if (payload.new && 'latitude' in payload.new && 'longitude' in payload.new) {
            const { latitude, longitude } = payload.new as { latitude: number; longitude: number };
            const newPosition: [number, number] = [longitude, latitude];
            
            // Mettre à jour le marqueur
            courierMarker.current?.setLngLat(newPosition);
            
            // Centrer la carte sur la nouvelle position
            map.current?.flyTo({
              center: newPosition,
              zoom: 15,
              duration: 1000
            });

            setCurrentLocation({ latitude, longitude });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      map.current?.remove();
    };
  }, [deliveryId, initialPosition]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      {currentLocation && (
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
          <p className="text-sm font-medium">Position du livreur</p>
          <p className="text-xs text-muted-foreground">
            {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};
