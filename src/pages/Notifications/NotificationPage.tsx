import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Bell, CheckCheck, Package, CheckCircle, AlertTriangle, Truck, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';

const NotificationPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['user-notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch orders pending buyer confirmation
  const { data: pendingOrders } = useQuery({
    queryKey: ['pending-confirmation-orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products(nom, images),
          validations(acheteur_ok, livreur_ok),
          deliveries(statut)
        `)
        .eq('acheteur_id', user?.id)
        .eq('statut', 'livré')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Filter to only show orders where acheteur_ok is false
      return data?.filter(order => !order.validations?.acheteur_ok) || [];
    },
    enabled: !!user?.id,
  });

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ lue: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
      toast.success('Notification marquée comme lue');
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ lue: true })
        .eq('user_id', user?.id)
        .eq('lue', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
      toast.success('Toutes les notifications marquées comme lues');
    },
  });

  const confirmDelivery = useMutation({
    mutationFn: async (orderId: string) => {
      // Update validation - this will trigger the unlock_payment function
      const { error } = await supabase
        .from('validations')
        .update({ acheteur_ok: true })
        .eq('order_id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-confirmation-orders'] });
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] });
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
      toast.success('Réception confirmée ! Le paiement a été débloqué.');
    },
    onError: () => {
      toast.error('Erreur lors de la confirmation');
    },
  });

  const openDispute = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ statut: 'litige' })
        .eq('id', orderId);

      if (error) throw error;

      // Notify seller
      const { data: order } = await supabase
        .from('orders')
        .select('vendeur_id')
        .eq('id', orderId)
        .single();

      if (order) {
        await supabase.from('notifications').insert({
          user_id: order.vendeur_id,
          message: '⚠️ Un litige a été ouvert sur une de vos commandes.',
          canal: 'app',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-confirmation-orders'] });
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] });
      toast.success('Litige ouvert, un administrateur va traiter votre demande');
    },
    onError: () => {
      toast.error("Erreur lors de l'ouverture du litige");
    },
  });

  const unreadCount = notifications?.filter(n => !n.lue).length || 0;
  const pendingCount = pendingOrders?.length || 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container py-8 flex-1">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notifications
            {unreadCount > 0 && (
              <span className="text-lg font-normal text-muted-foreground">
                ({unreadCount} non lue{unreadCount > 1 ? 's' : ''})
              </span>
            )}
          </h1>
          {unreadCount > 0 && (
            <Button
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {/* Pending Confirmations Section */}
        {pendingCount > 0 && (
          <Card className="mb-8 border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Package className="h-5 w-5" />
                Commandes en attente de confirmation ({pendingCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Ces commandes ont été livrées. Confirmez la réception pour débloquer le paiement au vendeur.
              </p>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut livraison</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingOrders?.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {order.products?.images?.[0] && (
                              <img
                                src={order.products.images[0]}
                                alt={order.products?.nom}
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <span className="font-medium">{order.products?.nom || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {order.montant.toLocaleString()} FCFA
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="gap-1">
                            <Truck className="h-3 w-3" />
                            Livré
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => confirmDelivery.mutate(order.id)}
                              disabled={confirmDelivery.isPending}
                              className="gap-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Confirmer
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openDispute.mutate(order.id)}
                              disabled={openDispute.isPending}
                              className="gap-1"
                            >
                              <AlertTriangle className="h-4 w-4" />
                              Litige
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Toutes mes notifications</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard-acheteur')}>
              <Eye className="mr-2 h-4 w-4" />
              Voir mes commandes
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">Chargement...</div>
            ) : notifications && notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                      !notif.lue ? 'bg-primary/5 border-primary/20' : 'bg-card'
                    }`}
                  >
                    <Bell className={`h-5 w-5 mt-0.5 ${!notif.lue ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="flex-1">
                      <p className={`text-sm ${!notif.lue ? 'font-medium' : ''}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notif.created_at).toLocaleString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {!notif.lue && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead.mutate(notif.id)}
                        disabled={markAsRead.isPending}
                      >
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune notification</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default NotificationPage;
