import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Search, Camera, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const categories = [
  'Tous',
  'Machines et équipements',
  'Chaussures',
  'Meubles',
  'Lumière & Éclairage',
  'Électroménager',
  'Fournitures automobiles',
  'Pièces et accessoires',
  'Bricolage & Quincaillerie',
  'Énergies renouvelables',
];

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTab, setSearchTab] = useState('fabricants');
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/produits?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Fetch shops with their products
  const { data: shopsData } = useQuery({
    queryKey: ['shops-with-products'],
    queryFn: async () => {
      const { data: shops, error: shopsError } = await supabase
        .from('shops')
        .select('*')
        .eq('statut', 'actif')
        .limit(10);

      if (shopsError) throw shopsError;

      const shopsWithProducts = await Promise.all(
        shops.map(async (shop) => {
          const { data: products } = await supabase
            .from('products')
            .select('*')
            .eq('shop_id', shop.id)
            .eq('statut', 'actif')
            .limit(3);
          
          return { ...shop, products: products || [] };
        })
      );

      return shopsWithProducts;
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Tabs and Search Section - Mobile Optimized */}
      <section className="bg-background border-b sticky top-0 z-10 md:static">
        <div className="container px-2 md:px-4 py-3 md:py-4 space-y-3">
          {/* Tabs Navigation */}
          <Tabs value={searchTab} onValueChange={setSearchTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-10 bg-muted">
              <TabsTrigger value="produits" className="text-xs md:text-sm">
                Produits
              </TabsTrigger>
              <TabsTrigger value="fabricants" className="text-xs md:text-sm">
                Fabricants
              </TabsTrigger>
              <TabsTrigger value="mondial" className="text-xs md:text-sm">
                Mondial
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search Bar */}
          <div className="flex gap-2 bg-background border rounded-lg p-2">
            <Input
              type="text"
              placeholder="paillis agricole 🏗️"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="border-none h-9 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 shrink-0">
              <Camera className="h-5 w-5" />
            </Button>
            <Button onClick={handleSearch} size="sm" className="h-9 px-4 shrink-0 bg-orange-500 hover:bg-orange-600">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Horizontal Category Filters */}
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="shrink-0 text-xs md:text-sm"
                >
                  {cat}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </section>

      {/* Shops/Manufacturers Feed */}
      <div className="container px-2 md:px-4 py-4 space-y-4">
        {shopsData && shopsData.length > 0 ? (
          shopsData.map((shop) => (
            <Card key={shop.id} className="overflow-hidden">
              <CardContent className="p-3 md:p-4 space-y-3">
                {/* Shop Header */}
                <div className="flex gap-3">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                    {shop.logo_url ? (
                      <img src={shop.logo_url} alt={shop.nom_boutique} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg md:text-2xl font-bold">{shop.nom_boutique[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm md:text-base line-clamp-1">{shop.nom_boutique}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs h-5">
                        <ShieldCheck className="h-3 w-3 mr-1 text-blue-500" />
                        Verified
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {Math.floor(Math.random() * 10) + 1} ans · {Math.floor(Math.random() * 100) + 10}+ personnel
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {shop.description || 'Des solutions pour les projets · Personnalisation flexible'}
                    </p>
                  </div>
                </div>

                {/* Shop Products - Horizontal Scroll */}
                {shop.products && shop.products.length > 0 && (
                  <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex gap-3 pb-2">
                      {shop.products.map((product: any) => (
                        <Link key={product.id} to={`/produit/${product.id}`} className="inline-block">
                          <div className="w-32 md:w-40 space-y-1">
                            <div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
                              {product.images && Array.isArray(product.images) && product.images.length > 0 ? (
                                <img 
                                  src={product.images[0]} 
                                  alt={product.nom}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Camera className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <p className="font-bold text-sm line-clamp-1">
                              {product.prix.toLocaleString()} FCFA
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {Math.floor(Math.random() * 5) + 2} jeux (MOQ)
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Aucun fabricant disponible</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Home;
