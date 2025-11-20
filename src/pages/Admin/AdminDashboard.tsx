import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminNavbar } from '@/components/layout/AdminNavbar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Store, CheckCircle, Clock, Package, Eye, CreditCard, Users, ShoppingCart, Truck } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        totalShops,
        activeShops,
        pendingShops,
        totalProducts,
        totalUsers,
        totalOrders,
        pendingOrdersCount,
        totalDeliveries,
        totalPayments
      ] = await Promise.all([
        supabase.from('shops').select('*', { count: 'exact', head: true }),
        supabase.from('shops').select('*', { count: 'exact', head: true }).eq('statut', 'actif'),
        supabase.from('shops').select('*', { count: 'exact', head: true }).eq('statut', 'en_attente'),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('statut', 'en_attente_paiement'),
        supabase.from('deliveries').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('*', { count: 'exact', head: true }),
      ]);

      return {
        totalShops: totalShops.count || 0,
        activeShops: activeShops.count || 0,
        pendingShops: pendingShops.count || 0,
        totalProducts: totalProducts.count || 0,
        totalUsers: totalUsers.count || 0,
        totalOrders: totalOrders.count || 0,
        pendingOrdersCount: pendingOrdersCount.count || 0,
        totalDeliveries: totalDeliveries.count || 0,
        totalPayments: totalPayments.count || 0,
      };
    },
  });

  const { data: recentShops, isLoading: shopsLoading } = useQuery({
    queryKey: ['admin-recent-shops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const { data: pendingOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['pending-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products(*),
          users!orders_acheteur_id_fkey(nom, email)
        `)
        .eq('statut', 'en_attente_paiement')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const simulatePayment = useMutation({
    mutationFn: async (orderId: string) => {
      const order = pendingOrders?.find(o => o.id === orderId);
      if (!order) throw new Error('Order not found');

      // Update order status to fonds_bloques
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          statut: 'fonds_bloques',
          reference_gateway: `TEST-${Date.now()}`
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: orderId,
          montant: order.montant,
          mode: 'Test',
          statut: 'bloqué',
          reference_gateway: `TEST-${Date.now()}`,
        });

      if (paymentError) throw paymentError;

      // Create delivery record
      const { error: deliveryError } = await supabase
        .from('deliveries')
        .insert({
          order_id: orderId,
          vendeur_id: order.vendeur_id,
          acheteur_id: order.acheteur_id,
          statut: 'en_attente',
        });

      if (deliveryError && deliveryError.code !== '23505') {
        throw deliveryError;
      }

      // Send notifications
      await supabase.from('notifications').insert([
        {
          user_id: order.acheteur_id,
          message: '✅ Votre paiement a été sécurisé avec succès (TEST).',
          canal: 'app',
        },
        {
          user_id: order.vendeur_id,
          message: '🎉 Nouvelle commande payée. Préparez l\'expédition.',
          canal: 'app',
        },
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-orders'] });
      toast.success('💳 Paiement simulé avec succès !');
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const getStatusBadge = (statut: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      en_attente: { variant: 'secondary', label: 'En attente' },
      actif: { variant: 'default', label: 'Active' },
      suspendu: { variant: 'destructive', label: 'Suspendue' },
    };
    const config = variants[statut] || { variant: 'outline', label: statut };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const statCards = [
    {
      title: 'Total Boutiques',
      value: stats?.totalShops || 0,
      icon: Store,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/admin/boutiques',
    },
    {
      title: 'Boutiques Actives',
      value: stats?.activeShops || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/admin/boutiques',
    },
    {
      title: 'Boutiques en attente',
      value: stats?.pendingShops || 0,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      link: '/admin/boutiques',
    },
    {
      title: 'Produits',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      link: '/admin/products',
    },
    {
      title: 'Utilisateurs',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      link: '/admin/users',
    },
    {
      title: 'Commandes',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      link: '/admin/orders',
    },
    {
      title: 'Commandes en attente',
      value: stats?.pendingOrdersCount || 0,
      icon: Clock,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      link: '/admin/orders',
    },
    {
      title: 'Livraisons',
      value: stats?.totalDeliveries || 0,
      icon: Truck,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      link: '/admin/deliveries',
    },
    {
      title: 'Paiements',
      value: stats?.totalPayments || 0,
      icon: CreditCard,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      link: '/admin/payments',
    },
  ];

  return (
    <>
      <AdminNavbar />
      <div className="container mx-auto py-8 px-4 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tableau de bord Admin</h1>
          <p className="text-muted-foreground">Vue d'ensemble du système e-commerce</p>
        </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(stat.link)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Simulation Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Simuler des Paiements (Test)
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Commandes en attente de paiement
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : pendingOrders && pendingOrders.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Acheteur</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          #{order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>{order.users?.nom || 'N/A'}</TableCell>
                        <TableCell>{order.products?.nom || 'N/A'}</TableCell>
                        <TableCell className="font-semibold">
                          {order.montant.toLocaleString()} FCFA
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => simulatePayment.mutate(order.id)}
                            disabled={simulatePayment.isPending}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Simuler paiement
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Outil de test uniquement</strong> : Cet outil simule des paiements réussis 
                  pour tester le flow complet sans passer par Paystack.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune commande en attente de paiement</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Shops Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Dernières Boutiques Créées</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/boutiques')}>
              Voir tout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {shopsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : recentShops && recentShops.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentShops.map((shop) => (
                    <TableRow key={shop.id}>
                      <TableCell className="font-medium">{shop.nom_boutique}</TableCell>
                      <TableCell>{shop.email || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(shop.statut)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/boutique/${shop.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Aucune boutique trouvée</div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
