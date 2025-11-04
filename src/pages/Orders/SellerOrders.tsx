import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Package, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const SellerOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
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

  const markAsShipped = useMutation({
    mutationFn: async (orderId: string) => {
      const { error: validationError } = await supabase
        .from('validations')
        .update({ vendeur_ok: true })
        .eq('order_id', orderId);

      if (validationError) throw validationError;

      const { error: deliveryError } = await supabase
        .from('deliveries')
        .update({ 
          statut: 'en_livraison',
          date_assignation: new Date().toISOString()
        })
        .eq('order_id', orderId);

      if (deliveryError) throw deliveryError;

      const { data: order } = await supabase
        .from('orders')
        .select('acheteur_id')
        .eq('id', orderId)
        .single();

      if (order) {
        await supabase.from('notifications').insert({
          user_id: order.acheteur_id,
          message: 'Votre commande est en cours de livraison.',
          canal: 'app',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      toast.success('✅ Commande expédiée');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const getStatusBadge = (statut: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      'en_attente_paiement': { variant: 'outline', label: 'En attente paiement' },
      'fonds_bloques': { variant: 'secondary', label: 'Fonds bloqués' },
      'en_livraison': { variant: 'default', label: 'En livraison' },
      'livré': { variant: 'default', label: 'Livré' },
      'terminé': { variant: 'secondary', label: 'Terminé' },
    };

    const config = statusConfig[statut] || { variant: 'outline' as const, label: statut };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container py-8 flex-1">
        <h1 className="text-4xl font-bold mb-8 flex items-center gap-2">
          <Package className="h-8 w-8" />
          Mes Commandes Reçues
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Commandes à traiter</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">Chargement...</div>
            ) : orders && orders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          #{order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>{order.products?.nom || 'N/A'}</TableCell>
                        <TableCell>{order.quantite}</TableCell>
                        <TableCell className="font-semibold">
                          {order.montant.toLocaleString()} FCFA
                        </TableCell>
                        <TableCell>{getStatusBadge(order.statut)}</TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          {order.statut === 'fonds_bloques' && !order.validations?.vendeur_ok ? (
                            <Button
                              size="sm"
                              onClick={() => markAsShipped.mutate(order.id)}
                              disabled={markAsShipped.isPending}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Expédier
                            </Button>
                          ) : order.validations?.vendeur_ok ? (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Expédié
                            </Badge>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune commande reçue</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default SellerOrders;
