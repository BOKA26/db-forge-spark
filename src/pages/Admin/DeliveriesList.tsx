import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminNavbar } from '@/components/layout/AdminNavbar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MapPin, Navigation, Package, User, Phone, Clock } from 'lucide-react';
import { DeliveryMap } from '@/components/tracking/DeliveryMap';

interface TrackingDialogData {
  deliveryId: string;
  courierName: string;
  buyerName: string;
  productName: string;
  trackingCode: string;
  statut: string;
  initialPosition?: { latitude: number; longitude: number };
}

export default function DeliveriesList() {
  const [trackingDialog, setTrackingDialog] = useState<TrackingDialogData | null>(null);

  const { data: deliveries, isLoading } = useQuery({
    queryKey: ['admin-deliveries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deliveries')
        .select(`
          *,
          orders(montant, adresse_livraison, telephone_destinataire, nom_destinataire, products(nom)),
          users!deliveries_acheteur_id_fkey(nom, telephone),
          users!deliveries_vendeur_id_fkey(nom),
          users!deliveries_livreur_id_fkey(nom, telephone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    refetchInterval: 15000,
  });

  const handleTrack = async (delivery: any) => {
    // Récupérer la dernière position du livreur
    let initialPosition;
    if (delivery.livreur_id) {
      const { data: locationData } = await supabase
        .from('courier_locations')
        .select('latitude, longitude')
        .eq('delivery_id', delivery.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (locationData) {
        initialPosition = {
          latitude: Number(locationData.latitude),
          longitude: Number(locationData.longitude),
        };
      }
    }

    setTrackingDialog({
      deliveryId: delivery.id,
      courierName: (delivery as any).users_deliveries_livreur_id_fkey?.nom || 'Non assigné',
      buyerName: (delivery as any).users_deliveries_acheteur_id_fkey?.nom || '-',
      productName: delivery.orders?.products?.nom || '-',
      trackingCode: delivery.tracking_code || '-',
      statut: delivery.statut,
      initialPosition,
    });
  };

  const getStatusBadge = (statut: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      en_attente: { variant: 'secondary', label: 'En attente' },
      assigné: { variant: 'outline', label: 'Assigné' },
      en_route: { variant: 'default', label: 'En route' },
      en_livraison: { variant: 'default', label: 'En livraison' },
      livré: { variant: 'default', label: 'Livré' },
      annulé: { variant: 'destructive', label: 'Annulé' },
    };
    const config = variants[statut] || { variant: 'outline', label: statut };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <>
      <AdminNavbar />
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Gestion des livraisons
            </CardTitle>
            <CardDescription>Liste de toutes les livraisons avec traçabilité en temps réel</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : deliveries && deliveries.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Acheteur</TableHead>
                      <TableHead>Vendeur</TableHead>
                      <TableHead>Livreur</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Code tracking</TableHead>
                      <TableHead>Date assignation</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveries.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell className="font-medium">
                          {delivery.orders?.products?.nom || '-'}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{(delivery as any).users_deliveries_acheteur_id_fkey?.nom || '-'}</div>
                            <div className="text-xs text-muted-foreground">
                              {(delivery as any).users_deliveries_acheteur_id_fkey?.telephone || ''}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {(delivery as any).users_deliveries_vendeur_id_fkey?.nom || '-'}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{(delivery as any).users_deliveries_livreur_id_fkey?.nom || 'Non assigné'}</div>
                            <div className="text-xs text-muted-foreground">
                              {(delivery as any).users_deliveries_livreur_id_fkey?.telephone || ''}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {delivery.orders?.montant ? `${delivery.orders.montant} FCFA` : '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(delivery.statut)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {delivery.tracking_code || '-'}
                        </TableCell>
                        <TableCell>
                          {delivery.date_assignation ? format(new Date(delivery.date_assignation), 'dd MMM yyyy HH:mm', { locale: fr }) : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTrack(delivery)}
                            disabled={!delivery.livreur_id}
                            className="gap-1"
                          >
                            <Navigation className="h-4 w-4" />
                            Suivre
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucune livraison trouvée
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de traçabilité */}
      <Dialog open={!!trackingDialog} onOpenChange={(open) => !open && setTrackingDialog(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Traçabilité de la livraison
            </DialogTitle>
            <DialogDescription>
              Suivi en temps réel du livreur et du colis
            </DialogDescription>
          </DialogHeader>

          {trackingDialog && (
            <div className="flex flex-col h-full gap-4">
              {/* Informations de la livraison */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Package className="h-4 w-4" />
                    Produit
                  </div>
                  <div className="font-medium text-sm">{trackingDialog.productName}</div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <User className="h-4 w-4" />
                    Livreur
                  </div>
                  <div className="font-medium text-sm">{trackingDialog.courierName}</div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <User className="h-4 w-4" />
                    Destinataire
                  </div>
                  <div className="font-medium text-sm">{trackingDialog.buyerName}</div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Clock className="h-4 w-4" />
                    Statut
                  </div>
                  <div>{getStatusBadge(trackingDialog.statut)}</div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Code de suivi: <span className="font-mono font-medium">{trackingDialog.trackingCode}</span>
              </div>

              {/* Carte */}
              <div className="flex-1 min-h-[300px] rounded-lg overflow-hidden border">
                {trackingDialog.initialPosition ? (
                  <DeliveryMap
                    deliveryId={trackingDialog.deliveryId}
                    initialPosition={trackingDialog.initialPosition}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-muted/30">
                    <div className="text-center text-muted-foreground">
                      <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Aucune position disponible</p>
                      <p className="text-sm">Le livreur n'a pas encore partagé sa position</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}