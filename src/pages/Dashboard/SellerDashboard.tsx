import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Package, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const SellerDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ['seller-products', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendeur_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: orders } = useQuery({
    queryKey: ['seller-orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products(*),
          validations(*)
        `)
        .eq('vendeur_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const validateOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('validations')
        .update({ vendeur_ok: true })
        .eq('order_id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      toast.success('Commande validée');
    },
    onError: () => {
      toast.error('Erreur lors de la validation');
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Dashboard Vendeur</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un produit
          </Button>
        </div>

        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">Mes Produits</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map((product) => (
                <Card key={product.id}>
                  <CardContent className="pt-6">
                    <div className="aspect-square bg-muted rounded-lg mb-4" />
                    <h3 className="font-semibold mb-2">{product.nom}</h3>
                    <p className="text-xl font-bold text-primary mb-2">
                      {product.prix.toLocaleString()} FCFA
                    </p>
                    <div className="flex justify-between text-sm text-muted-foreground mb-4">
                      <span>Stock: {product.stock}</span>
                      <span className="capitalize">{product.statut}</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      Modifier
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {products?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Aucun produit
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            {orders?.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Commande #{order.id.slice(0, 8)}
                    </div>
                    <span className="text-sm font-normal text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Produit</h4>
                      <p>{order.products?.nom}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantité: {order.quantite}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Montant</h4>
                      <p className="text-xl font-bold">
                        {order.montant.toLocaleString()} FCFA
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Statut</h4>
                      <p className="capitalize">{order.statut.replace(/_/g, ' ')}</p>
                    </div>

                    {order.statut === 'livré' && !order.validations?.vendeur_ok && (
                      <Button
                        onClick={() => validateOrder.mutate(order.id)}
                        disabled={validateOrder.isPending}
                        className="w-full"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Valider la livraison
                      </Button>
                    )}

                    {order.validations?.vendeur_ok && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>Livraison validée</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {orders?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Aucune commande
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default SellerDashboard;