import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TruckIcon, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const CourierDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: deliveries } = useQuery({
    queryKey: ['courier-deliveries', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deliveries')
        .select(`
          *,
          orders!inner(
            *,
            products(*),
            validations(*)
          )
        `)
        .eq('livreur_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const markAsDelivered = useMutation({
    mutationFn: async (deliveryId: string) => {
      const delivery = deliveries?.find(d => d.id === deliveryId);
      if (!delivery) throw new Error('Delivery not found');

      // Update delivery status
      const { error: deliveryError } = await supabase
        .from('deliveries')
        .update({ statut: 'livrée', date_livraison: new Date().toISOString() })
        .eq('id', deliveryId);

      if (deliveryError) throw deliveryError;

      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ statut: 'livré' })
        .eq('id', delivery.order_id);

      if (orderError) throw orderError;

      // Update validation
      const { error: validationError } = await supabase
        .from('validations')
        .update({ livreur_ok: true })
        .eq('order_id', delivery.order_id);

      if (validationError) throw validationError;

      // Send notification to buyer
      const { data: order } = await supabase
        .from('orders')
        .select('acheteur_id')
        .eq('id', delivery.order_id)
        .single();

      if (order) {
        await supabase.from('notifications').insert({
          user_id: order.acheteur_id,
          message: 'Votre colis est livré. Merci de confirmer la réception.',
          canal: 'app',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courier-deliveries'] });
      toast.success('Livraison marquée comme effectuée');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });


  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">Dashboard Livreur</h1>

        <div className="grid gap-6">
          {deliveries?.map((delivery) => (
            <Card key={delivery.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TruckIcon className="h-5 w-5" />
                    Livraison #{delivery.id.slice(0, 8)}
                  </div>
                  <span className="text-sm font-normal text-muted-foreground">
                    {new Date(delivery.created_at).toLocaleDateString()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Produit</h4>
                    <p>{delivery.orders?.products?.nom}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Statut</h4>
                    <p className="capitalize">{delivery.statut.replace(/_/g, ' ')}</p>
                  </div>

                  {delivery.tracking_code && (
                    <div>
                      <h4 className="font-semibold mb-2">Code de suivi</h4>
                      <p className="font-mono">{delivery.tracking_code}</p>
                    </div>
                  )}

                  {delivery.statut === 'en_livraison' && (
                    <Button
                      onClick={() => markAsDelivered.mutate(delivery.id)}
                      disabled={markAsDelivered.isPending}
                      className="w-full"
                    >
                      Marquer comme livrée
                    </Button>
                  )}

                  {(delivery.orders as any)?.validations?.[0]?.livreur_ok && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span>Livraison validée</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {deliveries?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Aucune livraison
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CourierDashboard;