import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  'Machines et équipements de...',
  'Meubles',
  'Lumière & Éclairage',
  'Électroménager',
  'Fournitures et outils automobiles',
  'Pièces et accessoires pour...',
  'Bricolage & Quincaillerie',
  'Énergies renouvelables',
  'Équipements et fournitures électriques',
  'Sûreté et sécurité',
  'Manutention',
];

const CategoriesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  const { data: products, isLoading } = useQuery({
    queryKey: ['category-products', selectedCategory],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('statut', 'actif')
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="flex-1 flex">
        {/* Sidebar - Categories List */}
        <aside className="w-32 md:w-48 lg:w-64 border-r bg-background shrink-0">
          <div className="p-3 md:p-4 border-b">
            <h2 className="font-bold text-base md:text-lg">Catégories</h2>
          </div>
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'w-full text-left px-2 md:px-3 py-2 md:py-3 text-xs md:text-sm rounded-md transition-colors',
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'hover:bg-muted'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content - Products Grid */}
        <main className="flex-1 overflow-y-auto">
          <div className="container px-2 md:px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-square bg-muted animate-pulse" />
                      <div className="p-3 space-y-2">
                        <div className="h-4 bg-muted animate-pulse rounded" />
                        <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : products && products.length > 0 ? (
                products.map((product) => {
                  const images = Array.isArray(product.images) && product.images.length > 0 
                    ? product.images.map(String) 
                    : [];
                  const randomMOQ = Math.floor(Math.random() * 5) + 1;
                  const randomUnit = ['pièces', 'paires', 'jeu'][Math.floor(Math.random() * 3)];
                  const hasDiscount = Math.random() > 0.7;
                  const originalPrice = hasDiscount ? Math.floor(product.prix * 1.3) : null;

                  return (
                    <Link key={product.id} to={`/produit/${product.id}`}>
                      <Card className="group hover:shadow-md transition-all h-full">
                        <CardContent className="p-0">
                          {/* Product Image */}
                          <div className="relative aspect-square bg-muted">
                            {images.length > 0 ? (
                              <img
                                src={images[0]}
                                alt={product.nom}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Camera className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                            {/* Camera Icon Overlay */}
                            <div className="absolute bottom-2 right-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-background/90 flex items-center justify-center">
                              <Camera className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className="p-2 md:p-3 space-y-1">
                            {/* Price */}
                            <div className="space-y-0.5">
                              <p className="font-bold text-base md:text-lg">
                                {product.prix.toLocaleString()} FCFA
                              </p>
                              {hasDiscount && originalPrice && (
                                <p className="text-xs text-muted-foreground line-through">
                                  {originalPrice.toLocaleString()} FCFA
                                </p>
                              )}
                            </div>

                            {/* MOQ */}
                            <p className="text-xs text-muted-foreground">
                              Quantité min. : {randomMOQ} {randomUnit}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  Aucun produit dans cette catégorie
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default CategoriesPage;
