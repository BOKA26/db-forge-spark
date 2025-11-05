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
import { Search, Package } from 'lucide-react';

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
          <div className="text-center py-12">Chargement...</div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product.id} to={`/produit/${product.id}`}>
                <Card className="hover:shadow-lg transition-all hover:-translate-y-1 h-full overflow-hidden">
                  <CardContent className="p-0">
                    <AspectRatio ratio={1}>
                      {product.images && Array.isArray(product.images) && product.images.length > 0 ? (
                        <img
                          src={product.images[0] as string}
                          alt={product.nom}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </AspectRatio>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{product.nom}</h3>
                      <p className="text-xl font-bold text-primary mb-2">
                        {product.prix.toLocaleString()} FCFA
                      </p>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Stock: {product.stock}</span>
                        <span>{product.categorie}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
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