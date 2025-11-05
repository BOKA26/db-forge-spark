import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

const roleRedirects = {
  acheteur: '/dashboard-acheteur',
  vendeur: '/dashboard-vendeur',
  livreur: '/dashboard-livreur',
  admin: '/admin/dashboard',
};

/**
 * Composant qui redirige automatiquement vers le dashboard approprié
 * en fonction du rôle actif de l'utilisateur
 */
export const RoleBasedDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: currentRole, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || roleLoading) return;

    if (!user) {
      navigate('/connexion');
      return;
    }

    if (currentRole) {
      const targetPath = roleRedirects[currentRole as keyof typeof roleRedirects];
      if (targetPath) {
        navigate(targetPath, { replace: true });
      }
    }
  }, [user, currentRole, authLoading, roleLoading, navigate]);

  // Afficher un loader pendant la redirection
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
    </div>
  );
};
