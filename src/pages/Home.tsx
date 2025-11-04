import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Search, Shield, TruckIcon, Package, ChevronRight, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const categories = [
  { name: 'Électronique', icon: '💻' },
  { name: 'Mode', icon: '👗' },
  { name: 'Maison', icon: '🏠' },
  { name: 'Agriculture', icon: '🌾' },
  { name: 'Beauté', icon: '💄' },
  { name: 'Sports', icon: '⚽' },
];

const frequentSearches = [
  'téléphones portables',
  'vêtements en gros',
  'équipement agricole',
  'matériel informatique',
];

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTab, setSearchTab] = useState('products');
  const navigate = useNavigate();

  // Fetch popular products
  const { data: products } = useQuery({
    queryKey: ['products', 'popular'],
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/produits?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section with Search */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground py-12">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              BokaTrade - Votre marketplace B2B en Afrique
            </h1>
            
            {/* Search Tabs */}
            <Tabs value={searchTab} onValueChange={setSearchTab} className="mb-4">
              <TabsList className="bg-background/20 backdrop-blur-sm border border-primary-foreground/20">
                <TabsTrigger value="products" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                  Produits
                </TabsTrigger>
                <TabsTrigger value="suppliers" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                  Fournisseurs
                </TabsTrigger>
                <TabsTrigger value="categories" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                  Catégories
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
              <div className="bg-background rounded-full shadow-xl flex items-center overflow-hidden">
                <Input
                  type="text"
                  placeholder="Rechercher des produits, fournisseurs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 rounded-l-full pl-6 text-lg h-14 focus-visible:ring-0"
                />
                <Button type="submit" size="lg" className="rounded-r-full h-14 px-8">
                  <Search className="mr-2 h-5 w-5" />
                  Rechercher
                </Button>
              </div>
            </form>

            {/* Frequent Searches */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <span className="text-sm opacity-90">Recherches fréquentes:</span>
              {frequentSearches.map((search) => (
                <button
                  key={search}
                  onClick={() => navigate(`/produits?q=${encodeURIComponent(search)}`)}
                  className="text-sm px-3 py-1 bg-background/20 backdrop-blur-sm rounded-full hover:bg-background/30 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Welcome & Trust Badges */}
      <section className="border-b py-4 bg-muted/30">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-medium">Paiement sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-medium">Protection des commandes</span>
            </div>
            <div className="flex items-center gap-2">
              <TruckIcon className="h-5 w-5 text-primary" />
              <span className="font-medium">Livraison suivie</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="py-8">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Categories */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4">Catégories populaires</h3>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <Link
                        key={cat.name}
                        to={`/produits?categorie=${cat.name}`}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{cat.icon}</span>
                          <span className="text-sm font-medium">{cat.name}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card className="mt-4">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Shield className="h-8 w-8 text-primary mb-2" />
                    <h4 className="font-semibold text-sm mb-1">Escrow sécurisé</h4>
                    <p className="text-xs text-muted-foreground">
                      Fonds bloqués jusqu'à validation
                    </p>
                  </div>
                  <div>
                    <Package className="h-8 w-8 text-primary mb-2" />
                    <h4 className="font-semibold text-sm mb-1">Triple validation</h4>
                    <p className="text-xs text-muted-foreground">
                      Sécurité maximale garantie
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Featured Products */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Produits populaires</h2>
                  <Link to="/produits">
                    <Button variant="ghost" className="gap-2">
                      Voir tout
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                
                {products && products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map((product) => (
                      <Link key={product.id} to={`/produit/${product.id}`}>
                        <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
                          <CardContent className="p-3">
                            <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                              <Package className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.nom}</h3>
                            <p className="text-lg font-bold text-primary">
                              {product.prix.toLocaleString()} FCFA
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Stock: {product.stock}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Aucun produit disponible</h3>
                      <p className="text-muted-foreground mb-4">
                        Les produits seront bientôt disponibles
                      </p>
                      <Link to="/inscription">
                        <Button>Devenir vendeur</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Categories Grid */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Explorer par catégorie</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {categories.map((cat) => (
                    <Link key={cat.name} to={`/produits?categorie=${cat.name}`}>
                      <Card className="hover:shadow-md transition-shadow hover:border-primary">
                        <CardContent className="p-6 text-center">
                          <div className="text-4xl mb-2">{cat.icon}</div>
                          <h3 className="font-semibold">{cat.name}</h3>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-16">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à développer votre activité ?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Rejoignez des milliers d'entreprises qui font confiance à BokaTrade pour leurs transactions B2B
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/inscription">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                S'inscrire gratuitement
              </Button>
            </Link>
            <Link to="/produits">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Explorer les produits
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;