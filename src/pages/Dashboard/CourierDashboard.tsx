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
        console.error('Error fetching courier deliveries:', error);
        throw error;
      }
      console.log('Courier deliveries fetched:', data?.length || 0);
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
  const completedDeliveries = deliveries?.filter(d => d.statut === 'livré' || d.statut === 'livrée') || [];

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

      // Update delivery status to 'livré' - this will trigger the database trigger
      const { error: deliveryError } = await supabase
        .from('deliveries')
        .update({ 
          statut: 'livré', 
          date_livraison: new Date().toISOString() 
        })
        .eq('id', deliveryId);

      if (deliveryError) throw deliveryError;

      // The database trigger 'on_delivery_complete' will:
      // 1. Update validations.livreur_ok = true
      // 2. Send notification to buyer
      // 3. Update order status to 'livré'
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courier-deliveries'] });
      toast.success('Livraison terminée ! L\'acheteur a été notifié pour confirmer la réception.');
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
      case 'livré':
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
                      <TableHead>ID</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Destinataire</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...pendingDeliveries, ...activeDeliveries].map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell className="font-mono text-sm">
                          {delivery.id.slice(0, 8)}
                          <div className="text-xs text-muted-foreground mt-1">
                            Code: {delivery.tracking_code?.slice(0, 12) || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{delivery.orders?.products?.nom || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">Qté: {delivery.orders?.quantite || 1}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {delivery.orders?.nom_destinataire && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span className="font-medium">{delivery.orders.nom_destinataire}</span>
                              </div>
                            )}
                            {delivery.orders?.telephone_destinataire && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <a href={`tel:${delivery.orders.telephone_destinataire}`} className="text-primary hover:underline">
                                  {delivery.orders.telephone_destinataire}
                                </a>
                              </div>
                            )}
                            {delivery.orders?.adresse_livraison && (
                              <div className="flex items-start gap-1">
                                <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
                                <span className="text-muted-foreground max-w-[200px]">{delivery.orders.adresse_livraison}</span>
                              </div>
                            )}
                            {!delivery.orders?.nom_destinataire && !delivery.orders?.telephone_destinataire && (
                              <span className="text-muted-foreground italic">Non renseigné</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(delivery.statut)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {delivery.statut === 'en_attente' && (
                              <Button
                                size="sm"
                                onClick={() => acceptDelivery.mutate(delivery.id)}
                                disabled={acceptDelivery.isPending}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
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
                                <TruckIcon className="mr-1 h-3 w-3" />
                                Marquer livrée
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {pendingDeliveries.length === 0 && activeDeliveries.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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