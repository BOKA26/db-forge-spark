import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Star, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const FeaturedProducts = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('statut', 'actif')
        .order('created_at', { ascending: false })
        .limit(8);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-72 w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-2xl md:text-4xl font-bold text-foreground">
              Nouveaux Produits
            </h2>
          </div>
          <p className="text-muted-foreground text-base md:text-lg">
            Découvrez les dernières additions à notre catalogue
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
            const images = product.images as string[] | null;
            const imageUrl = images && images.length > 0 ? images[0] : '/placeholder.svg';
            
            return (
              <Link key={product.id} to={`/produit/${product.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow group">
                  <CardContent className="p-0">
                    <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
                      <img
                        src={imageUrl}
                        alt={product.nom}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {product.stock && product.stock > 0 ? (
                        <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                          ✓ En stock
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="absolute top-2 right-2">
                          Sur commande
                        </Badge>
                      )}
                    </div>
                    <div className="p-3 md:p-4 space-y-2">
                      <h3 className="font-semibold text-sm md:text-base text-foreground line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]">
                        {product.nom}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-lg md:text-xl font-bold text-primary">
                          {product.prix.toLocaleString()} FCFA
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          <span>4.5</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8 md:mt-12">
          <Button asChild size="lg" variant="outline" className="min-w-[200px] touch-manipulation">
            <Link to="/produits">
              Voir tous les produits
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
