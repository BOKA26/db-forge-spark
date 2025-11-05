import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Package, CheckCircle, AlertTriangle, User, Mail, Phone, Bell, Store, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useUserRoles } from '@/hooks/useUserRole';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: userRoles } = useUserRoles();

  const addRoleMutation = useMutation({
    mutationFn: async (newRole: 'vendeur' | 'livreur') => {
      if (!user) throw new Error('User not authenticated');

      // Désactiver tous les rôles actuels
      await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Ajouter et activer le nouveau rôle
      const { error } = await supabase
        .from('user_roles')
        .insert([{
          user_id: user.id,
          role: newRole,
          is_active: true,
        }]);

      if (error) throw error;
      return newRole;
    },
    onSuccess: (newRole) => {
      queryClient.invalidateQueries({ queryKey: ['userRole'] });
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
      
      if (newRole === 'vendeur') {
        toast.success('Rôle vendeur activé ! Créez votre boutique.');
        navigate('/creer-boutique');
      } else if (newRole === 'livreur') {
        toast.success('Rôle livreur activé !');
        navigate('/dashboard-livreur');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'ajout du rôle');
    },
  });

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

  const { data: orders } = useQuery({
    queryKey: ['buyer-orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products(*),
          validations(*)
        `)
        .eq('acheteur_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: notifications } = useQuery({
    queryKey: ['user-notifications', user?.id],
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

  const openDispute = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ statut: 'litige' })
        .eq('id', orderId);

      if (error) throw error;

      // Get order to send notification to admin
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
      toast.success('Litige ouvert, un administrateur va traiter votre demande');
    },
    onError: () => {
      toast.error('Erreur lors de l\'ouverture du litige');
    },
  });

  const validateOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('validations')
        .update({ acheteur_ok: true })
        .eq('order_id', orderId);

      if (error) throw error;

      // Update order status to 'livré'
      await supabase
        .from('orders')
        .update({ statut: 'livré' })
        .eq('id', orderId);

      // Get order to send notification to vendor
      const { data: order } = await supabase
        .from('orders')
        .select('vendeur_id')
        .eq('id', orderId)
        .single();

      if (order) {
        await supabase.from('notifications').insert({
          user_id: order.vendeur_id,
          message: 'Le paiement a été libéré suite à la confirmation de réception.',
          canal: 'app',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] });
      toast.success('Réception confirmée, paiement libéré');
    },
    onError: () => {
      toast.error('Erreur lors de la validation');
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
        <h1 className="text-4xl font-bold mb-8">Dashboard Acheteur</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Section Profil */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Mon Profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nom</p>
                    <p className="font-semibold">{userProfile?.nom || 'Non renseigné'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">{userProfile?.email || 'Non renseigné'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-semibold">{userProfile?.telephone || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Devenir Vendeur ou Livreur */}
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="text-lg">Développez votre activité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!userRoles?.some(r => r.role === 'vendeur') && (
                <div>
                  <Button 
                    onClick={() => addRoleMutation.mutate('vendeur')} 
                    className="w-full gap-2"
                    variant="default"
                    disabled={addRoleMutation.isPending}
                  >
                    <Store className="h-4 w-4" />
                    Créer ma boutique
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Devenez vendeur et développez votre business
                  </p>
                </div>
              )}
              
              {!userRoles?.some(r => r.role === 'livreur') && (
                <div>
                  <Button 
                    onClick={() => addRoleMutation.mutate('livreur')} 
                    className="w-full gap-2"
                    variant="outline"
                    disabled={addRoleMutation.isPending}
                  >
                    <Plus className="h-4 w-4" />
                    Devenir livreur
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Effectuez des livraisons et gagnez de l'argent
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Section Mes Commandes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Mes Commandes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders && orders.length > 0 ? (
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
                            {order.statut === 'litige' && (
                              <Badge variant="destructive">En cours</Badge>
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

        {/* Section Notifications */}
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
                  <div
                    key={notif.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                  >
                    <Bell className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notif.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-10 w-10 mx-auto mb-3 opacity-50" />
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

export default BuyerDashboard;