import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Store, CheckCircle, Clock, Package, Eye } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [totalShops, activeShops, pendingShops, totalProducts] = await Promise.all([
        supabase.from('shops').select('*', { count: 'exact', head: true }),
        supabase.from('shops').select('*', { count: 'exact', head: true }).eq('statut', 'actif'),
        supabase.from('shops').select('*', { count: 'exact', head: true }).eq('statut', 'en_attente'),
        supabase.from('products').select('*', { count: 'exact', head: true }),
      ]);

      return {
        totalShops: totalShops.count || 0,
        activeShops: activeShops.count || 0,
        pendingShops: pendingShops.count || 0,
        totalProducts: totalProducts.count || 0,
      };
    },
  });

  const { data: recentShops, isLoading: shopsLoading } = useQuery({
    queryKey: ['admin-recent-shops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
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

  const statCards = [
    {
      title: 'Total Boutiques',
      value: stats?.totalShops || 0,
      icon: Store,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Boutiques Actives',
      value: stats?.activeShops || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Boutiques en attente',
      value: stats?.pendingShops || 0,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Produits',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Tableau de bord Admin</h1>
        <p className="text-muted-foreground">Vue d'ensemble du système e-commerce</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Shops Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Dernières Boutiques Créées</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/boutiques')}>
              Voir tout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {shopsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : recentShops && recentShops.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentShops.map((shop) => (
                    <TableRow key={shop.id}>
                      <TableCell className="font-medium">{shop.nom_boutique}</TableCell>
                      <TableCell>{shop.email || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(shop.statut)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/boutique/${shop.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Aucune boutique trouvée</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
