import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Package, CheckCircle, User, Mail, Phone, TrendingUp, Clock, DollarSign, Bell, Edit, Trash2, Store, MapPin, Globe, ExternalLink, AlertTriangle, XCircle, ImageIcon, ShoppingCart, ClipboardList, TruckIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useState } from 'react';

const shopFormSchema = z.object({
  nom_boutique: z.string().min(1, 'Le nom de la boutique est requis'),
  description: z.string().optional(),
  adresse: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  site_web: z.string().url('URL invalide').optional().or(z.literal('')),
});

type ShopFormData = z.infer<typeof shopFormSchema>;

const SellerDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditShopOpen, setIsEditShopOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const shopForm = useForm<ShopFormData>({
    resolver: zodResolver(shopFormSchema),
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

  // Fetch shop data
  const { data: shop } = useQuery({
    queryKey: ['shop', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('vendeur_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Calculate statistics
  const totalSales = payments?.reduce((sum, p) => sum + Number(p.montant), 0) || 0;
  const revenuLibere = payments?.filter(p => p.statut === 'débloqué').reduce((sum, p) => sum + Number(p.montant), 0) || 0;
  const revenuEnAttente = payments?.filter(p => p.statut === 'bloqué').reduce((sum, p) => sum + Number(p.montant), 0) || 0;
  const pendingSales = orders?.filter(o => o.statut === 'fonds_bloques' || o.statut === 'en_livraison').length || 0;

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

  // Update shop mutation
  const updateShopMutation = useMutation({
    mutationFn: async (values: ShopFormData) => {
      if (!user?.id || !shop?.id) throw new Error('User or shop not found');

      let logoUrl = shop.logo_url;

      // Upload logo if file is selected
      if (logoFile) {
        setUploading(true);
        const filePath = `${user.id}/logo.png`;
        const { error: uploadError } = await supabase.storage
          .from('shops')
          .upload(filePath, logoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('shops')
          .getPublicUrl(filePath);
        
        logoUrl = publicUrl;
        setUploading(false);
      }

      const { data, error } = await supabase
        .from('shops')
        .update({
          nom_boutique: values.nom_boutique,
          description: values.description || null,
          logo_url: logoUrl || null,
          adresse: values.adresse || null,
          telephone: values.telephone || null,
          email: values.email || null,
          site_web: values.site_web || null,
        })
        .eq('id', shop.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop'] });
      toast.success('✅ Boutique mise à jour');
      setIsEditShopOpen(false);
      setLogoFile(null);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const onShopSubmit = (values: ShopFormData) => {
    updateShopMutation.mutate(values);
  };

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .update({ statut: 'supprimé' })
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      toast.success('✅ Produit supprimé');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const getStatusBadge = (statut: string) => {
    if (statut === 'actif') return <Badge className="bg-green-500">Actif</Badge>;
    if (statut === 'brouillon') return <Badge variant="secondary">Brouillon</Badge>;
    if (statut === 'supprimé') return <Badge variant="destructive">Supprimé</Badge>;
    return <Badge variant="outline">{statut}</Badge>;
  };

  const getOrderStatusBadge = (statut: string) => {
    switch(statut) {
      case 'terminé':
        return <Badge className="bg-green-500">Terminé</Badge>;
      case 'livré':
        return <Badge className="bg-emerald-500">Livré</Badge>;
      case 'en_livraison':
        return <Badge className="bg-blue-500">En livraison</Badge>;
      case 'fonds_bloques':
        return <Badge className="bg-yellow-500">Fonds bloqués</Badge>;
      case 'en_attente_paiement':
        return <Badge variant="outline">En attente</Badge>;
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  // Calculate additional statistics
  const totalProducts = products?.length || 0;
  // "en cours" = en livraison ou fonds bloqués, mais pas livré/terminé
  const ordersInProgress = orders?.filter(o => ['fonds_bloques', 'en_livraison'].includes(o.statut)).length || 0;
  // "terminées" = statut terminé OU livré (livraison faite)
  const completedOrders = orders?.filter(o => ['terminé', 'livré'].includes(o.statut)).length || 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="container py-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Tableau de bord Vendeur</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Gérez votre boutique, vos produits et vos commandes en toute simplicité
            </p>
          </div>

          {shop && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {shop.logo_url && (
                      <img 
                        src={shop.logo_url} 
                        alt={shop.nom_boutique} 
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h2 className="text-2xl font-semibold">{shop.nom_boutique}</h2>
                      <Badge 
                        variant={
                          shop.statut === 'actif' ? 'default' : 
                          shop.statut === 'en_attente' ? 'secondary' : 
                          'destructive'
                        }
                        className="mt-1"
                      >
                        {shop.statut === 'actif' ? '✓ Active' : 
                         shop.statut === 'en_attente' ? '⏳ En attente' : 
                         '⚠ Suspendue'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/boutique/${shop.id}`}>
                      <Button variant="outline">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Voir ma boutique publique
                      </Button>
                    </Link>
                    <Link to="/lancer-live">
                      <Button variant="default" className="bg-red-600 hover:bg-red-700">
                        📹 Lancer un Live
                      </Button>
                    </Link>
                    <Link to="/ajouter-produit">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un produit
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!shop && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Store className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <h2 className="text-2xl font-semibold">Créez votre boutique</h2>
                    <p className="text-muted-foreground mt-2">
                      Vous devez d'abord créer votre boutique pour commencer à vendre
                    </p>
                  </div>
                  <Link to="/creer-boutique">
                    <Button size="lg">
                      <Plus className="mr-2 h-4 w-4" />
                      Créer ma boutique
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Banners */}
          {shop?.statut === 'en_attente' && (
            <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                Votre boutique est en attente de validation par l'administrateur.
              </AlertDescription>
            </Alert>
          )}
          {shop?.statut === 'suspendu' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Votre boutique est suspendue. Contactez le support.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nombre de produits</p>
                  <p className="text-3xl font-bold mt-2">{totalProducts}</p>
                </div>
                <Package className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Commandes en cours</p>
                  <p className="text-3xl font-bold mt-2">{ordersInProgress}</p>
                </div>
                <Clock className="h-10 w-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Commandes terminées</p>
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
                  <p className="text-sm font-medium text-muted-foreground">💰 Revenu Libéré</p>
                  <p className="text-3xl font-bold mt-2 text-green-600">{revenuLibere.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">FCFA débloqués</p>
                </div>
                <DollarSign className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">⏳ Revenu En Attente</p>
                  <p className="text-3xl font-bold mt-2 text-orange-500">{revenuEnAttente.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">FCFA bloqués</p>
                </div>
                <Clock className="h-10 w-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="shop" className="space-y-4">
          <TabsList>
            <TabsTrigger value="shop">Ma Boutique</TabsTrigger>
            <TabsTrigger value="products">Mes Produits</TabsTrigger>
            <TabsTrigger value="orders">Commandes Reçues</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="shop" className="space-y-4">
            {!shop ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <Store className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h2 className="text-2xl font-semibold">Aucune boutique</h2>
                    <p className="text-muted-foreground">
                      Vous n'avez pas encore créé votre boutique.
                    </p>
                    <Link to="/creer-boutique">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Créer ma boutique
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Status Banners */}
                {shop.statut === 'en_attente' && (
                  <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                      Votre boutique est en attente de validation par l'administrateur.
                    </AlertDescription>
                  </Alert>
                )}
                {shop.statut === 'suspendu' && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      Votre boutique est suspendue. Contactez le support.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Shop Details Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        Informations de la boutique
                      </CardTitle>
                      <Dialog open={isEditShopOpen} onOpenChange={setIsEditShopOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              shopForm.reset({
                                nom_boutique: shop.nom_boutique,
                                description: shop.description || '',
                                adresse: shop.adresse || '',
                                telephone: shop.telephone || '',
                                email: shop.email || '',
                                site_web: shop.site_web || '',
                              });
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Modifier ma boutique</DialogTitle>
                          </DialogHeader>
                          <Form {...shopForm}>
                            <form onSubmit={shopForm.handleSubmit(onShopSubmit)} className="space-y-4">
                              <FormField
                                control={shopForm.control}
                                name="nom_boutique"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nom de la boutique *</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={shopForm.control}
                                name="description"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                      <Textarea {...field} className="min-h-[100px]" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="space-y-2">
                                <FormLabel>Logo</FormLabel>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setLogoFile(file);
                                  }}
                                />
                              </div>
                              <FormField
                                control={shopForm.control}
                                name="adresse"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Adresse</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={shopForm.control}
                                name="telephone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Téléphone</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={shopForm.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                      <Input type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={shopForm.control}
                                name="site_web"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Site web</FormLabel>
                                    <FormControl>
                                      <Input type="url" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button 
                                type="submit" 
                                className="w-full"
                                disabled={updateShopMutation.isPending || uploading}
                              >
                                {(updateShopMutation.isPending || uploading) && (
                                  <CheckCircle className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Enregistrer
                              </Button>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-start gap-6">
                        {shop.logo_url && (
                          <img 
                            src={shop.logo_url} 
                            alt={shop.nom_boutique}
                            className="w-32 h-32 rounded-lg object-cover border"
                          />
                        )}
                        <div className="flex-1 space-y-3">
                          <div>
                            <h2 className="text-3xl font-bold">{shop.nom_boutique}</h2>
                            <div className="mt-2">
                              <Badge 
                                variant={
                                  shop.statut === 'actif' ? 'default' :
                                  shop.statut === 'en_attente' ? 'secondary' :
                                  'destructive'
                                }
                                className={
                                  shop.statut === 'actif' ? 'bg-green-500' :
                                  shop.statut === 'en_attente' ? 'bg-yellow-500' : ''
                                }
                              >
                                {shop.statut === 'actif' ? 'Actif' :
                                 shop.statut === 'en_attente' ? 'En attente' :
                                 'Suspendu'}
                              </Badge>
                            </div>
                          </div>
                          {shop.description && (
                            <p className="text-muted-foreground">{shop.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-3 pt-4 border-t">
                        {shop.adresse && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{shop.adresse}</span>
                          </div>
                        )}
                        {shop.telephone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{shop.telephone}</span>
                          </div>
                        )}
                        {shop.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{shop.email}</span>
                          </div>
                        )}
                        {shop.site_web && (
                          <div className="flex items-center gap-2 text-sm">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <a 
                              href={shop.site_web} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              {shop.site_web}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t">
                        <Button variant="outline" asChild className="w-full">
                          <Link to={`/boutique/${shop.id}`} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Voir ma page publique
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Mes Produits
                  </CardTitle>
                  <Link to="/ajouter-produit">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter un produit
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {products && products.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Image</TableHead>
                          <TableHead>Nom</TableHead>
                          <TableHead>Prix</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              {product.images && Array.isArray(product.images) && product.images.length > 0 ? (
                                <img 
                                  src={product.images[0] as string} 
                                  alt={product.nom}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{product.nom}</TableCell>
                            <TableCell className="font-semibold">{Number(product.prix).toLocaleString()} FCFA</TableCell>
                            <TableCell>
                              <span className={product.stock === 0 ? 'text-red-500 font-medium' : ''}>
                                {product.stock}
                              </span>
                            </TableCell>
                            <TableCell>{getStatusBadge(product.statut || 'actif')}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link to={`/ajouter-produit?id=${product.id}`}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => {
                                    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
                                      deleteProductMutation.mutate(product.id);
                                    }
                                  }}
                                  disabled={deleteProductMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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
                    <p className="text-lg mb-2">Aucun produit</p>
                    <p className="text-sm">Ajoutez votre premier produit pour commencer à vendre !</p>
                    <Link to="/ajouter-produit">
                      <Button className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un produit
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Commandes Reçues
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders && orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID Commande</TableHead>
                          <TableHead>Produit</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-xs">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{order.products?.nom}</div>
                              <div className="text-xs text-muted-foreground">Qté: {order.quantite}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">ID: {order.acheteur_id?.slice(0, 8)}</div>
                            </TableCell>
                            <TableCell>
                              {getOrderStatusBadge(order.statut)}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {Number(order.montant).toLocaleString()} FCFA
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2 flex-wrap">
                                {(order.statut === 'fonds_bloques' || order.statut === 'en_attente_paiement') && !order.validations?.vendeur_ok ? (
                                  <>
                                    {!Array.isArray(order.deliveries) || order.deliveries.length === 0 || !order.deliveries[0]?.livreur_id ? (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => assignCourier.mutate(order.id)}
                                        disabled={assignCourier.isPending}
                                      >
                                        <TruckIcon className="h-4 w-4 mr-1" />
                                        Assigner livreur
                                      </Button>
                                    ) : (
                                      <Badge variant="secondary" className="mr-2">
                                        Livreur assigné
                                      </Badge>
                                    )}
                                    {Array.isArray(order.deliveries) && order.deliveries[0]?.livreur_id && (
                                      <Button
                                        size="sm"
                                        onClick={() => markAsShipped.mutate(order.id)}
                                        disabled={markAsShipped.isPending}
                                      >
                                        <TruckIcon className="h-4 w-4 mr-1" />
                                        Lancer livraison
                                      </Button>
                                    )}
                                  </>
                                ) : order.statut === 'en_livraison' ? (
                                  <div className="flex items-center gap-1 text-xs text-blue-600">
                                    <TruckIcon className="h-4 w-4" />
                                    En livraison
                                  </div>
                                ) : order.validations?.vendeur_ok || order.statut === 'livré' || order.statut === 'terminé' ? (
                                  <div className="flex items-center gap-1 text-xs text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                    {order.statut === 'terminé' ? 'Terminé' : 'Expédié'}
                                  </div>
                                ) : (
                                  <Button variant="outline" size="sm">
                                    Détails
                                  </Button>
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
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Aucune commande</p>
                    <p className="text-sm">Vos commandes apparaîtront ici</p>
                  </div>
                )}
              </CardContent>
            </Card>
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
                  <div className="space-y-4">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="mt-1">
                          <Bell className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notif.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {!notif.lue && (
                          <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        )}
                      </div>
                    ))}
                    <div className="pt-4 border-t">
                      <Link to="/notifications">
                        <Button variant="outline" className="w-full">
                          Voir toutes les notifications
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Aucune notification</p>
                    <p className="text-sm">Vous serez notifié des nouvelles commandes et messages</p>
                  </div>
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