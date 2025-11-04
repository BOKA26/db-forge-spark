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
import { TruckIcon, CheckCircle, Package, User, Phone, MapPin, Bell } from 'lucide-react';
import { toast } from 'sonner';

const CourierDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch courier profile
  const { data: courierProfile } = useQuery({
    queryKey: ['courier-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch all deliveries
  const { data: deliveries, isLoading: deliveriesLoading } = useQuery({
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
        console.error('Error fetching deliveries:', error);
        throw error;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch notifications
  const { data: notifications } = useQuery({
    queryKey: ['courier-notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Filter deliveries
  const pendingDeliveries = deliveries?.filter(d => d.statut === 'en_attente') || [];
  const activeDeliveries = deliveries?.filter(d => d.statut === 'en_livraison') || [];
  const completedDeliveries = deliveries?.filter(d => d.statut === 'livrée') || [];

  // Accept delivery mutation
  const acceptDelivery = useMutation({
    mutationFn: async (deliveryId: string) => {
      const { error } = await supabase
        .from('deliveries')
        .update({ 
          statut: 'en_livraison',
          date_assignation: new Date().toISOString()
        })
        .eq('id', deliveryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courier-deliveries'] });
      toast.success('Livraison acceptée');
    },
    onError: () => {
      toast.error('Erreur lors de l\'acceptation');
    },
  });

  const markAsDelivered = useMutation({
    mutationFn: async (deliveryId: string) => {
      const delivery = deliveries?.find(d => d.id === deliveryId);
      if (!delivery) throw new Error('Delivery not found');

      // Update delivery status
      const { error: deliveryError } = await supabase
        .from('deliveries')
        .update({ statut: 'livrée', date_livraison: new Date().toISOString() })
        .eq('id', deliveryId);

      if (deliveryError) throw deliveryError;

      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ statut: 'livré' })
        .eq('id', delivery.order_id);

      if (orderError) throw orderError;

      // Update validation
      const { error: validationError } = await supabase
        .from('validations')
        .update({ livreur_ok: true })
        .eq('order_id', delivery.order_id);

      if (validationError) throw validationError;

      // Send notification to buyer
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
      toast.success('Livraison marquée comme effectuée');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });


  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return <Badge className="bg-red-500 hover:bg-red-600">En attente</Badge>;
      case 'en_livraison':
        return <Badge className="bg-orange-500 hover:bg-orange-600">En cours</Badge>;
      case 'livrée':
        return <Badge className="bg-green-500 hover:bg-green-600">Livrée</Badge>;
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8 flex items-center gap-2">
          <TruckIcon className="h-8 w-8" />
          Dashboard Livreur
        </h1>

        {/* Profile Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Mon Profil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Nom</p>
                  <p className="font-medium">{courierProfile?.nom || 'Non renseigné'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Zone</p>
                  <p className="font-medium">{courierProfile?.pays || 'Non renseigné'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{courierProfile?.telephone || 'Non renseigné'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
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

        {/* Tabs for different sections */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Mes Livraisons</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Active Deliveries */}
          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Mes Livraisons Actives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Livraison</TableHead>
                      <TableHead>Commande</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date d'assignation</TableHead>
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
                          {delivery.orders?.id?.slice(0, 8) || 'N/A'}
                        </TableCell>
                        <TableCell>{delivery.orders?.products?.nom || 'N/A'}</TableCell>
                        <TableCell>{getStatusBadge(delivery.statut)}</TableCell>
                        <TableCell>
                          {delivery.date_assignation 
                            ? new Date(delivery.date_assignation).toLocaleDateString('fr-FR')
                            : 'Non assignée'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
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
                                variant="default"
                                onClick={() => markAsDelivered.mutate(delivery.id)}
                                disabled={markAsDelivered.isPending}
                              >
                                Marquer livrée
                              </Button>
                            )}
                          </div>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* History */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Historique des Livraisons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Livraison</TableHead>
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

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications?.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-3 p-4 rounded-lg border"
                    >
                      <Bell className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!notifications || notifications.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucune notification
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default CourierDashboard;