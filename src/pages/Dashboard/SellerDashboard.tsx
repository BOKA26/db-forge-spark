import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Package, CheckCircle, User, Mail, Phone, TrendingUp, Clock, DollarSign, Bell, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const SellerDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: products } = useQuery({
    queryKey: ['seller-products', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendeur_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: orders } = useQuery({
    queryKey: ['seller-orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products(*),
          validations(*)
        `)
        .eq('vendeur_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: payments } = useQuery({
    queryKey: ['seller-payments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          orders!inner(vendeur_id)
        `)
        .eq('orders.vendeur_id', user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: notifications } = useQuery({
    queryKey: ['seller-notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Calculate statistics
  const totalSales = payments?.reduce((sum, p) => sum + Number(p.montant), 0) || 0;
  const unlockedPayments = payments?.filter(p => p.statut === 'débloqué').reduce((sum, p) => sum + Number(p.montant), 0) || 0;
  const pendingSales = orders?.filter(o => o.statut === 'fonds_bloques' || o.statut === 'en_livraison').length || 0;

  const markAsShipped = useMutation({
    mutationFn: async (orderId: string) => {
      // Update validations
      const { error: validationError } = await supabase
        .from('validations')
        .update({ vendeur_ok: true })
        .eq('order_id', orderId);

      if (validationError) throw validationError;

      // Update delivery status
      const { error: deliveryError } = await supabase
        .from('deliveries')
        .update({ 
          statut: 'en_livraison',
          date_assignation: new Date().toISOString()
        })
        .eq('order_id', orderId);

      if (deliveryError) throw deliveryError;

      // Get order to send notification to buyer
      const { data: order } = await supabase
        .from('orders')
        .select('acheteur_id')
        .eq('id', orderId)
        .single();

      if (order) {
        await supabase.from('notifications').insert({
          user_id: order.acheteur_id,
          message: 'Votre commande est en cours de livraison.',
          canal: 'app',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      toast.success('Commande marquée comme expédiée');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="container py-8 space-y-8">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Mon Profil Vendeur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Nom</p>
                  <p className="font-medium">{userProfile?.nom || 'Non renseigné'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{userProfile?.email || 'Non renseigné'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{userProfile?.telephone || 'Non renseigné'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total des ventes</p>
                  <p className="text-2xl font-bold">{totalSales.toLocaleString()} FCFA</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ventes en attente</p>
                  <p className="text-2xl font-bold">{pendingSales}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Paiements débloqués</p>
                  <p className="text-2xl font-bold">{unlockedPayments.toLocaleString()} FCFA</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">Mes Produits</TabsTrigger>
            <TabsTrigger value="orders">Commandes Reçues</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un produit
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map((product) => (
                <Card key={product.id}>
                  <CardContent className="pt-6">
                    <div className="aspect-square bg-muted rounded-lg mb-4" />
                    <h3 className="font-semibold mb-2">{product.nom}</h3>
                    <p className="text-xl font-bold text-primary mb-2">
                      {product.prix.toLocaleString()} FCFA
                    </p>
                    <div className="flex justify-between text-sm text-muted-foreground mb-4">
                      <span>Stock: {product.stock}</span>
                      <Badge variant={product.statut === 'actif' ? 'default' : 'secondary'}>
                        {product.statut}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </Button>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {products?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun produit. Ajoutez votre premier produit !</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            {orders?.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Commande #{order.id.slice(0, 8)}
                    </div>
                    <Badge 
                      variant={
                        order.statut === 'terminé' ? 'default' : 
                        order.statut === 'en_livraison' ? 'secondary' : 
                        'outline'
                      }
                      className={
                        order.statut === 'en_livraison' ? 'bg-green-500 text-white' :
                        order.statut === 'terminé' ? 'bg-blue-500 text-white' : ''
                      }
                    >
                      {order.statut.replace(/_/g, ' ')}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-1 text-sm">Produit</h4>
                        <p>{order.products?.nom}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1 text-sm">Quantité</h4>
                        <p>{order.quantite}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-1 text-sm">Montant</h4>
                      <p className="text-xl font-bold text-primary">
                        {order.montant.toLocaleString()} FCFA
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-1 text-sm">Date de commande</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    {order.statut === 'fonds_bloques' && !order.validations?.vendeur_ok && (
                      <Button
                        onClick={() => markAsShipped.mutate(order.id)}
                        disabled={markAsShipped.isPending}
                        className="w-full"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Marquer comme expédié
                      </Button>
                    )}

                    {order.validations?.vendeur_ok && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>Expédié - En livraison</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {orders?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune commande reçue</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications Récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications && notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="border-b pb-3 last:border-b-0">
                        <p className="text-sm">{notif.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notif.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    Aucune notification
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default SellerDashboard;