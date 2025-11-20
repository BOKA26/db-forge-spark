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
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wide">Nouveautés</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            Derniers Produits Ajoutés
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Découvrez les dernières additions à notre catalogue de produits africains authentiques
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
          {products.map((product) => {
            const images = product.images as string[] | null;
            const imageUrl = images && images.length > 0 ? images[0] : '/placeholder.svg';
            
            return (
              <Link key={product.id} to={`/produit/${product.id}`}>
                <Card className="h-full hover:shadow-xl hover:border-primary/50 transition-all duration-300 group overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <img
                        src={imageUrl}
                        alt={product.nom}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {product.stock && product.stock > 0 ? (
                        <Badge className="absolute top-3 right-3 bg-african-green text-white shadow-lg border-0 px-3 py-1">
                          ✓ En stock
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="absolute top-3 right-3 shadow-lg px-3 py-1">
                          Sur commande
                        </Badge>
                      )}
                    </div>
                    <div className="p-4 md:p-5 space-y-3">
                      <h3 className="font-bold text-sm md:text-base text-foreground line-clamp-2 min-h-[2.5rem] md:min-h-[3rem] leading-snug">
                        {product.nom}
                      </h3>
                      <div className="flex items-center justify-between pt-1">
                        <p className="text-xl md:text-2xl font-bold text-primary">
                          {product.prix.toLocaleString()} <span className="text-sm font-normal">FCFA</span>
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                          <span className="font-semibold">4.5</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12 md:mt-16">
          <Button asChild size="lg" variant="outline" className="min-w-[240px] h-14 text-lg touch-manipulation border-2 hover:bg-primary/5 font-semibold">
            <Link to="/produits">
              Voir tous les produits →
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
