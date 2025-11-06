import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Package, CheckCircle, AlertTriangle, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const MyOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['buyer-orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products(*),
          validations(*),
          deliveries(*)
        `)
        .eq('acheteur_id', user?.id)
        .neq('statut', 'en_attente_paiement')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const validateOrder = useMutation({
    mutationFn: async (orderId: string) => {
      // 1. Marquer l'acheteur comme OK
      const { error } = await supabase
        .from('validations')
        .update({ acheteur_ok: true })
        .eq('order_id', orderId);

      if (error) throw error;

      // 2. Le trigger unlock_payment_on_full_validation se déclenchera automatiquement
      // et libérera le paiement si toutes les validations sont OK

      // 3. Récupérer les infos de la commande pour les notifications
      const { data: order } = await supabase
        .from('orders')
        .select('vendeur_id, livreur_id, montant')
        .eq('id', orderId)
        .single();

      if (order) {
        // Notifier le vendeur
        await supabase.from('notifications').insert({
          user_id: order.vendeur_id,
          message: `💰 Paiement de ${order.montant.toLocaleString()} FCFA libéré suite à la confirmation de réception par l'acheteur.`,
          canal: 'app',
        });

        // Notifier le livreur
        if (order.livreur_id) {
          await supabase.from('notifications').insert({
            user_id: order.livreur_id,
            message: '✅ Livraison validée par le client. Merci pour votre service !',
            canal: 'app',
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] });
      toast.success('✅ Réception confirmée');
    },
    onError: () => {
      toast.error('Erreur lors de la validation');
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
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] });
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
                          <div className="flex gap-2">
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
    </div>
  );
};

export default MyOrders;
