import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Package, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders } = useQuery({
    queryKey: ['buyer-orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products(*),
          validations(*)
        `)
        .eq('acheteur_id', user?.id)
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
        .update({ acheteur_ok: true })
        .eq('order_id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] });
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
        <h1 className="text-4xl font-bold mb-8">Dashboard Acheteur</h1>

        <div className="grid gap-6">
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

                  {order.statut === 'livré' && !order.validations?.acheteur_ok && (
                    <Button
                      onClick={() => validateOrder.mutate(order.id)}
                      disabled={validateOrder.isPending}
                      className="w-full"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirmer la réception
                    </Button>
                  )}

                  {order.validations?.acheteur_ok && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span>Réception confirmée</span>
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
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BuyerDashboard;