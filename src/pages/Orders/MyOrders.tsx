import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Package, CheckCircle, AlertTriangle, MapPin, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { RatingDialog } from '@/components/couriers/RatingDialog';
import { useState } from 'react';

const MyOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [ratingDialog, setRatingDialog] = useState<{
    isOpen: boolean;
    deliveryId: string;
    courierId: string;
    courierName: string;
    existingRating?: any;
  }>({
    isOpen: false,
    deliveryId: '',
    courierId: '',
    courierName: '',
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products(*),
          validations(*),
          deliveries(
            *,
            courier:users!deliveries_livreur_id_fkey(id, nom)
          )
        `)
        .eq('acheteur_id', user?.id)
        .neq('statut', 'en_attente_paiement')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Récupérer les évaluations existantes
      const ordersWithRatings = await Promise.all(
        data.map(async (order) => {
          if (order.deliveries?.[0]?.id) {
            const { data: rating } = await supabase
              .from('courier_ratings')
              .select('*')
              .eq('delivery_id', order.deliveries[0].id)
              .eq('acheteur_id', user?.id)
              .maybeSingle();

            return { ...order, courierRating: rating };
          }
          return { ...order, courierRating: null };
        })
      );

      return ordersWithRatings;
    },
    enabled: !!user?.id,
  });

  const validateOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase.functions.invoke('confirm-reception', {
        body: { orderId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      toast.success('✅ Réception confirmée - Paiement libéré au vendeur');
    },
    onError: (error: any) => {
      console.error('Validation error:', error);
      toast.error(error?.message || 'Erreur lors de la validation');
    },
  });

  const openDispute = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ statut: 'litige' })
        .eq('id', orderId);

      if (error) throw error;

      const { data: order } = await supabase
        .from('orders')
        .select('vendeur_id')
        .eq('id', orderId)
        .single();

      if (order) {
        await supabase.from('notifications').insert({
          user_id: order.vendeur_id,
          message: 'Un litige a été ouvert sur une de vos commandes.',
          canal: 'app',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      toast.success('Litige ouvert');
    },
    onError: () => {
      toast.error('Erreur lors de l\'ouverture du litige');
    },
  });

  const getStatusBadge = (statut: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      'en_attente_paiement': { variant: 'outline', label: 'En attente paiement' },
      'fonds_bloques': { variant: 'secondary', label: 'Fonds bloqués' },
      'en_attente_livreur': { variant: 'secondary', label: 'En attente livreur' },
      'en_livraison': { variant: 'default', label: 'En livraison' },
      'livré': { variant: 'default', label: 'Livré' },
      'litige': { variant: 'destructive', label: 'Litige' },
      'terminé': { variant: 'secondary', label: 'Terminé' },
    };

    const config = statusConfig[statut] || { variant: 'outline' as const, label: statut };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container py-8 flex-1">
        <h1 className="text-4xl font-bold mb-8 flex items-center gap-2">
          <Package className="h-8 w-8" />
          Mes Commandes
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Historique de mes commandes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">Chargement...</div>
            ) : orders && orders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          #{order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>{order.products?.nom || 'N/A'}</TableCell>
                        <TableCell>{order.quantite}</TableCell>
                        <TableCell className="font-semibold">
                          {order.montant.toLocaleString()} FCFA
                        </TableCell>
                        <TableCell>{getStatusBadge(order.statut)}</TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            {/* Bouton de suivi pour les commandes en livraison */}
                            {(order.statut === 'en_livraison' || order.statut === 'livré') && 
                             Array.isArray(order.deliveries) && order.deliveries.length > 0 && (
                              <Link to={`/suivi-livraison/${order.deliveries[0].id}`}>
                                <Button size="sm" variant="outline" className="gap-2">
                                  <MapPin className="h-4 w-4" />
                                  Suivre
                                </Button>
                              </Link>
                            )}
                            
                            {/* Bouton pour noter le livreur après livraison */}
                            {order.statut === 'livré' && 
                             order.deliveries?.[0]?.courier && (
                              <Button
                                size="sm"
                                variant={order.courierRating ? "outline" : "secondary"}
                                onClick={() => setRatingDialog({
                                  isOpen: true,
                                  deliveryId: order.deliveries[0].id,
                                  courierId: order.deliveries[0].courier.id,
                                  courierName: order.deliveries[0].courier.nom,
                                  existingRating: order.courierRating,
                                })}
                              >
                                <Star className={`h-4 w-4 mr-1 ${order.courierRating ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                {order.courierRating ? 'Modifier note' : 'Noter livreur'}
                              </Button>
                            )}
                            
                            {order.statut === 'livré' && !order.validations?.acheteur_ok && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => validateOrder.mutate(order.id)}
                                  disabled={validateOrder.isPending}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Confirmer
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => openDispute.mutate(order.id)}
                                  disabled={openDispute.isPending}
                                >
                                  <AlertTriangle className="mr-2 h-4 w-4" />
                                  Litige
                                </Button>
                              </>
                            )}
                            {order.validations?.acheteur_ok && (
                              <Badge variant="secondary" className="gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Confirmé
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune commande pour le moment</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />

      {/* Dialog pour noter le livreur */}
      {ratingDialog.isOpen && (
        <RatingDialog
          deliveryId={ratingDialog.deliveryId}
          courierId={ratingDialog.courierId}
          courierName={ratingDialog.courierName}
          isOpen={ratingDialog.isOpen}
          onClose={() => setRatingDialog({ ...ratingDialog, isOpen: false })}
          existingRating={ratingDialog.existingRating}
        />
      )}
    </div>
  );
};

export default MyOrders;
