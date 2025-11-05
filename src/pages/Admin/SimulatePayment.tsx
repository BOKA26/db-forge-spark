import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CreditCard, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const SimulatePayment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['pending-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products(*),
          users!orders_acheteur_id_fkey(nom, email)
        `)
        .eq('statut', 'en_attente_paiement')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const simulatePayment = useMutation({
    mutationFn: async (orderId: string) => {
      const order = orders?.find(o => o.id === orderId);
      if (!order) throw new Error('Order not found');

      // Update order status to fonds_bloques
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          statut: 'fonds_bloques',
          reference_gateway: `TEST-${Date.now()}`
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: orderId,
          montant: order.montant,
          mode: 'Test',
          statut: 'bloqué',
          reference_gateway: `TEST-${Date.now()}`,
        });

      if (paymentError) throw paymentError;

      // Create delivery record
      const { error: deliveryError } = await supabase
        .from('deliveries')
        .insert({
          order_id: orderId,
          vendeur_id: order.vendeur_id,
          acheteur_id: order.acheteur_id,
          statut: 'en_attente',
        });

      if (deliveryError && deliveryError.code !== '23505') { // Ignore duplicate error
        throw deliveryError;
      }

      // Send notifications
      await supabase.from('notifications').insert([
        {
          user_id: order.acheteur_id,
          message: '✅ Votre paiement a été sécurisé avec succès (TEST).',
          canal: 'app',
        },
        {
          user_id: order.vendeur_id,
          message: '🎉 Nouvelle commande payée. Préparez l\'expédition.',
          canal: 'app',
        },
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-orders'] });
      toast.success('💳 Paiement simulé avec succès !');
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container py-8 flex-1">
        <h1 className="text-4xl font-bold mb-8 flex items-center gap-2">
          <CreditCard className="h-8 w-8" />
          Simuler des Paiements (Admin)
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Commandes en attente de paiement</CardTitle>
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
                      <TableHead>Acheteur</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          #{order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>{order.users?.nom || 'N/A'}</TableCell>
                        <TableCell>{order.products?.nom || 'N/A'}</TableCell>
                        <TableCell className="font-semibold">
                          {order.montant.toLocaleString()} FCFA
                        </TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => simulatePayment.mutate(order.id)}
                            disabled={simulatePayment.isPending}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Simuler paiement
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune commande en attente de paiement</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Outil de test uniquement</strong> : Cette page permet de simuler des paiements réussis 
            pour tester le flow complet sans passer par Paystack.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SimulatePayment;
