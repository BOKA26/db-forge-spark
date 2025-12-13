import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRole';
import { 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  MapPin, 
  Star, 
  User, 
  ShoppingCart, 
  CreditCard, 
  Bell, 
  Receipt, 
  Clock, 
  DollarSign,
  Download,
  Eye,
  Truck,
  Store,
  Lock,
  Save,
  Edit2
} from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { RatingDialog } from '@/components/couriers/RatingDialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: userRoles } = useUserRoles();
  
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

  // État pour l'édition du profil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    nom: '',
    telephone: '',
    email: '',
    pays: '',
    entreprise: ''
  });

  // État pour le changement de mot de passe
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Profil utilisateur
  const { data: userProfile } = useQuery({
    queryKey: ['buyer-profile', user?.id],
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

  // Commandes de l'acheteur
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['buyer-orders', user?.id],
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
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Récupérer les évaluations existantes
      const ordersWithRatings = await Promise.all(
        (data || []).map(async (order) => {
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

  // Paiements liés aux commandes de l'acheteur
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['buyer-payments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          orders!inner(
            acheteur_id,
            produit_id,
            quantite,
            reference_gateway,
            products(nom, images)
          )
        `)
        .eq('orders.acheteur_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['buyer-notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Marquer les notifications comme lues
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ lue: true })
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-notifications'] });
    },
  });

  // Valider la commande
  const validateOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('validations')
        .update({ acheteur_ok: true })
        .eq('order_id', orderId);

      if (error) throw error;

      const { data: order } = await supabase
        .from('orders')
        .select('vendeur_id, livreur_id, montant')
        .eq('id', orderId)
        .single();

      if (order) {
        await supabase.from('notifications').insert({
          user_id: order.vendeur_id,
          message: `💰 Paiement de ${order.montant.toLocaleString()} FCFA libéré suite à la confirmation de réception.`,
          canal: 'app',
        });

        if (order.livreur_id) {
          await supabase.from('notifications').insert({
            user_id: order.livreur_id,
            message: '✅ Livraison validée par le client. Merci !',
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

  // Ouvrir un litige
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
          message: '⚠️ Un litige a été ouvert sur une de vos commandes.',
          canal: 'app',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] });
      toast.success('Litige ouvert');
    },
    onError: () => {
      toast.error("Erreur lors de l'ouverture du litige");
    },
  });

  // Ajouter le rôle vendeur
  const addVendeurRole = useMutation({
    mutationFn: async () => {
      await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', user?.id);

      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user?.id,
          role: 'vendeur',
          is_active: true,
        }, { onConflict: 'user_id,role' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
      toast.success('🏪 Vous êtes maintenant vendeur !');
      navigate('/creer-boutique');
    },
    onError: () => {
      toast.error('Erreur lors du changement de rôle');
    },
  });

  // Ajouter le rôle livreur
  const addLivreurRole = useMutation({
    mutationFn: async () => {
      await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', user?.id);

      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user?.id,
          role: 'livreur',
          is_active: true,
        }, { onConflict: 'user_id,role' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
      toast.success('🚚 Vous êtes maintenant livreur !');
      navigate('/dashboard-livreur');
    },
    onError: () => {
      toast.error('Erreur lors du changement de rôle');
    },
  });

  // Mettre à jour le profil
  const updateProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('users')
        .update({
          nom: profileForm.nom,
          telephone: profileForm.telephone,
          email: profileForm.email,
          pays: profileForm.pays,
          entreprise: profileForm.entreprise
        })
        .eq('id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-profile'] });
      setIsEditingProfile(false);
      toast.success('✅ Profil mis à jour avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du profil');
    },
  });

  // Changer le mot de passe
  const changePassword = useMutation({
    mutationFn: async () => {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      if (passwordForm.newPassword.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setIsChangingPassword(false);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      toast.success('🔐 Mot de passe modifié avec succès');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors du changement de mot de passe');
    },
  });

  const hasRole = (role: string) => userRoles?.some(r => r.role === role);

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

  const getPaymentStatusBadge = (statut: string) => {
    if (statut === 'débloqué') return <Badge className="bg-green-500">Débloqué</Badge>;
    if (statut === 'bloqué') return <Badge variant="secondary">Bloqué</Badge>;
    if (statut === 'remboursé') return <Badge variant="outline">Remboursé</Badge>;
    return <Badge variant="outline">{statut}</Badge>;
  };

  // Statistiques
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => ['fonds_bloques', 'en_livraison'].includes(o.statut)).length;
  const completedOrders = orders.filter(o => o.statut === 'terminé' || o.statut === 'livré').length;
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.montant || 0), 0);
  const unreadNotifications = notifications.filter(n => !n.lue).length;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container py-8 flex-1 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Mon Espace Acheteur</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Gérez vos commandes, paiements et reçus en toute simplicité
            </p>
          </div>

          {/* Profile Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">{userProfile?.nom || 'Utilisateur'}</h2>
                    <p className="text-muted-foreground">{userProfile?.email}</p>
                    {userProfile?.telephone && (
                      <p className="text-sm text-muted-foreground">{userProfile.telephone}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to="/produits">
                    <Button variant="outline">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Continuer mes achats
                    </Button>
                  </Link>
                  {!hasRole('vendeur') && (
                    <Button variant="secondary" onClick={() => addVendeurRole.mutate()}>
                      <Store className="mr-2 h-4 w-4" />
                      Devenir vendeur
                    </Button>
                  )}
                  {!hasRole('livreur') && (
                    <Button variant="secondary" onClick={() => addLivreurRole.mutate()}>
                      <Truck className="mr-2 h-4 w-4" />
                      Devenir livreur
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Commandes</p>
                  <p className="text-3xl font-bold mt-2">{totalOrders}</p>
                </div>
                <Package className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">En cours</p>
                  <p className="text-3xl font-bold mt-2">{pendingOrders}</p>
                </div>
                <Clock className="h-10 w-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Terminées</p>
                  <p className="text-3xl font-bold mt-2">{completedOrders}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total dépensé</p>
                  <p className="text-2xl font-bold mt-2">{totalSpent.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">FCFA</p>
                </div>
                <DollarSign className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notifications</p>
                  <p className="text-3xl font-bold mt-2">{unreadNotifications}</p>
                  <p className="text-xs text-muted-foreground">non lues</p>
                </div>
                <Bell className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Mes Commandes</span>
              <span className="sm:hidden">Commandes</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Paiements & Reçus</span>
              <span className="sm:hidden">Paiements</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Notifs</span>
              {unreadNotifications > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {unreadNotifications}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Mon Profil</span>
              <span className="sm:hidden">Profil</span>
            </TabsTrigger>
          </TabsList>

          {/* Commandes Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Historique de mes commandes
                </CardTitle>
                <CardDescription>
                  Suivez et gérez toutes vos commandes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-center py-12">Chargement...</div>
                ) : orders.length > 0 ? (
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
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {order.products?.images?.[0] && (
                                  <img 
                                    src={order.products.images[0]} 
                                    alt="" 
                                    className="h-10 w-10 rounded object-cover"
                                  />
                                )}
                                <span className="max-w-[150px] truncate">{order.products?.nom || 'N/A'}</span>
                              </div>
                            </TableCell>
                            <TableCell>{order.quantite}</TableCell>
                            <TableCell className="font-semibold">
                              {Number(order.montant).toLocaleString()} FCFA
                            </TableCell>
                            <TableCell>{getStatusBadge(order.statut)}</TableCell>
                            <TableCell>
                              {format(new Date(order.created_at), 'dd MMM yyyy', { locale: fr })}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2 flex-wrap">
                                {/* Suivi livraison */}
                                {(order.statut === 'en_livraison' || order.statut === 'livré') && 
                                 Array.isArray(order.deliveries) && order.deliveries.length > 0 && (
                                  <Link to={`/suivi-livraison/${order.deliveries[0].id}`}>
                                    <Button size="sm" variant="outline" className="gap-1">
                                      <MapPin className="h-4 w-4" />
                                      Suivre
                                    </Button>
                                  </Link>
                                )}
                                
                                {/* Noter le livreur */}
                                {order.statut === 'livré' && order.deliveries?.[0]?.courier && (
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
                                    {order.courierRating ? 'Modifier' : 'Noter'}
                                  </Button>
                                )}
                                
                                {/* Confirmer réception */}
                                {order.statut === 'livré' && !order.validations?.acheteur_ok && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => validateOrder.mutate(order.id)}
                                      disabled={validateOrder.isPending}
                                    >
                                      <CheckCircle className="mr-1 h-4 w-4" />
                                      Confirmer
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => openDispute.mutate(order.id)}
                                      disabled={openDispute.isPending}
                                    >
                                      <AlertTriangle className="mr-1 h-4 w-4" />
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
                    <Link to="/produits">
                      <Button className="mt-4">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Découvrir les produits
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paiements & Reçus Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Mes Paiements & Reçus
                </CardTitle>
                <CardDescription>
                  Consultez l'historique de vos paiements et téléchargez vos reçus
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="text-center py-12">Chargement...</div>
                ) : payments.length > 0 ? (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <Card key={payment.id} className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Receipt className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold">
                                  {payment.orders?.products?.nom || 'Produit'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Réf: {payment.reference_gateway || payment.id.slice(0, 8)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(payment.created_at), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-2xl font-bold">
                                  {Number(payment.montant).toLocaleString()} FCFA
                                </p>
                                {getPaymentStatusBadge(payment.statut)}
                              </div>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  const receiptContent = `
REÇU DE PAIEMENT
================
Référence: ${payment.reference_gateway || payment.id}
Date: ${format(new Date(payment.created_at), "dd/MM/yyyy HH:mm")}
Produit: ${payment.orders?.products?.nom || 'Produit'}
Quantité: ${payment.orders?.quantite || 1}
Montant: ${Number(payment.montant).toLocaleString()} FCFA
Statut: ${payment.statut}
Mode: ${payment.mode || 'Paystack'}
================
Merci pour votre achat !
                                  `.trim();
                                  
                                  const blob = new Blob([receiptContent], { type: 'text/plain' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `recu-${payment.reference_gateway || payment.id.slice(0, 8)}.txt`;
                                  a.click();
                                  URL.revokeObjectURL(url);
                                  toast.success('Reçu téléchargé');
                                }}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Reçu
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun paiement pour le moment</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Mes Notifications
                </CardTitle>
                <CardDescription>
                  Restez informé de l'état de vos commandes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${
                          notification.lue 
                            ? 'bg-background' 
                            : 'bg-primary/5 border-primary/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className={notification.lue ? 'text-muted-foreground' : 'font-medium'}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(notification.created_at), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                            </p>
                          </div>
                          {!notification.lue && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => markAsRead.mutate(notification.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
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
          </TabsContent>

          {/* Profil Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Mon Profil
                    </CardTitle>
                    <CardDescription>
                      Gérez vos informations personnelles
                    </CardDescription>
                  </div>
                  {!isEditingProfile && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setProfileForm({
                          nom: userProfile?.nom || '',
                          telephone: userProfile?.telephone || '',
                          email: userProfile?.email || '',
                          pays: userProfile?.pays || '',
                          entreprise: userProfile?.entreprise || ''
                        });
                        setIsEditingProfile(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditingProfile ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    updateProfile.mutate();
                  }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="nom">Nom complet</Label>
                        <Input
                          id="nom"
                          value={profileForm.nom}
                          onChange={(e) => setProfileForm({ ...profileForm, nom: e.target.value })}
                          placeholder="Votre nom complet"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          placeholder="votre@email.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telephone">Téléphone</Label>
                        <Input
                          id="telephone"
                          value={profileForm.telephone}
                          onChange={(e) => setProfileForm({ ...profileForm, telephone: e.target.value })}
                          placeholder="+225 00 00 00 00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pays">Pays</Label>
                        <Input
                          id="pays"
                          value={profileForm.pays}
                          onChange={(e) => setProfileForm({ ...profileForm, pays: e.target.value })}
                          placeholder="Côte d'Ivoire"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="entreprise">Entreprise (optionnel)</Label>
                        <Input
                          id="entreprise"
                          value={profileForm.entreprise}
                          onChange={(e) => setProfileForm({ ...profileForm, entreprise: e.target.value })}
                          placeholder="Nom de votre entreprise"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button type="submit" disabled={updateProfile.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        {updateProfile.isPending ? 'Enregistrement...' : 'Enregistrer'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditingProfile(false)}
                      >
                        Annuler
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Nom complet</p>
                          <p className="font-medium text-lg">{userProfile?.nom || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{userProfile?.email || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Téléphone</p>
                          <p className="font-medium">{userProfile?.telephone || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Pays</p>
                          <p className="font-medium">{userProfile?.pays || '-'}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Entreprise</p>
                          <p className="font-medium">{userProfile?.entreprise || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Points de fidélité</p>
                          <p className="font-medium text-lg">{userProfile?.points || 0} points</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Membre depuis</p>
                          <p className="font-medium">
                            {userProfile?.created_at 
                              ? format(new Date(userProfile.created_at), 'MMMM yyyy', { locale: fr })
                              : '-'
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Statut</p>
                          <Badge variant={userProfile?.statut === 'actif' ? 'default' : 'secondary'}>
                            {userProfile?.statut || 'Actif'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Section Mot de passe */}
                    <div className="border-t pt-6 mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Sécurité
                          </h3>
                          <p className="text-sm text-muted-foreground">Gérez votre mot de passe</p>
                        </div>
                        {!isChangingPassword && (
                          <Button 
                            variant="outline" 
                            onClick={() => setIsChangingPassword(true)}
                          >
                            <Lock className="h-4 w-4 mr-2" />
                            Changer le mot de passe
                          </Button>
                        )}
                      </div>

                      {isChangingPassword && (
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          changePassword.mutate();
                        }} className="space-y-4 max-w-md">
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                              placeholder="••••••••"
                              minLength={6}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                              placeholder="••••••••"
                              minLength={6}
                              required
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button type="submit" disabled={changePassword.isPending}>
                              <Save className="h-4 w-4 mr-2" />
                              {changePassword.isPending ? 'Enregistrement...' : 'Enregistrer'}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                setIsChangingPassword(false);
                                setPasswordForm({ newPassword: '', confirmPassword: '' });
                              }}
                            >
                              Annuler
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      {/* Rating Dialog */}
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

export default BuyerDashboard;
