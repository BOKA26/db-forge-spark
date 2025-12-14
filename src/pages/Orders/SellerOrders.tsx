import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Package, CheckCircle, TruckIcon, User, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const SellerOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['seller-orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products(*),
          validations(*),
          deliveries(*)
        `)
        .eq('vendeur_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const assignCourier = useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase.functions.invoke('assign-courier', {
        body: { orderId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      toast.success('🚚 Livreur assigné avec succès !');
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message || 'Impossible d\'assigner un livreur'}`);
    },
  });

  const markAsShipped = useMutation({
    mutationFn: async (orderId: string) => {
      // 1. Marquer que le vendeur a validé l'expédition
      const { error: validationError } = await supabase
        .from('validations')
        .update({ vendeur_ok: true })
        .eq('order_id', orderId);

      if (validationError) throw validationError;

      // 2. Mettre à jour le statut de la livraison (le livreur doit encore accepter)
      const { error: deliveryError } = await supabase
        .from('deliveries')
        .update({ 
          statut: 'en_attente'
        })
        .eq('order_id', orderId);

      if (deliveryError) throw deliveryError;

      // 3. Récupérer les infos pour les notifications
      const { data: order } = await supabase
        .from('orders')
        .select('acheteur_id, livreur_id, products(nom)')
        .eq('id', orderId)
        .single();

      if (order) {
        // Notifier l'acheteur
        await supabase.from('notifications').insert({
          user_id: order.acheteur_id,
          message: '📦 Votre commande a été expédiée et sera bientôt en route.',
          canal: 'app',
        });

        // Notifier le livreur
        if (order.livreur_id) {
          await supabase.from('notifications').insert({
            user_id: order.livreur_id,
            message: `🚚 Nouvelle livraison disponible pour "${order.products?.nom}". Acceptez-la pour commencer !`,
            canal: 'app',
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      toast.success('✅ Commande expédiée');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const getStatusBadge = (statut: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      'en_attente_paiement': { variant: 'outline', label: 'En attente paiement' },
      'fonds_bloques': { variant: 'secondary', label: 'Fonds bloqués' },
      'en_attente_livreur': { variant: 'secondary', label: 'En attente livreur' },
      'en_livraison': { variant: 'default', label: 'En livraison' },
      'livré': { variant: 'default', label: 'Livré' },
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
          Mes Commandes Reçues
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Commandes à traiter</CardTitle>
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
                      <TableHead>Infos Livraison</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          #{order.id.slice(0, 8)}
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.products?.nom || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">Qté: {order.quantite}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {order.nom_destinataire && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span className="font-medium">{order.nom_destinataire}</span>
                              </div>
                            )}
                            {order.telephone_destinataire && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <a href={`tel:${order.telephone_destinataire}`} className="text-primary hover:underline">
                                  {order.telephone_destinataire}
                                </a>
                              </div>
                            )}
                            {order.adresse_livraison && (
                              <div className="flex items-start gap-1">
                                <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
                                <span className="text-muted-foreground">{order.adresse_livraison}</span>
                              </div>
                            )}
                            {!order.nom_destinataire && !order.telephone_destinataire && !order.adresse_livraison && (
                              <span className="text-muted-foreground italic">Non renseigné</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {order.montant.toLocaleString()} FCFA
                        </TableCell>
                        <TableCell>{getStatusBadge(order.statut)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {order.statut === 'fonds_bloques' && !order.validations?.vendeur_ok ? (
                              <>
                                {!Array.isArray(order.deliveries) || order.deliveries.length === 0 || !order.deliveries[0]?.livreur_id ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => assignCourier.mutate(order.id)}
                                    disabled={assignCourier.isPending}
                                  >
                                    <TruckIcon className="mr-2 h-4 w-4" />
                                    Demander un livreur
                                  </Button>
                                ) : (
                                  <Badge variant="secondary" className="mr-2">
                                    Livreur assigné
                                  </Badge>
                                )}
                                <Button
                                  size="sm"
                                  onClick={() => markAsShipped.mutate(order.id)}
                                  disabled={markAsShipped.isPending || (!Array.isArray(order.deliveries) || !order.deliveries[0]?.livreur_id)}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Expédier
                                </Button>
                              </>
                            ) : order.validations?.vendeur_ok ? (
                              <Badge variant="secondary" className="gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Expédié
                              </Badge>
                            ) : null}
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
                <p>Aucune commande reçue</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default SellerOrders;
