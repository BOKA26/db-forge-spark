import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const roleRedirects = {
  acheteur: '/dashboard-acheteur',
  vendeur: '/dashboard-vendeur',
  livreur: '/dashboard-livreur',
  admin: '/admin/dashboard',
};

/**
 * Composant qui redirige automatiquement vers le dashboard approprié
 * en fonction du rôle actif de l'utilisateur - optimisé pour réduire le temps de chargement
 */
export const RoleBasedDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (hasRedirected) return;

    if (!user) {
      navigate('/connexion', { replace: true });
      return;
    }

    // Requête directe pour obtenir le rôle actif rapidement
    const fetchRoleAndRedirect = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          console.error('Erreur lors de la récupération du rôle:', error);
          // Rediriger vers acheteur par défaut en cas d'erreur
          navigate('/dashboard-acheteur', { replace: true });
          return;
        }

        const role = data?.role;
        if (role && roleRedirects[role as keyof typeof roleRedirects]) {
          setHasRedirected(true);
          navigate(roleRedirects[role as keyof typeof roleRedirects], { replace: true });
        } else {
          // Si aucun rôle actif trouvé, rediriger vers dashboard acheteur
          setHasRedirected(true);
          navigate('/dashboard-acheteur', { replace: true });
        }
      } catch (err) {
        console.error('Erreur:', err);
        navigate('/dashboard-acheteur', { replace: true });
      }
    };

    fetchRoleAndRedirect();
  }, [user, authLoading, navigate, hasRedirected]);

  // Loader minimal pendant la redirection
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
};
