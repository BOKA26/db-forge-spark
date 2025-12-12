import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle, Clock, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

type ShopStatus = 'en_attente' | 'actif' | 'suspendu';

export default function ShopsList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ShopStatus | 'all'>('all');

  const updateShopStatus = useMutation({
    mutationFn: async ({ shopId, status }: { shopId: string; status: ShopStatus }) => {
      const { error } = await supabase
        .from('shops')
        .update({ statut: status })
        .eq('id', shopId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shops'] });
      toast.success('Statut de la boutique mis à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const { data: shops, isLoading } = useQuery({
    queryKey: ['admin-shops', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('statut', statusFilter);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching shops:', error);
        throw error;
      }
      return data;
    },
  });

  const getStatusBadge = (statut: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      en_attente: { variant: 'secondary', label: 'En attente' },
      actif: { variant: 'default', label: 'Active' },
      suspendu: { variant: 'destructive', label: 'Suspendue' },
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
          <CardTitle>Gestion des boutiques</CardTitle>
          <CardDescription>Liste de toutes les boutiques enregistrées par les vendeurs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
              size="sm"
            >
              Toutes
            </Button>
            <Button
              variant={statusFilter === 'en_attente' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('en_attente')}
              size="sm"
            >
              En attente
            </Button>
            <Button
              variant={statusFilter === 'actif' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('actif')}
              size="sm"
            >
              Actives
            </Button>
            <Button
              variant={statusFilter === 'suspendu' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('suspendu')}
              size="sm"
            >
              Suspendues
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : shops && shops.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Vendeur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shops.map((shop) => (
                    <TableRow key={shop.id}>
                      <TableCell className="font-medium">{shop.nom_boutique}</TableCell>
                      <TableCell>{shop.email || 'N/A'}</TableCell>
                      <TableCell>{shop.email || 'N/A'}</TableCell>
                      <TableCell>{shop.telephone || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(shop.statut)}</TableCell>
                      <TableCell>
                        {shop.created_at
                          ? format(new Date(shop.created_at), 'dd MMM yyyy', { locale: fr })
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          {shop.statut !== 'actif' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => updateShopStatus.mutate({ shopId: shop.id, status: 'actif' })}
                              disabled={updateShopStatus.isPending}
                              title="Activer"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {shop.statut !== 'en_attente' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-yellow-600 hover:text-yellow-700"
                              onClick={() => updateShopStatus.mutate({ shopId: shop.id, status: 'en_attente' })}
                              disabled={updateShopStatus.isPending}
                              title="Mettre en attente"
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                          )}
                          {shop.statut !== 'suspendu' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => updateShopStatus.mutate({ shopId: shop.id, status: 'suspendu' })}
                              disabled={updateShopStatus.isPending}
                              title="Suspendre"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/boutique/${shop.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucune boutique trouvée pour ce filtre.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
