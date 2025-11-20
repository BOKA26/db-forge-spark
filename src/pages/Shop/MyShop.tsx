import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit, Store, MapPin, Phone, Mail, Globe, ExternalLink, AlertTriangle, XCircle, Plus, Package, Image as ImageIcon, Video, Shield, Clock, CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const formSchema = z.object({
  nom_boutique: z.string().min(1, 'Le nom de la boutique est requis'),
  description: z.string().optional(),
  logo_url: z.string().optional(),
  adresse: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  site_web: z.string().url('URL invalide').optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

const MyShop = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  // Fetch shop data
  const { data: shop, isLoading: shopLoading } = useQuery({
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

  // Fetch products for this shop
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['shop-products', shop?.id],
    queryFn: async () => {
      if (!shop?.id) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shop.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!shop?.id,
  });

  // Auto-activate shop if it's pending
  const activateShopMutation = useMutation({
    mutationFn: async () => {
      if (!shop?.id) throw new Error('Shop not found');
      
      const { data, error } = await supabase
        .from('shops')
        .update({ statut: 'actif' })
        .eq('id', shop.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop'] });
      toast({
        title: '✅ Boutique activée',
        description: 'Votre boutique est maintenant visible publiquement.',
      });
    },
  });

  // Automatically activate shop on load if it's pending
  useEffect(() => {
    if (shop && shop.statut === 'en_attente') {
      activateShopMutation.mutate();
    }
  }, [shop?.id, shop?.statut]);

  // Update shop mutation
  const updateShopMutation = useMutation({
    mutationFn: async (values: FormData) => {
      if (!user?.id || !shop?.id) throw new Error('User or shop not found');

      let logoUrl = values.logo_url;

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
      toast({
        title: '✅ Boutique mise à jour',
      });
      setIsEditOpen(false);
      setLogoFile(null);
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: FormData) => {
    updateShopMutation.mutate(values);
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'actif':
        return <Badge variant="default" className="bg-green-500">Actif</Badge>;
      case 'en_attente':
        return <Badge variant="secondary" className="bg-yellow-500">En attente</Badge>;
      case 'suspendu':
        return <Badge variant="destructive">Suspendu</Badge>;
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  if (shopLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Store className="h-12 w-12 mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-semibold">Aucune boutique trouvée</h2>
                <p className="text-muted-foreground">
                  Vous n'avez pas encore créé votre boutique.
                </p>
                <Button onClick={() => navigate('/creer-boutique')}>
                  Créer ma boutique
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
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

          {/* Shop Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Store className="h-6 w-6 text-primary" />
                  <CardTitle>Ma Boutique</CardTitle>
                </div>
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        form.reset({
                          nom_boutique: shop.nom_boutique,
                          description: shop.description || '',
                          logo_url: shop.logo_url || '',
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
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
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
                          control={form.control}
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
                          control={form.control}
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
                          control={form.control}
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
                          control={form.control}
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
                          control={form.control}
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
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                      <div className="mt-2">{getStatusBadge(shop.statut)}</div>
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
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => navigate('/lancer-live')}
                  className="w-full"
                  variant="default"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Démarrer un live
                </Button>
                <Button 
                  onClick={() => navigate(`/ajouter-produit?shop_id=${shop.id}`)}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un produit
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Products Section */}
          <Card>
            <CardHeader>
              <CardTitle>Produits de ma boutique</CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun produit dans votre boutique
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => {
                    const images = Array.isArray(product.images) ? product.images : [];
                    const firstImage = images.length > 0 ? String(images[0]) : null;
                    
                    return (
                      <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-square relative bg-muted">
                          {firstImage ? (
                            <img 
                              src={firstImage} 
                              alt={product.nom}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
                            </div>
                          )}
                          {images.length > 1 && (
                            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <ImageIcon className="h-3 w-3" />
                              {images.length}
                            </div>
                          )}
                          <div className="absolute top-2 left-2">
                            {getStatusBadge(product.statut)}
                          </div>
                        </div>
                        <CardContent className="p-4 space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg line-clamp-1">{product.nom}</h3>
                            {product.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {product.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div>
                              <p className="text-2xl font-bold text-primary">{product.prix} €</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Package className="h-3 w-3" />
                                Stock: {product.stock}
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/produit/${product.id}`)}
                            >
                              Voir
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyShop;
