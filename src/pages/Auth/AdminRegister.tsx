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

const adminRegisterSchema = z.object({
  accessCode: z.string().min(1, 'Le code d\'accès est requis'),
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  email: z.string().email('Email invalide').max(255),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  telephone: z.string().min(10, 'Téléphone invalide').max(20),
});

type AdminRegisterForm = z.infer<typeof adminRegisterSchema>;

export default function AdminRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminRegisterForm>({
    resolver: zodResolver(adminRegisterSchema),
  });

  const onSubmit = async (data: AdminRegisterForm) => {
    setLoading(true);
    try {
      // Créer le compte
      const redirectUrl = `${window.location.origin}/admin/dashboard`;
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nom: data.nom,
            telephone: data.telephone,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          toast.error('Cet email est déjà enregistré. Veuillez vous connecter.', {
            action: {
              label: 'Se connecter',
              onClick: () => navigate('/connexion'),
            },
          });
        } else {
          toast.error(signUpError.message);
        }
        setLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error('Erreur lors de la création du compte');
        setLoading(false);
        return;
      }

      // Créer l'utilisateur dans la table users
      const { error: userError } = await supabase.from('users').insert({
        id: authData.user.id,
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
      });

      if (userError) {
        console.error('Erreur création utilisateur:', userError);
        toast.error('Erreur lors de la création du profil utilisateur');
        setLoading(false);
        return;
      }

      // Valider le code et attribuer le rôle admin via edge function sécurisée
      const { data: roleResult, error: roleError } = await supabase.functions.invoke(
        'secure-admin-register',
        {
          body: { 
            accessCode: data.accessCode,
            userId: authData.user.id 
          },
        }
      );

      if (roleError || !roleResult?.success) {
        console.error('Erreur attribution rôle admin:', roleError);
        toast.error(roleResult?.message || 'Code d\'accès incorrect ou erreur lors de l\'attribution du rôle admin');
        setLoading(false);
        return;
      }

      toast.success('Compte administrateur créé avec succès !');
      
      // Rediriger immédiatement vers le dashboard admin
      navigate('/admin/dashboard', { replace: true });

    } catch (error: any) {
      console.error('Erreur inscription admin:', error);
      toast.error(error.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Inscription Administrateur</CardTitle>
          <CardDescription className="text-center">
            Créez votre compte administrateur avec le code d'accès
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessCode">Code d'accès administrateur *</Label>
              <Input
                id="accessCode"
                type="password"
                placeholder="Entrez le code d'accès"
                {...register('accessCode')}
                disabled={loading}
              />
              {errors.accessCode && (
                <p className="text-sm text-destructive">{errors.accessCode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nom">Nom complet *</Label>
              <Input
                id="nom"
                type="text"
                placeholder="Votre nom"
                {...register('nom')}
                disabled={loading}
              />
              {errors.nom && (
                <p className="text-sm text-destructive">{errors.nom.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                {...register('email')}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={loading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                8 caractères min., avec majuscule et chiffre
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone *</Label>
              <Input
                id="telephone"
                type="tel"
                placeholder="+33 6 12 34 56 78"
                {...register('telephone')}
                disabled={loading}
              />
              {errors.telephone && (
                <p className="text-sm text-destructive">{errors.telephone.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Création du compte...' : 'Créer le compte administrateur'}
            </Button>

            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>Vous avez déjà un compte administrateur ?</p>
              <Link to="/secure-admin-login-2024" className="text-primary hover:underline">
                Se connecter
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}