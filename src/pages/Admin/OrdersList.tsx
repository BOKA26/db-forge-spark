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
import { Package, Clock, Truck, CheckCircle, AlertTriangle, ShoppingBag } from 'lucide-react';

export default function OrdersList() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products(nom),
          validations(*),
          deliveries(statut, livreur_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Statistiques
  const stats = {
    total: orders?.length || 0,
    enAttente: orders?.filter(o => o.statut === 'en_attente_paiement').length || 0,
    fondsBloqués: orders?.filter(o => o.statut === 'fonds_bloques').length || 0,
    enAttenteLivreur: orders?.filter(o => o.statut === 'en_attente_livreur').length || 0,
    enLivraison: orders?.filter(o => o.statut === 'en_livraison').length || 0,
    livré: orders?.filter(o => o.statut === 'livré').length || 0,
    terminé: orders?.filter(o => o.statut === 'terminé').length || 0,
    litiges: orders?.filter(o => o.statut === 'litige').length || 0,
  };

  const getStatusBadge = (statut: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; icon: React.ReactNode }> = {
      en_attente_paiement: { variant: 'outline', label: 'En attente paiement', icon: <Clock className="h-3 w-3" /> },
      fonds_bloques: { variant: 'secondary', label: 'Fonds bloqués', icon: <Package className="h-3 w-3" /> },
      en_attente_livreur: { variant: 'secondary', label: 'En attente livreur', icon: <Truck className="h-3 w-3" /> },
      en_livraison: { variant: 'default', label: 'En livraison', icon: <Truck className="h-3 w-3" /> },
      livré: { variant: 'default', label: 'Livré', icon: <CheckCircle className="h-3 w-3" /> },
      terminé: { variant: 'default', label: 'Terminé', icon: <CheckCircle className="h-3 w-3" /> },
      litige: { variant: 'destructive', label: 'Litige', icon: <AlertTriangle className="h-3 w-3" /> },
      annulé: { variant: 'destructive', label: 'Annulé', icon: <AlertTriangle className="h-3 w-3" /> },
    };
    const config = variants[statut] || { variant: 'outline' as const, label: statut, icon: null };
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getValidationStatus = (validations: any) => {
    if (!validations) return { acheteur: false, vendeur: false, livreur: false };
    return {
      acheteur: validations.acheteur_ok || false,
      vendeur: validations.vendeur_ok || false,
      livreur: validations.livreur_ok || false,
    };
  };

  return (
    <>
      <AdminNavbar />
      <div className="container mx-auto py-8 px-4">
        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-gray-500">{stats.enAttente}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Fonds bloqués</p>
                <p className="text-2xl font-bold text-orange-500">{stats.fondsBloqués}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Att. livreur</p>
                <p className="text-2xl font-bold text-amber-500">{stats.enAttenteLivreur}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">En livraison</p>
                <p className="text-2xl font-bold text-blue-500">{stats.enLivraison}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Livré</p>
                <p className="text-2xl font-bold text-green-500">{stats.livré}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Terminé</p>
                <p className="text-2xl font-bold text-green-600">{stats.terminé}</p>
              </div>
            </CardContent>
          </Card>
          <Card className={stats.litiges > 0 ? 'border-red-500' : ''}>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Litiges</p>
                <p className="text-2xl font-bold text-red-500">{stats.litiges}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Traçabilité des commandes
            </CardTitle>
            <CardDescription>Suivi du cycle de vie de chaque commande</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Réf.</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Qté</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Livreur</TableHead>
                      <TableHead className="text-center">Validations</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const validation = getValidationStatus(order.validations);
                      const hasDelivery = Array.isArray(order.deliveries) && order.deliveries.length > 0;
                      
                      return (
                        <TableRow key={order.id} className={order.statut === 'litige' ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                          <TableCell className="font-mono text-xs">
                            #{order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {order.products?.nom || '-'}
                          </TableCell>
                          <TableCell className="font-semibold">{order.montant?.toLocaleString()} FCFA</TableCell>
                          <TableCell>{order.quantite}</TableCell>
                          <TableCell>{getStatusBadge(order.statut)}</TableCell>
                          <TableCell>
                            {hasDelivery && order.deliveries[0]?.livreur_id ? (
                              <Badge variant="outline" className="text-xs">Assigné</Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">Non assigné</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 justify-center">
                              <span title="Vendeur" className={`text-xs px-2 py-1 rounded ${validation.vendeur ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                V {validation.vendeur ? '✓' : '○'}
                              </span>
                              <span title="Livreur" className={`text-xs px-2 py-1 rounded ${validation.livreur ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                L {validation.livreur ? '✓' : '○'}
                              </span>
                              <span title="Acheteur" className={`text-xs px-2 py-1 rounded ${validation.acheteur ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                                A {validation.acheteur ? '✓' : '○'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            {order.created_at ? format(new Date(order.created_at), 'dd MMM yyyy HH:mm', { locale: fr }) : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
