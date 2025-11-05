import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeliveryMap } from '@/components/tracking/DeliveryMap';
import { Package, ArrowLeft, Clock, MapPin, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const TrackDelivery = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  // Récupérer les détails de la livraison
  const { data: delivery, isLoading } = useQuery({
    queryKey: ['delivery-tracking', id],
    queryFn: async () => {
      if (!id) throw new Error('No delivery ID');

      const { data, error } = await supabase
        .from('deliveries')
        .select(`
          *,
          order_id,
          orders (
            id,
            montant,
            quantite,
            products (
              nom,
              images
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  // Récupérer la position actuelle du livreur
  const { data: courierLocation } = useQuery({
    queryKey: ['courier-location', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('courier_locations')
        .select('*')
        .eq('delivery_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
    refetchInterval: 5000, // Rafraîchir toutes les 5 secondes
  });

  const getStatusBadge = (statut: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
      en_attente: { variant: 'outline', label: 'En attente' },
      en_cours: { variant: 'default', label: 'En cours' },
      livré: { variant: 'secondary', label: 'Livré' },
    };
    const status = variants[statut] || variants.en_attente;
    return <Badge variant={status.variant}>{status.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="container py-8 flex-1">
          <p className="text-center text-muted-foreground">Chargement...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="container py-8 flex-1">
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-4">Livraison introuvable</h2>
              <Link to="/mes-commandes">
                <Button>Retour aux commandes</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const initialPosition = courierLocation
    ? { latitude: Number(courierLocation.latitude), longitude: Number(courierLocation.longitude) }
    : undefined;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container py-8 flex-1">
        <div className="mb-6">
          <Link to="/mes-commandes">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour aux commandes
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carte */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Suivi en temps réel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DeliveryMap deliveryId={id!} initialPosition={initialPosition} />
              </CardContent>
            </Card>
          </div>

          {/* Détails */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Détails de la livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Statut</p>
                  {getStatusBadge(delivery.statut)}
                </div>

                {delivery.tracking_code && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Code de suivi</p>
                    <p className="font-mono text-sm">{delivery.tracking_code}</p>
                  </div>
                )}

                {delivery.date_assignation && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Assigné le {new Date(delivery.date_assignation).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}

                {delivery.date_livraison && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Livré le {new Date(delivery.date_livraison).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {Array.isArray(delivery.orders) && delivery.orders[0] && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Produit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    {delivery.orders[0].products?.images?.[0] && (
                      <img
                        src={delivery.orders[0].products.images[0]}
                        alt={delivery.orders[0].products.nom}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <p className="font-medium">{delivery.orders[0].products?.nom}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantité: {delivery.orders[0].quantite}
                      </p>
                      <p className="text-sm font-semibold mt-1">
                        {Number(delivery.orders[0].montant).toFixed(0)} FCFA
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {courierLocation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Position du livreur
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-1">Dernière mise à jour</p>
                  <p className="text-sm">
                    {new Date(courierLocation.created_at).toLocaleTimeString('fr-FR')}
                  </p>
                  {courierLocation.accuracy && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Précision: {Number(courierLocation.accuracy).toFixed(0)}m
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TrackDelivery;
