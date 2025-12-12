import { useQuery } from '@tanstack/react-query';
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
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type ShopStatus = 'en_attente' | 'actif' | 'suspendu';

export default function ShopsList() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<ShopStatus | 'all'>('all');

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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/boutique/${shop.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </Button>
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
