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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AlertCircle } from 'lucide-react';

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

  const handleRoleSubmit = async () => {
    if (!user?.id || !selectedRole) {
      console.error('❌ user.id ou selectedRole manquant', { userId: user?.id, selectedRole });
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Tentative d\'enregistrement du rôle:', selectedRole, 'pour user:', user.id);
      
      // D'abord vérifier s'il y a déjà des rôles pour cet utilisateur
      const { data: existingRoles, error: checkError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      console.log('📋 Rôles existants:', existingRoles);
      
      if (checkError) {
        console.error('⚠️ Erreur lors de la vérification des rôles:', checkError);
      }

      // Si l'utilisateur a déjà ce rôle, on ne fait rien
      if (existingRoles && existingRoles.some(r => r.role === selectedRole)) {
        console.log('ℹ️ L\'utilisateur a déjà ce rôle');
        toast.success('Rôle confirmé ! Redirection en cours...');
        
        setTimeout(() => {
          if (selectedRole === 'acheteur') navigate('/dashboard-acheteur');
          if (selectedRole === 'vendeur') navigate('/ma-boutique');
          if (selectedRole === 'livreur') navigate('/dashboard-livreur');
        }, 1000);
        
        return;
      }
      
      // Insérer le nouveau rôle
      console.log('➕ Insertion du nouveau rôle...');
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: selectedRole as any
        })
        .select();

      if (error) {
        console.error('❌ Erreur Supabase lors de l\'insertion:', error);
        console.error('❌ Détails complets:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('✅ Rôle enregistré avec succès:', data);
      toast.success('Rôle enregistré avec succès ! Redirection en cours...');
      await refetch();

      // Redirect to appropriate dashboard
      setTimeout(() => {
        console.log('🔀 Redirection vers le dashboard...');
        if (selectedRole === 'acheteur') navigate('/dashboard-acheteur');
        if (selectedRole === 'vendeur') navigate('/ma-boutique');
        if (selectedRole === 'livreur') navigate('/dashboard-livreur');
      }, 1000);
    } catch (error: any) {
      console.error('❌ Erreur complète:', error);
      console.error('❌ Stack trace:', error.stack);
      toast.error(`Erreur: ${error.message || 'Impossible d\'enregistrer le rôle'}`);
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
                  <Label htmlFor="nom">Nom complet</Label>
                  <Input 
                    id="nom"
                    value={userData?.nom || ''} 
                    placeholder="Non renseigné"
                    disabled 
                    className="bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    value={userData?.email || user.email || ''} 
                    placeholder="Non renseigné"
                    disabled 
                    className="bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input 
                    id="telephone"
                    value={userData?.telephone || ''} 
                    placeholder="Non renseigné"
                    disabled 
                    className="bg-muted/50"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="space-y-4">
                  {!selectedRole && (
                    <Alert variant="destructive" className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500 dark:border-yellow-700">
                      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                      <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                        <strong>⚠️ Action requise :</strong> Vous devez sélectionner un rôle ci-dessous pour accéder aux fonctionnalités de la plateforme.
                      </AlertDescription>
                    </Alert>
                  )}
                  
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
                      onValueChange={setSelectedRole}
                      disabled={loading || !!currentRole}
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

                  {selectedRole && !currentRole && (
                    <Button 
                      onClick={handleRoleSubmit}
                      disabled={loading}
                      className="w-full"
                      size="lg"
                    >
                      {loading ? '⏳ Enregistrement...' : '✅ Valider mon rôle et accéder au dashboard'}
                    </Button>
                  )}

                  {currentRole && (
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <p className="text-sm">
                        <strong>Rôle actuel :</strong>{' '}
                        {currentRole === 'acheteur' && '🛒 Acheteur'}
                        {currentRole === 'vendeur' && '🏪 Vendeur'}
                        {currentRole === 'livreur' && '🚚 Livreur'}
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
