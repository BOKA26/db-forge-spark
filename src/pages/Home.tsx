import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Search, Shield, TruckIcon, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Home = () => {
  // Fetch popular products
  const { data: products } = useQuery({
    queryKey: ['products', 'popular'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('statut', 'actif')
        .limit(8);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              La marketplace B2B en Afrique
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Achetez et vendez en toute sécurité avec notre système d'escrow
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/produits">
                <Button size="lg" className="w-full sm:w-auto">
                  <Search className="mr-2 h-4 w-4" />
                  Trouver des produits
                </Button>
              </Link>
              <Link to="/inscription">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Devenir vendeur
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-b">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <Shield className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Paiement sécurisé</h3>
                <p className="text-muted-foreground">
                  Vos fonds sont bloqués jusqu'à la validation de la livraison
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <TruckIcon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Livraison suivie</h3>
                <p className="text-muted-foreground">
                  Suivez votre commande en temps réel avec nos livreurs
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Package className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Triple validation</h3>
                <p className="text-muted-foreground">
                  Acheteur, vendeur et livreur valident la transaction
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Produits populaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products?.map((product) => (
              <Link key={product.id} to={`/produit/${product.id}`}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-4" />
                    <h3 className="font-semibold mb-2">{product.nom}</h3>
                    <p className="text-xl font-bold text-primary">
                      {product.prix.toLocaleString()} FCFA
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Stock: {product.stock}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez des milliers de vendeurs et acheteurs
          </p>
          <Link to="/inscription">
            <Button size="lg" variant="secondary">
              S'inscrire gratuitement
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;