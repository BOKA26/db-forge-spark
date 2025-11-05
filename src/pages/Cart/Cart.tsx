import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, Trash2, Minus, Plus, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Récupérer les articles du panier (orders en attente de paiement)
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cart-items', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products (
            id,
            nom,
            prix,
            images,
            stock
          )
        `)
        .eq('acheteur_id', user.id)
        .eq('statut', 'en_attente_paiement')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Mutation pour mettre à jour la quantité
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ orderId, newQuantity, productPrice }: { orderId: string; newQuantity: number; productPrice: number }) => {
      const { error } = await supabase
        .from('orders')
        .update({ 
          quantite: newQuantity,
          montant: newQuantity * productPrice
        })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] });
      toast.success('Quantité mise à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  // Mutation pour supprimer un article
  const deleteItemMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] });
      toast.success('Article retiré du panier');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  // Mutation pour initialiser le paiement Paystack
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!cartItems.length || !user?.email) return;

      const orderIds = cartItems.map(item => item.id);
      const totalAmount = cartItems.reduce((sum, item) => sum + Number(item.montant), 0);

      // Appeler l'edge function pour initialiser Paystack
      const { data, error } = await supabase.functions.invoke('paystack-initialize', {
        body: {
          orderIds,
          email: user.email,
          amount: totalAmount
        }
      });

      if (error) throw error;
      if (!data?.authorization_url) throw new Error('No authorization URL returned');

      // Rediriger vers la page de paiement Paystack
      window.location.href = data.authorization_url;
    },
    onSuccess: () => {
      // Invalider le cache du panier après redirection
      queryClient.invalidateQueries({ queryKey: ['cart-items'] });
    },
    onError: (error) => {
      console.error('Payment initialization error:', error);
      toast.error('Erreur lors de l\'initialisation du paiement');
    },
  });

  const handleQuantityChange = (orderId: string, currentQuantity: number, delta: number, maxStock: number, productPrice: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity < 1 || newQuantity > maxStock) return;
    
    updateQuantityMutation.mutate({ orderId, newQuantity, productPrice });
  };

  const total = cartItems.reduce((sum, item) => sum + Number(item.montant), 0);

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="container py-8 flex-1">
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-4">Connectez-vous pour voir votre panier</h2>
              <Link to="/auth/login">
                <Button>Se connecter</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container py-8 flex-1">
        <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
          <ShoppingCart className="h-10 w-10" />
          Mon Panier
          {cartItems.length > 0 && (
            <span className="text-lg text-muted-foreground">({cartItems.length})</span>
          )}
        </h1>

        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Chargement...</p>
            </CardContent>
          </Card>
        ) : cartItems.length === 0 ? (
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
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Image produit */}
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        {item.products?.images?.[0] ? (
                          <img
                            src={item.products.images[0]}
                            alt={item.products.nom}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Détails produit */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{item.products?.nom}</h3>
                        <p className="text-2xl font-bold mb-4">{item.products?.prix} FCFA</p>

                        <div className="flex items-center gap-4">
                          {/* Contrôle quantité */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleQuantityChange(item.id, item.quantite, -1, item.products.stock, item.products.prix)}
                              disabled={item.quantite <= 1 || updateQuantityMutation.isPending}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center font-semibold">{item.quantite}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleQuantityChange(item.id, item.quantite, 1, item.products.stock, item.products.prix)}
                              disabled={item.quantite >= item.products.stock || updateQuantityMutation.isPending}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Bouton supprimer */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteItemMutation.mutate(item.id)}
                            disabled={deleteItemMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        {item.products.stock < 10 && (
                          <p className="text-sm text-orange-500 mt-2">
                            Plus que {item.products.stock} en stock
                          </p>
                        )}
                      </div>

                      {/* Total ligne */}
                      <div className="text-right">
                        <p className="text-lg font-bold">{Number(item.montant).toFixed(0)} FCFA</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Résumé commande */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Résumé de la commande</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span className="font-semibold">{total.toFixed(0)} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Livraison</span>
                      <span className="font-semibold">Gratuite</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-lg font-bold">{total.toFixed(0)} FCFA</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => checkoutMutation.mutate()}
                    disabled={checkoutMutation.isPending}
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    {checkoutMutation.isPending ? 'Redirection...' : 'Procéder au paiement'}
                  </Button>

                  <Link to="/produits">
                    <Button variant="ghost" className="w-full mt-3">
                      Continuer mes achats
                    </Button>
                  </Link>
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
