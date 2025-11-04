import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Check, Ban, Trash2, ExternalLink, Mail, Phone, MapPin, Globe, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function ShopDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: shop, isLoading } = useQuery({
    queryKey: ['admin-shop', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('*, users!shops_vendeur_id_fkey(nom, email)')
        .eq('id', id!)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: products } = useQuery({
    queryKey: ['admin-shop-products', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', id!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabase
        .from('shops')
        .update({ statut: newStatus })
        .eq('id', id!);

      if (error) throw error;
    },
    onSuccess: (_, newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['admin-shop', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-shops'] });
      const statusLabels: Record<string, string> = {
        actif: 'validée',
        suspendu: 'suspendue',
      };
      toast.success(`Boutique ${statusLabels[newStatus]} avec succès`);
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du statut');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('shops').delete().eq('id', id!);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Boutique supprimée avec succès');
      navigate('/admin/boutiques');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression de la boutique');
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Boutique non trouvée</p>
            <Button onClick={() => navigate('/admin/boutiques')} className="mt-4">
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <Button variant="ghost" onClick={() => navigate('/admin/boutiques')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour à la liste
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={shop.logo_url || undefined} alt={shop.nom_boutique} />
                <AvatarFallback>{shop.nom_boutique.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl mb-2">{shop.nom_boutique}</CardTitle>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-muted-foreground">Vendeur:</span>
                  <span className="text-sm font-medium">{(shop.users as any)?.nom || 'N/A'}</span>
                </div>
                {getStatusBadge(shop.statut)}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {shop.statut !== 'actif' && (
                <Button onClick={() => updateStatusMutation.mutate('actif')} size="sm">
                  <Check className="h-4 w-4 mr-2" />
                  Valider
                </Button>
              )}
              {shop.statut !== 'suspendu' && (
                <Button
                  variant="destructive"
                  onClick={() => updateStatusMutation.mutate('suspendu')}
                  size="sm"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Suspendre
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowDeleteDialog(true)} size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {shop.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{shop.description}</p>
            </div>
          )}

          <div className="grid gap-3">
            {shop.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${shop.email}`} className="text-sm hover:underline">
                  {shop.email}
                </a>
              </div>
            )}
            {shop.telephone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${shop.telephone}`} className="text-sm hover:underline">
                  {shop.telephone}
                </a>
              </div>
            )}
            {shop.adresse && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{shop.adresse}</span>
              </div>
            )}
            {shop.site_web && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a
                  href={shop.site_web}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline flex items-center gap-1"
                >
                  {shop.site_web}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Produits associés</CardTitle>
        </CardHeader>
        <CardContent>
          {products && products.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.nom}</TableCell>
                      <TableCell>{product.prix} FCFA</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Badge variant={product.statut === 'actif' ? 'default' : 'secondary'}>
                          {product.statut}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/produit/${product.id}`)}
                        >
                          Voir produit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">Aucun produit associé</p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment supprimer cette boutique ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate()}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
