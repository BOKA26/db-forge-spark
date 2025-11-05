import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Store, MapPin, Phone, Mail, Globe, ExternalLink, AlertTriangle, ShoppingCart } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const PublicShop = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch shop data
  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ['public-shop', id],
    queryFn: async () => {
      if (!id) throw new Error('Shop ID is required');
      
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch active products for this shop
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['public-shop-products', shop?.id],
    queryFn: async () => {
      if (!shop?.id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shop.id)
        .eq('statut', 'actif')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!shop?.id,
  });

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
                <h2 className="text-2xl font-semibold">Boutique introuvable</h2>
                <p className="text-muted-foreground">
                  Cette boutique n'existe pas ou a été supprimée.
                </p>
                <Button onClick={() => navigate('/produits')}>
                  Voir tous les produits
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
          {/* Status Banner */}
          {shop.statut !== 'actif' && (
            <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                Cette boutique n'est pas active.
              </AlertDescription>
            </Alert>
          )}

          {/* Shop Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Store className="h-6 w-6 text-primary" />
                <CardTitle>Boutique</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start gap-6 flex-col md:flex-row">
                  {shop.logo_url && (
                    <img 
                      src={shop.logo_url} 
                      alt={shop.nom_boutique}
                      className="w-32 h-32 rounded-lg object-cover border"
                    />
                  )}
                  <div className="flex-1 space-y-3">
                    <h1 className="text-3xl font-bold">{shop.nom_boutique}</h1>
                    {shop.description && (
                      <p className="text-muted-foreground text-lg">{shop.description}</p>
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

          {/* Products Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Produits
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun produit disponible dans cette boutique pour le moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => {
                    const imageUrl = product.images && Array.isArray(product.images) && product.images.length > 0 
                      ? String(product.images[0])
                      : null;
                    
                    return (
                      <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        {imageUrl && (
                          <div className="aspect-square overflow-hidden bg-muted">
                            <img 
                              src={imageUrl} 
                              alt={product.nom}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className="text-lg line-clamp-2">{product.nom}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-primary">
                            {product.prix} FCFA
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            className="w-full" 
                            onClick={() => navigate(`/produit/${product.id}`)}
                          >
                            Voir
                          </Button>
                        </CardFooter>
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

export default PublicShop;
