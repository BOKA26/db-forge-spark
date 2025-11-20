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

export default function DeliveriesList() {
  const { data: deliveries, isLoading } = useQuery({
    queryKey: ['admin-deliveries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deliveries')
        .select(`
          *,
          orders(montant, products(nom)),
          users!deliveries_acheteur_id_fkey(nom),
          users!deliveries_vendeur_id_fkey(nom),
          users!deliveries_livreur_id_fkey(nom)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (statut: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      en_attente: { variant: 'secondary', label: 'En attente' },
      assigné: { variant: 'outline', label: 'Assigné' },
      en_route: { variant: 'default', label: 'En route' },
      livré: { variant: 'default', label: 'Livré' },
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
            <CardTitle>Gestion des livraisons</CardTitle>
            <CardDescription>Liste de toutes les livraisons</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : deliveries && deliveries.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Acheteur</TableHead>
                      <TableHead>Vendeur</TableHead>
                      <TableHead>Livreur</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Code tracking</TableHead>
                      <TableHead>Date assignation</TableHead>
                      <TableHead>Date livraison</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveries.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell className="font-medium">
                          {delivery.orders?.products?.nom || '-'}
                        </TableCell>
                        <TableCell>
                          {(delivery as any).users_deliveries_acheteur_id_fkey?.nom || '-'}
                        </TableCell>
                        <TableCell>
                          {(delivery as any).users_deliveries_vendeur_id_fkey?.nom || '-'}
                        </TableCell>
                        <TableCell>
                          {(delivery as any).users_deliveries_livreur_id_fkey?.nom || 'Non assigné'}
                        </TableCell>
                        <TableCell>
                          {delivery.orders?.montant ? `${delivery.orders.montant} FCFA` : '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(delivery.statut)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {delivery.tracking_code || '-'}
                        </TableCell>
                        <TableCell>
                          {delivery.date_assignation ? format(new Date(delivery.date_assignation), 'dd MMM yyyy HH:mm', { locale: fr }) : '-'}
                        </TableCell>
                        <TableCell>
                          {delivery.date_livraison ? format(new Date(delivery.date_livraison), 'dd MMM yyyy HH:mm', { locale: fr }) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucune livraison trouvée
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
