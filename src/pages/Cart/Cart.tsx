import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
  // Placeholder for future cart implementation
  const cartItems: any[] = [];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container py-8 flex-1">
        <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
          <ShoppingCart className="h-10 w-10" />
          Mon Panier
        </h1>

        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-4">Votre panier est vide</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Découvrez notre catalogue de produits et ajoutez des articles à votre panier.
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/produits">
                  <Button>
                    <Package className="mr-2 h-4 w-4" />
                    Voir les produits
                  </Button>
                </Link>
                <Link to="/boutiques">
                  <Button variant="outline">
                    Voir les boutiques
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  {/* Future cart items list */}
                  <p className="text-muted-foreground">Articles du panier à venir...</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Résumé de la commande</h3>
                  {/* Future order summary */}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
