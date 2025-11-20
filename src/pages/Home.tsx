import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { TrustSection } from '@/components/home/TrustSection';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { WhatsAppButton } from '@/components/home/WhatsAppButton';
import { Search, Camera, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { SEOHead } from '@/components/seo/SEOHead';

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
    <div className="flex min-h-screen flex-col pb-20 md:pb-4">
      <SEOHead 
        title="Marketplace Africain - Produits Authentiques & Fabricants Vérifiés"
        description="Découvrez des milliers de produits africains authentiques. Achetez directement auprès de fabricants vérifiés. Livraison rapide et sécurisée."
        keywords="marketplace africain, produits africains, fabricants africains, e-commerce afrique, achats en ligne"
      />
      <Navbar />

      {/* Hero Section with Clear CTAs */}
      <HeroSection />

      {/* Tabs and Search Section - Mobile Optimized */}
      <section className="bg-background border-b">
        <div className="container px-3 md:px-4 py-3 md:py-4 space-y-3">
          {/* Tabs Navigation */}
          <Tabs value={searchTab} onValueChange={setSearchTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-11 bg-transparent border-b rounded-none p-0">
              <TabsTrigger 
                value="produits" 
                className="text-xs md:text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:bg-transparent h-11"
              >
                Produits
              </TabsTrigger>
              <TabsTrigger 
                value="fabricants" 
                className="text-xs md:text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:bg-transparent h-11"
              >
                Fabricants
              </TabsTrigger>
              <TabsTrigger 
                value="mondial" 
                className="text-xs md:text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:bg-transparent h-11"
              >
                Mondial
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search Bar - Better Mobile Layout */}
          <div className="flex gap-2">
            <div className="flex-1 flex gap-2 items-center bg-muted/50 border rounded-xl px-3 py-2">
              <Input
                type="text"
                placeholder="paillis agricole 🏗️"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="border-none bg-transparent h-auto p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 shrink-0 hover:bg-background"
              >
                <Camera className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
            <Button 
              onClick={handleSearch} 
              size="icon"
              className="h-11 w-11 shrink-0 rounded-xl"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* Horizontal Category Filters - Better Mobile Scroll */}
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="shrink-0 text-xs h-9 px-4 rounded-full font-medium"
                >
                  {cat}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-2" />
          </ScrollArea>
        </div>
      </section>

      {/* Category Quick Access */}
      <CategoryGrid />

      {/* Featured/New Products */}
      <FeaturedProducts />

      {/* Trust & Reassurance Section */}
      <TrustSection />

      {/* WhatsApp Contact Button */}
      <WhatsAppButton />

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Home;
