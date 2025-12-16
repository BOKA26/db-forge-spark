import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TruckIcon, CheckCircle, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { CourierLocationSharing } from '@/components/tracking/CourierLocationSharing';

const MyDeliveries = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: deliveries, isLoading } = useQuery({
    queryKey: ['courier-deliveries', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deliveries')
        .select(`
          *,
          orders(
            *,
            products(*),
            validations(*)
          )
        `)
        .eq('livreur_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching courier deliveries:', error);
        throw error;
      }
      console.log('Courier deliveries fetched:', data?.length || 0);
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const pendingDeliveries = deliveries?.filter(d => d.statut === 'en_attente') || [];
  const activeDeliveries = deliveries?.filter(d => d.statut === 'en_livraison') || [];
  const completedDeliveries = deliveries?.filter(d => d.statut === 'livrée') || [];

  const acceptDelivery = useMutation({
    mutationFn: async (deliveryId: string) => {
      const delivery = deliveries?.find(d => d.id === deliveryId);
      if (!delivery) throw new Error('Delivery not found');

      // 1. Mettre à jour la livraison
      const { error } = await supabase
        .from('deliveries')
        .update({ 
          statut: 'en_livraison',
          date_assignation: new Date().toISOString()
        })
        .eq('id', deliveryId);

      if (error) throw error;

      // 2. Mettre à jour la commande
      await supabase
        .from('orders')
        .update({ statut: 'en_livraison' })
        .eq('id', delivery.order_id);

      // 3. Notifier le vendeur et l'acheteur
      await supabase.from('notifications').insert([
        {
          user_id: delivery.vendeur_id,
          message: `🚚 Le livreur a accepté la livraison de votre commande.`,
          canal: 'app',
        },
        {
          user_id: delivery.acheteur_id,
          message: `📦 Votre colis est en route ! Suivez votre livraison en temps réel.`,
          canal: 'app',
        }
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courier-deliveries'] });
      toast.success('✅ Livraison acceptée');
    },
  });

  const markAsDelivered = useMutation({
    mutationFn: async (deliveryId: string) => {
      const delivery = deliveries?.find(d => d.id === deliveryId);
      if (!delivery) throw new Error('Delivery not found');

      const { error: deliveryError } = await supabase
        .from('deliveries')
        .update({ statut: 'livrée', date_livraison: new Date().toISOString() })
        .eq('id', deliveryId);

      if (deliveryError) throw deliveryError;

      const { error: orderError } = await supabase
        .from('orders')
        .update({ statut: 'livré' })
        .eq('id', delivery.order_id);

      if (orderError) throw orderError;

      const { error: validationError } = await supabase
        .from('validations')
        .update({ livreur_ok: true })
        .eq('order_id', delivery.order_id);

      if (validationError) throw validationError;

      const { data: order } = await supabase
        .from('orders')
        .select('acheteur_id')
        .eq('id', delivery.order_id)
        .single();

      if (order) {
        await supabase.from('notifications').insert({
          user_id: order.acheteur_id,
          message: 'Votre colis est livré. Merci de confirmer la réception.',
          canal: 'app',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courier-deliveries'] });
      toast.success('✅ Livraison effectuée');
    },
  });

  const getStatusBadge = (statut: string) => {
    const statusConfig: Record<string, { className: string, label: string }> = {
      'en_attente': { className: 'bg-red-500 hover:bg-red-600', label: 'En attente' },
      'en_livraison': { className: 'bg-orange-500 hover:bg-orange-600', label: 'En cours' },
      'livrée': { className: 'bg-green-500 hover:bg-green-600', label: 'Livrée' },
    };
    const config = statusConfig[statut] || { className: '', label: statut };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container py-8 flex-1">
        <h1 className="text-4xl font-bold mb-8 flex items-center gap-2">
          <TruckIcon className="h-8 w-8" />
          Mes Livraisons
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">En attente</p>
                <p className="text-3xl font-bold text-red-500">{pendingDeliveries.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">En cours</p>
                <p className="text-3xl font-bold text-orange-500">{activeDeliveries.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Terminées</p>
                <p className="text-3xl font-bold text-green-500">{completedDeliveries.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Actives</TabsTrigger>
            <TabsTrigger value="completed">Terminées</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="space-y-6">
              {/* Partage de position pour les livraisons en cours */}
              {activeDeliveries.length > 0 && (
                <div className="space-y-4">
                  {activeDeliveries.map((delivery) => (
                    <CourierLocationSharing key={delivery.id} deliveryId={delivery.id} />
                  ))}
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Livraisons en cours</CardTitle>
                </CardHeader>
                <CardContent>
                {isLoading ? (
                  <div className="text-center py-12">Chargement...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Référence</TableHead>
                        <TableHead>Commande</TableHead>
                        <TableHead>Produit</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...pendingDeliveries, ...activeDeliveries].map((delivery) => (
                        <TableRow key={delivery.id}>
                          <TableCell className="font-mono text-sm">
                            {delivery.id.slice(0, 8)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            #{delivery.orders?.id?.slice(0, 8) || 'N/A'}
                          </TableCell>
                          <TableCell>{delivery.orders?.products?.nom || 'N/A'}</TableCell>
                          <TableCell>{getStatusBadge(delivery.statut)}</TableCell>
                          <TableCell>
                            {delivery.date_assignation 
                              ? new Date(delivery.date_assignation).toLocaleDateString('fr-FR')
                              : 'Non assignée'}
                          </TableCell>
                          <TableCell>
                            {delivery.statut === 'en_attente' && (
                              <Button
                                size="sm"
                                onClick={() => acceptDelivery.mutate(delivery.id)}
                                disabled={acceptDelivery.isPending}
                              >
                                Accepter
                              </Button>
                            )}
                            {delivery.statut === 'en_livraison' && (
                              <Button
                                size="sm"
                                onClick={() => markAsDelivered.mutate(delivery.id)}
                                disabled={markAsDelivered.isPending}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Marquer livrée
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {pendingDeliveries.length === 0 && activeDeliveries.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Aucune livraison active
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Historique</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Date de livraison</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedDeliveries.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell className="font-mono text-sm">
                          {delivery.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>{delivery.orders?.products?.nom || 'N/A'}</TableCell>
                        <TableCell>
                          {delivery.date_livraison 
                            ? new Date(delivery.date_livraison).toLocaleDateString('fr-FR')
                            : 'N/A'}
                        </TableCell>
                        <TableCell>{getStatusBadge(delivery.statut)}</TableCell>
                      </TableRow>
                    ))}
                    {completedDeliveries.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          Aucune livraison terminée
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default MyDeliveries;
