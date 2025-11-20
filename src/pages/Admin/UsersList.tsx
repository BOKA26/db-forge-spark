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

export default function UsersList() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: userRoles, isLoading: rolesLoading } = useQuery({
    queryKey: ['admin-user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*');

      if (error) throw error;
      return data;
    },
  });

  const getUserRoles = (userId: string) => {
    if (!userRoles) return [];
    return userRoles.filter(r => r.user_id === userId);
  };

  return (
    <>
      <AdminNavbar />
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Gestion des utilisateurs</CardTitle>
            <CardDescription>Liste de tous les utilisateurs inscrits</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || rolesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : users && users.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Entreprise</TableHead>
                      <TableHead>Pays</TableHead>
                      <TableHead>Rôles</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date d'inscription</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.nom}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.telephone || '-'}</TableCell>
                        <TableCell>{user.entreprise || '-'}</TableCell>
                        <TableCell>{user.pays || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {getUserRoles(user.id).map((role) => (
                              <Badge 
                                key={role.id} 
                                variant={role.is_active ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {role.role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.statut === 'actif' ? 'default' : 'destructive'}>
                            {user.statut || 'actif'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.created_at ? format(new Date(user.created_at), 'dd MMM yyyy', { locale: fr }) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucun utilisateur trouvé
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
