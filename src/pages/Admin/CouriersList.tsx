import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CourierRatings } from '@/components/couriers/CourierRatings';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Ban, CheckCircle, Minus, Plus, Star, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function CouriersList() {
  const queryClient = useQueryClient();
  const [selectedCourier, setSelectedCourier] = useState<any>(null);
  const [pointsToAdd, setPointsToAdd] = useState(0);

  const { data: couriers, isLoading } = useQuery({
    queryKey: ['admin-couriers'],
    queryFn: async () => {
      // Récupérer tous les utilisateurs qui ont le rôle livreur
      const { data: courierRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'livreur');

      if (rolesError) throw rolesError;

      const courierIds = courierRoles.map(r => r.user_id);

      if (courierIds.length === 0) return [];

      // Récupérer les utilisateurs avec leurs statistiques de notation
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .in('id', courierIds)
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Récupérer les statistiques de notation pour chaque livreur
      const couriersWithStats = await Promise.all(
        users.map(async (user) => {
          const { data: ratings } = await supabase
            .from('courier_ratings')
            .select('rating')
            .eq('livreur_id', user.id);

          const totalRatings = ratings?.length || 0;
          const averageRating = totalRatings > 0
            ? ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings
            : 0;

          return {
            ...user,
            totalRatings,
            averageRating: Math.round(averageRating * 10) / 10,
          };
        })
      );

      return couriersWithStats;
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async ({ courierId, newStatus }: { courierId: string; newStatus: string }) => {
      const { error } = await supabase
        .from('users')
        .update({ statut: newStatus })
        .eq('id', courierId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-couriers'] });
      const action = variables.newStatus === 'suspendu' ? 'suspendu' : 'activé';
      toast.success(`Livreur ${action} avec succès`);
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du statut');
    },
  });

  const pointsMutation = useMutation({
    mutationFn: async ({ courierId, pointsChange }: { courierId: string; pointsChange: number }) => {
      const courier = couriers?.find(c => c.id === courierId);
      if (!courier) throw new Error('Livreur non trouvé');

      const newPoints = Math.max(0, (courier.points || 0) + pointsChange);

      const { error } = await supabase
        .from('users')
        .update({ points: newPoints })
        .eq('id', courierId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-couriers'] });
      toast.success('Points mis à jour avec succès');
      setSelectedCourier(null);
      setPointsToAdd(0);
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour des points');
    },
  });

  const handleSuspend = (courierId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspendu' ? 'actif' : 'suspendu';
    suspendMutation.mutate({ courierId, newStatus });
  };

  const handlePointsChange = (type: 'add' | 'remove') => {
    if (!selectedCourier) return;
    const change = type === 'add' ? Math.abs(pointsToAdd) : -Math.abs(pointsToAdd);
    pointsMutation.mutate({ courierId: selectedCourier.id, pointsChange: change });
  };

  return (
    <>
      <AdminNavbar />
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Gestion des livreurs</CardTitle>
            <CardDescription>Liste de tous les livreurs avec leurs informations et points</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : couriers && couriers.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Pays</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Évaluation</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date d'inscription</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {couriers.map((courier) => (
                      <TableRow key={courier.id}>
                        <TableCell className="font-medium">{courier.nom}</TableCell>
                        <TableCell>{courier.email}</TableCell>
                        <TableCell>{courier.telephone || '-'}</TableCell>
                        <TableCell>{courier.pays || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {courier.points || 0} pts
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {courier.totalRatings > 0 ? (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{courier.averageRating.toFixed(1)}</span>
                              <span className="text-xs text-muted-foreground">
                                ({courier.totalRatings})
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Aucune note</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={courier.statut === 'suspendu' ? 'destructive' : 'default'}>
                            {courier.statut || 'actif'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {courier.created_at ? format(new Date(courier.created_at), 'dd MMM yyyy', { locale: fr }) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              variant={courier.statut === 'suspendu' ? 'outline' : 'destructive'}
                              size="sm"
                              onClick={() => handleSuspend(courier.id, courier.statut || 'actif')}
                            >
                              {courier.statut === 'suspendu' ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Activer
                                </>
                              ) : (
                                <>
                                  <Ban className="h-4 w-4 mr-1" />
                                  Suspendre
                                </>
                              )}
                            </Button>
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Avis
                                </Button>
                              </SheetTrigger>
                              <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                                <SheetHeader>
                                  <SheetTitle>Évaluations de {courier.nom}</SheetTitle>
                                </SheetHeader>
                                <div className="mt-6">
                                  <CourierRatings courierId={courier.id} />
                                </div>
                              </SheetContent>
                            </Sheet>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCourier(courier);
                                    setPointsToAdd(0);
                                  }}
                                >
                                  Gérer points
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Gérer les points de {courier.nom}</DialogTitle>
                                  <DialogDescription>
                                    Points actuels: {courier.points || 0}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="points" className="text-right">
                                      Points
                                    </Label>
                                    <Input
                                      id="points"
                                      type="number"
                                      value={pointsToAdd}
                                      onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
                                      className="col-span-3"
                                      placeholder="Nombre de points"
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => handlePointsChange('remove')}
                                    disabled={pointsMutation.isPending}
                                  >
                                    <Minus className="h-4 w-4 mr-2" />
                                    Retirer
                                  </Button>
                                  <Button
                                    onClick={() => handlePointsChange('add')}
                                    disabled={pointsMutation.isPending}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucun livreur trouvé
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
