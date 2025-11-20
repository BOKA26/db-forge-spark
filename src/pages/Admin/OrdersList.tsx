import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminNavbar } from '@/components/layout/AdminNavbar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function OrdersList() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products(nom),
          users!orders_acheteur_id_fkey(nom),
          users!orders_vendeur_id_fkey(nom)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (statut: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      en_attente_paiement: { variant: 'secondary', label: 'En attente paiement' },
      fonds_bloques: { variant: 'outline', label: 'Fonds bloqués' },
      en_livraison: { variant: 'default', label: 'En livraison' },
      livré: { variant: 'default', label: 'Livré' },
      terminé: { variant: 'default', label: 'Terminé' },
      annulé: { variant: 'destructive', label: 'Annulé' },
    };
    const config = variants[statut] || { variant: 'outline', label: statut };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <>
      <AdminNavbar />
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Gestion des commandes</CardTitle>
            <CardDescription>Liste de toutes les commandes</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Acheteur</TableHead>
                      <TableHead>Vendeur</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Référence</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.products?.nom || '-'}
                        </TableCell>
                        <TableCell>
                          {order.users?.nom || '-'}
                        </TableCell>
                        <TableCell>
                          {(order as any).users_orders_vendeur_id_fkey?.nom || '-'}
                        </TableCell>
                        <TableCell>{order.montant} FCFA</TableCell>
                        <TableCell>{order.quantite}</TableCell>
                        <TableCell>{getStatusBadge(order.statut)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {order.reference_gateway || '-'}
                        </TableCell>
                        <TableCell>
                          {order.created_at ? format(new Date(order.created_at), 'dd MMM yyyy HH:mm', { locale: fr }) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucune commande trouvée
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
