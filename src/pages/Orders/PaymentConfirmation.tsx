import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const PaymentConfirmation = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  const { user } = useAuth();
  const [verifying, setVerifying] = useState(true);

  // Récupérer les commandes liées à cette référence
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['confirmed-orders', reference],
    queryFn: async () => {
      if (!user || !reference) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products (
            id,
            nom,
            prix,
            images
          )
        `)
        .eq('acheteur_id', user.id)
        .eq('reference_gateway', reference)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!reference,
  });

  useEffect(() => {
    // Simulation de vérification du paiement
    const timer = setTimeout(() => {
      setVerifying(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!reference) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="container py-8 flex-1">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-24 w-24 text-destructive mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-4">Référence de paiement manquante</h2>
              <p className="text-muted-foreground mb-6">
                Aucune référence de transaction n'a été trouvée.
              </p>
              <Link to="/panier">
                <Button>Retour au panier</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (verifying || isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="container py-8 flex-1">
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-24 w-24 text-primary mx-auto mb-6 animate-spin" />
              <h2 className="text-2xl font-semibold mb-4">Vérification du paiement...</h2>
              <p className="text-muted-foreground">
                Veuillez patienter pendant que nous confirmons votre paiement.
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const total = orders.reduce((sum, order) => sum + Number(order.montant), 0);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container py-8 flex-1">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Message de succès */}
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2 text-green-900 dark:text-green-100">
                Paiement confirmé !
              </h1>
              <p className="text-green-700 dark:text-green-300 mb-4">
                Merci pour votre commande. Votre paiement a été traité avec succès.
              </p>
              <div className="inline-block bg-white dark:bg-gray-800 px-4 py-2 rounded-lg">
                <p className="text-sm text-muted-foreground">Référence de transaction</p>
                <p className="font-mono font-semibold">{reference}</p>
              </div>
            </CardContent>
          </Card>

          {/* Détails de la commande */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Package className="h-6 w-6" />
                Détails de votre commande
              </h2>

              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                    {/* Image produit */}
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-background">
                      {order.products?.images?.[0] ? (
                        <img
                          src={order.products.images[0]}
                          alt={order.products.nom}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Détails */}
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{order.products?.nom}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Quantité: {order.quantite} × {order.products?.prix} FCFA
                      </p>
                      <Badge variant="outline">
                        {order.statut === 'fonds_bloques' ? 'Fonds bloqués' : order.statut}
                      </Badge>
                    </div>

                    {/* Prix */}
                    <div className="text-right">
                      <p className="font-bold text-lg">{Number(order.montant).toFixed(0)} FCFA</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total payé</span>
                  <span className="text-2xl font-bold">{total.toFixed(0)} FCFA</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prochaines étapes */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Prochaines étapes</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <span>Le vendeur a été notifié de votre commande</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <span>Vous recevrez une notification lorsque la livraison sera assignée</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <span>Vous pourrez suivre votre commande depuis "Mes Commandes"</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <span>Les fonds seront débloqués après validation de la livraison</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/mes-commandes">
              <Button size="lg" className="gap-2">
                <Package className="h-5 w-5" />
                Voir mes commandes
              </Button>
            </Link>
            <Link to="/produits">
              <Button size="lg" variant="outline" className="gap-2">
                <ShoppingBag className="h-5 w-5" />
                Continuer mes achats
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentConfirmation;
