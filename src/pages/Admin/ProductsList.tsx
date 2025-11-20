import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
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

export default function ProductsList() {
  const navigate = useNavigate();

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, shops(nom_boutique), users!products_vendeur_id_fkey(nom)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <AdminNavbar />
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Gestion des produits</CardTitle>
            <CardDescription>Liste de tous les produits publiés</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : products && products.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Boutique</TableHead>
                      <TableHead>Vendeur</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date de création</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.nom}</TableCell>
                        <TableCell>{product.shops?.nom_boutique || '-'}</TableCell>
                        <TableCell>{product.users?.nom || '-'}</TableCell>
                        <TableCell>{product.prix} FCFA</TableCell>
                        <TableCell>{product.stock || 0}</TableCell>
                        <TableCell>{product.categorie || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={product.statut === 'actif' ? 'default' : 'secondary'}>
                            {product.statut || 'actif'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {product.created_at ? format(new Date(product.created_at), 'dd MMM yyyy', { locale: fr }) : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/produit/${product.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucun produit trouvé
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
