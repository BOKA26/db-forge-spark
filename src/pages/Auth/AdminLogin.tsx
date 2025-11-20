import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

const adminLoginSchema = z.object({
  email: z.string().email('Email invalide').max(255),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

type AdminLoginForm = z.infer<typeof adminLoginSchema>;

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data: AdminLoginForm) => {
    setLoading(true);
    try {
      // Se connecter
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        toast.error('Email ou mot de passe incorrect');
        setLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error('Erreur lors de la connexion');
        setLoading(false);
        return;
      }

      // Vérifier le rôle admin
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .eq('role', 'admin')
        .eq('is_active', true)
        .maybeSingle();

      if (roleError) {
        console.error('Erreur vérification rôle:', roleError);
        toast.error('Erreur lors de la vérification du rôle');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (!roleData) {
        toast.error('Accès refusé : vous n\'avez pas les droits administrateur', {
          description: 'Cette page est réservée aux administrateurs.',
        });
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Succès - rediriger vers le dashboard admin
      toast.success('Connexion réussie !');
      
      // S'assurer de la redirection vers le dashboard admin
      window.location.href = '/admin/dashboard';

    } catch (error: any) {
      console.error('Erreur connexion admin:', error);
      toast.error(error.message || 'Erreur lors de la connexion');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Shield className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Connexion Administrateur</CardTitle>
          <CardDescription className="text-center">
            Connectez-vous avec votre compte administrateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@exemple.com"
                {...register('email')}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                disabled={loading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <Link to="/mot-de-passe-oublie" className="hover:text-primary underline">
                Mot de passe oublié ?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
