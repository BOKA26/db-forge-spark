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

export default function PaymentsList() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          orders(
            montant,
            products(nom),
            users!orders_acheteur_id_fkey(nom)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (statut: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      bloqué: { variant: 'secondary', label: 'Bloqué' },
      débloqué: { variant: 'default', label: 'Débloqué' },
      remboursé: { variant: 'outline', label: 'Remboursé' },
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
            <CardTitle>Gestion des paiements</CardTitle>
            <CardDescription>Liste de tous les paiements</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : payments && payments.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Acheteur</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Référence</TableHead>
                      <TableHead>Date paiement</TableHead>
                      <TableHead>Date déblocage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.orders?.products?.nom || '-'}
                        </TableCell>
                        <TableCell>
                          {payment.orders?.users?.nom || '-'}
                        </TableCell>
                        <TableCell>{payment.montant} FCFA</TableCell>
                        <TableCell>{payment.mode || '-'}</TableCell>
                        <TableCell>{getStatusBadge(payment.statut)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {payment.reference_gateway || '-'}
                        </TableCell>
                        <TableCell>
                          {payment.created_at ? format(new Date(payment.created_at), 'dd MMM yyyy HH:mm', { locale: fr }) : '-'}
                        </TableCell>
                        <TableCell>
                          {payment.debloque_at ? format(new Date(payment.debloque_at), 'dd MMM yyyy HH:mm', { locale: fr }) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucun paiement trouvé
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
