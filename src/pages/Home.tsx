import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Search, TruckIcon, Package, ChevronRight, Headphones, CreditCard, Clock } from 'lucide-react';
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

const Home = () => {
  const navigate = useNavigate();

  // Fetch latest products
  const { data: latestProducts } = useQuery({
    queryKey: ['products', 'latest'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('statut', 'actif')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  // Fetch best selling products
  const { data: bestSellingProducts } = useQuery({
    queryKey: ['products', 'best-selling'],
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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30">Offre Spéciale 40% de réduction</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Découvrez nos produits<br />de qualité premium
              </h1>
              <p className="text-xl text-muted-foreground">
                À partir de <span className="text-3xl font-bold text-primary">5,000 FCFA</span>
              </p>
              <Link to="/produits">
                <Button size="lg" className="gap-2">
                  <Search className="h-5 w-5" />
                  Acheter maintenant
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-muted to-background rounded-2xl flex items-center justify-center">
                <Package className="h-32 w-32 text-muted-foreground/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="border-y bg-background">
        <div className="container py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <TruckIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Livraison rapide</h3>
                <p className="text-xs text-muted-foreground">2-5 jours ouvrés</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Retours 30 jours</h3>
                <p className="text-xs text-muted-foreground">Sans frais</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Paiement sécurisé</h3>
                <p className="text-xs text-muted-foreground">100% protégé</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Headphones className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Support 24/7</h3>
                <p className="text-xs text-muted-foreground">Service client</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container py-12 space-y-16">
        {/* Latest Products Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Derniers produits</h2>
            <Link to="/produits">
              <Button variant="ghost" className="gap-2">
                Voir tous les produits
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {latestProducts && latestProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {latestProducts.map((product, index) => (
                <Link key={product.id} to={`/produit/${product.id}`}>
                  <Card className="hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden group h-full">
                    <CardContent className="p-0">
                      {/* Product Image with Badges */}
                      <div className="relative aspect-square bg-muted overflow-hidden">
                        {product.images && Array.isArray(product.images) && product.images.length > 0 ? (
                          <img 
                            src={product.images[0] as string} 
                            alt={product.nom}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        
                        {/* SALE or HOT Badge */}
                        {index % 3 === 0 && (
                          <Badge className="absolute top-2 left-2 bg-destructive hover:bg-destructive">
                            SALE
                          </Badge>
                        )}
                        {index % 3 === 1 && (
                          <Badge className="absolute top-2 left-2 bg-orange-500 hover:bg-orange-600">
                            HOT
                          </Badge>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="p-3">
                        <h3 className="font-medium text-sm mb-1 line-clamp-2 min-h-[2.5rem]">{product.nom}</h3>
                        <div className="flex items-baseline gap-2">
                          <p className="text-lg font-bold text-primary">
                            {parseFloat(String(product.prix)).toLocaleString()} FCFA
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun produit disponible</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Promotional Banners */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 text-white">
            <CardContent className="p-8">
              <p className="text-sm mb-2 opacity-90">Découvrez</p>
              <h3 className="text-3xl font-bold mb-4">Technologies<br />innovantes</h3>
              <p className="text-lg mb-6">À partir de <span className="text-2xl font-bold">99,000 FCFA</span></p>
              <Link to="/produits?categorie=Électronique">
                <Button variant="secondary">Acheter maintenant</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-8">
              <p className="text-sm mb-2 text-muted-foreground">Nouveauté</p>
              <h3 className="text-3xl font-bold mb-4">Mode<br />& Accessoires</h3>
              <p className="text-lg mb-6">À partir de <span className="text-2xl font-bold text-primary">15,000 FCFA</span></p>
              <Link to="/produits?categorie=Mode">
                <Button>Découvrir</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Best Selling Products */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Meilleures ventes</h2>
              <p className="text-muted-foreground text-sm">Produits les plus populaires</p>
            </div>
            <Link to="/produits">
              <Button variant="ghost" className="gap-2">
                Voir plus
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {bestSellingProducts && bestSellingProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellingProducts.slice(0, 4).map((product, index) => (
                <Link key={product.id} to={`/produit/${product.id}`}>
                  <Card className="hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden group">
                    <CardContent className="p-0">
                      {/* Product Image */}
                      <div className="relative aspect-square bg-muted overflow-hidden">
                        {product.images && Array.isArray(product.images) && product.images.length > 0 ? (
                          <img 
                            src={product.images[0] as string} 
                            alt={product.nom}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        
                        {/* Sale Badge */}
                        {index === 0 && (
                          <Badge className="absolute top-2 left-2 bg-destructive hover:bg-destructive">
                            -15%
                          </Badge>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.nom}</h3>
                        <div className="flex items-baseline gap-2 mb-3">
                          <p className="text-xl font-bold text-primary">
                            {parseFloat(String(product.prix)).toLocaleString()} FCFA
                          </p>
                        </div>
                        <Link to={`/produit/${product.id}`}>
                          <Button size="sm" className="w-full">Acheter</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        {/* Shop by Category */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Acheter par catégorie</h2>
            <Link to="/produits">
              <Button variant="ghost" className="gap-2">
                Voir toutes
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link key={cat.name} to={`/produits?categorie=${cat.name}`}>
                <Card className="hover:shadow-md transition-all hover:border-primary group">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
                    <h3 className="font-semibold text-sm">{cat.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-16">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à développer votre activité ?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Rejoignez des milliers d'entreprises qui font confiance à BokaTrade
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
