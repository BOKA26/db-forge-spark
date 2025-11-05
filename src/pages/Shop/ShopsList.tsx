import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Store, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ShopsList = () => {
  const navigate = useNavigate();

  const { data: shops, isLoading } = useQuery({
    queryKey: ['public-shops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('statut', 'actif')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-muted/40">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-12">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <Store className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h1 className="text-4xl font-bold mb-4">Découvrez nos boutiques</h1>
              <p className="text-lg text-muted-foreground">
                Explorez toutes les boutiques actives sur BokaTrade et trouvez les meilleurs produits
              </p>
            </div>
          </div>
        </section>

        {/* Shops Grid */}
        <section className="container py-12">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-20 w-20 bg-muted rounded-full mb-4" />
                    <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : shops && shops.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {shops.map((shop) => (
                <Card key={shop.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      {shop.logo_url ? (
                        <img
                          src={shop.logo_url}
                          alt={shop.nom_boutique}
                          className="h-20 w-20 rounded-full object-cover border-2 border-primary/10"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                          <Store className="h-10 w-10 text-primary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{shop.nom_boutique}</CardTitle>
                        <Badge variant="secondary" className="mb-2">
                          Boutique active
                        </Badge>
                      </div>
                    </div>
                    {shop.description && (
                      <CardDescription className="mt-4 line-clamp-2">
                        {shop.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      {shop.adresse && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">{shop.adresse}</span>
                        </div>
                      )}
                      {shop.telephone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{shop.telephone}</span>
                        </div>
                      )}
                      {shop.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span className="line-clamp-1">{shop.email}</span>
                        </div>
                      )}
                      {shop.site_web && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <a
                            href={shop.site_web}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline line-clamp-1"
                          >
                            Visiter le site
                          </a>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => navigate(`/boutique/${shop.id}`)}
                      className="w-full"
                    >
                      Voir la boutique
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardHeader>
                <Store className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <CardTitle>Aucune boutique active</CardTitle>
                <CardDescription>
                  Il n'y a pas encore de boutiques actives sur la plateforme.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </section>
      </div>
      <Footer />
    </>
  );
};

export default ShopsList;
