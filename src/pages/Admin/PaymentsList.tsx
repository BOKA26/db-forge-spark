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
import { DollarSign, Lock, Unlock, AlertTriangle, TrendingUp } from 'lucide-react';

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
            statut,
            products(nom),
            acheteur:users!orders_acheteur_id_fkey(nom),
            vendeur:users!orders_vendeur_id_fkey(nom)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Statistiques
  const stats = {
    total: payments?.reduce((sum, p) => sum + (p.montant || 0), 0) || 0,
    bloques: payments?.filter(p => p.statut === 'bloqué').reduce((sum, p) => sum + (p.montant || 0), 0) || 0,
    debloques: payments?.filter(p => p.statut === 'débloqué').reduce((sum, p) => sum + (p.montant || 0), 0) || 0,
    litiges: payments?.filter(p => p.orders?.statut === 'litige').length || 0,
  };

  const getStatusBadge = (statut: string, orderStatut?: string) => {
    if (orderStatut === 'litige') {
      return <Badge variant="destructive">Litige</Badge>;
    }
    
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      bloqué: { variant: 'secondary', label: '🔒 Bloqué' },
      débloqué: { variant: 'default', label: '✅ Débloqué' },
      remboursé: { variant: 'outline', label: '↩️ Remboursé' },
      annulé: { variant: 'destructive', label: '❌ Annulé' },
    };
    const config = variants[statut] || { variant: 'outline', label: statut };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getOrderStatusLabel = (statut?: string) => {
    const labels: Record<string, string> = {
      en_attente_paiement: 'En attente paiement',
      fonds_bloques: 'Fonds bloqués',
      en_livraison: 'En livraison',
      livré: 'Livré',
      terminé: 'Terminé',
      litige: 'Litige',
      annulé: 'Annulé',
    };
    return labels[statut || ''] || statut || '-';
  };

  return (
    <>
      <AdminNavbar />
      <div className="container mx-auto py-8 px-4">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total.toLocaleString()} FCFA</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-orange-500/10">
                  <Lock className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fonds bloqués</p>
                  <p className="text-2xl font-bold text-orange-500">{stats.bloques.toLocaleString()} FCFA</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/10">
                  <Unlock className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fonds débloqués</p>
                  <p className="text-2xl font-bold text-green-500">{stats.debloques.toLocaleString()} FCFA</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-red-500/10">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Litiges</p>
                  <p className="text-2xl font-bold text-red-500">{stats.litiges}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Traçabilité des paiements
            </CardTitle>
            <CardDescription>Suivi de tous les paiements et leur statut</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : payments && payments.length > 0 ? (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Acheteur</TableHead>
                      <TableHead>Vendeur</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut Paiement</TableHead>
                      <TableHead>Statut Commande</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Référence</TableHead>
                      <TableHead>Date paiement</TableHead>
                      <TableHead>Date déblocage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id} className={payment.orders?.statut === 'litige' ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                        <TableCell className="font-medium">
                          {payment.orders?.products?.nom || '-'}
                        </TableCell>
                        <TableCell>
                          {(payment.orders as any)?.acheteur?.nom || '-'}
                        </TableCell>
                        <TableCell>
                          {(payment.orders as any)?.vendeur?.nom || '-'}
                        </TableCell>
                        <TableCell className="font-semibold">{payment.montant?.toLocaleString()} FCFA</TableCell>
                        <TableCell>{getStatusBadge(payment.statut, payment.orders?.statut)}</TableCell>
                        <TableCell>
                          <span className={`text-sm ${payment.orders?.statut === 'litige' ? 'text-red-600 font-semibold' : ''}`}>
                            {getOrderStatusLabel(payment.orders?.statut)}
                          </span>
                        </TableCell>
                        <TableCell>{payment.mode || '-'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {payment.reference_gateway?.slice(0, 12) || '-'}
                        </TableCell>
                        <TableCell>
                          {payment.created_at ? format(new Date(payment.created_at), 'dd MMM yyyy HH:mm', { locale: fr }) : '-'}
                        </TableCell>
                        <TableCell>
                          {payment.debloque_at ? (
                            <span className="text-green-600">
                              {format(new Date(payment.debloque_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
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
