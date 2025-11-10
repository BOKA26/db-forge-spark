import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, Package, ZoomIn, ShieldCheck } from 'lucide-react';

const ProductList = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('categorie') || 'all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('categorie');
    if (q) setSearchTerm(q);
    if (cat) setCategory(cat);
  }, [searchParams]);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', searchTerm, category, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('statut', 'actif');

      if (searchTerm) {
        query = query.ilike('nom', `%${searchTerm}%`);
      }

      if (category !== 'all') {
        query = query.eq('categorie', category);
      }

      if (sortBy === 'price_asc') {
        query = query.order('prix', { ascending: true });
      } else if (sortBy === 'price_desc') {
        query = query.order('prix', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">Catalogue Produits</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              <SelectItem value="Électronique">Électronique</SelectItem>
              <SelectItem value="Mode">Mode</SelectItem>
              <SelectItem value="Maison">Maison</SelectItem>
              <SelectItem value="Agriculture">Agriculture</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Plus récents</SelectItem>
              <SelectItem value="price_asc">Prix croissant</SelectItem>
              <SelectItem value="price_desc">Prix décroissant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <Skeleton className="w-full aspect-square" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => {
              const images = Array.isArray(product.images) && product.images.length > 0 
                ? product.images.map(String) 
                : [];
              const randomViews = Math.floor(Math.random() * 5000) + 100;
              const randomYears = Math.floor(Math.random() * 10) + 1;
              
              return (
                <Link key={product.id} to={`/produit/${product.id}`}>
                  <Card className="group hover:shadow-xl transition-all duration-300 h-full overflow-hidden border-border/50">
                    <CardContent className="p-0">
                      {/* Image avec zoom icon */}
                      <div className="relative">
                        <AspectRatio ratio={4/3}>
                          {images.length > 0 ? (
                            <img
                              src={images[0]}
                              alt={product.nom}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Package className="h-16 w-16 text-muted-foreground" />
                            </div>
                          )}
                        </AspectRatio>
                        {/* Zoom icon */}
                        <div className="absolute top-3 left-3 bg-background/90 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <ZoomIn className="h-5 w-5 text-foreground" />
                        </div>
                        {/* Badges en haut */}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <Badge variant="secondary" className="bg-background/90 text-xs">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            CE
                          </Badge>
                        </div>
                      </div>

                      {/* Info produit */}
                      <div className="p-3 md:p-4 space-y-2">
                        {/* Titre */}
                        <h3 className="font-semibold text-sm md:text-base line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]">
                          {product.nom}
                        </h3>
                        
                        {/* Prix */}
                        <div className="text-2xl md:text-3xl font-bold text-foreground">
                          {product.prix.toLocaleString()} FCFA
                        </div>
                        
                        {/* MOQ et vues */}
                        <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground">
                          <span>MOQ: 2 pièces</span>
                          <span>{randomViews.toLocaleString()} vues</span>
                        </div>
                        
                        {/* Verified badge */}
                        <div className="flex items-center gap-2 pt-1">
                          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 text-xs">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                          <span className="text-xs text-muted-foreground">· {randomYears} ans · {product.origin_country || 'CI'}</span>
                        </div>
                        
                        {/* Citation/avis (si catégorie disponible) */}
                        {product.categorie && (
                          <p className="text-xs text-muted-foreground italic pt-1 line-clamp-1">
                            «{product.categorie.toLowerCase()}»
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
              <p className="text-muted-foreground">
                Essayez d'ajuster vos filtres de recherche
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductList;