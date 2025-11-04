import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const UserProfile = () => {
  const { user } = useAuth();
  const { data: currentRole, refetch } = useUserRole();
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    if (currentRole) {
      setSelectedRole(currentRole);
    }
  }, [currentRole]);

  const fetchUserData = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user data:', error);
      return;
    }

    setUserData(data);
  };

  const handleRoleChange = async (newRole: string) => {
    if (!user?.id || !newRole) return;

    setLoading(true);
    try {
      // Delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);

      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert([{
          user_id: user.id,
          role: newRole as any
        }]);

      if (error) throw error;

      toast.success('Rôle mis à jour avec succès !');
      setSelectedRole(newRole);
      await refetch();

      // Redirect to appropriate dashboard
      setTimeout(() => {
        switch (newRole) {
          case 'acheteur':
            navigate('/dashboard-acheteur');
            break;
          case 'vendeur':
            navigate('/ma-boutique');
            break;
          case 'livreur':
            navigate('/dashboard-livreur');
            break;
          default:
            navigate('/');
        }
      }, 1000);
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error('Erreur lors de la mise à jour du rôle');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-muted/40 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Mon Profil</CardTitle>
              <CardDescription>
                Gérez vos informations personnelles et choisissez votre rôle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom complet</Label>
                  <Input value={userData?.nom || ''} disabled />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={userData?.email || user.email || ''} disabled />
                </div>

                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input value={userData?.telephone || ''} disabled />
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Choisissez votre rôle</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Sélectionnez votre rôle sur la plateforme. Vous serez automatiquement redirigé vers le dashboard correspondant.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Votre rôle</Label>
                    <Select 
                      value={selectedRole} 
                      onValueChange={handleRoleChange}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="-- Sélectionnez un rôle --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acheteur">🛒 Acheteur</SelectItem>
                        <SelectItem value="vendeur">🏪 Vendeur</SelectItem>
                        <SelectItem value="livreur">🚚 Livreur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedRole && (
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <p className="text-sm">
                        <strong>Rôle actuel :</strong>{' '}
                        {selectedRole === 'acheteur' && '🛒 Acheteur'}
                        {selectedRole === 'vendeur' && '🏪 Vendeur'}
                        {selectedRole === 'livreur' && '🚚 Livreur'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;
