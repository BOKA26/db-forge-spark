import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';

const roleRedirects = {
  acheteur: '/dashboard-acheteur',
  vendeur: '/dashboard-vendeur',
  livreur: '/dashboard-livreur',
  admin: '/admin/dashboard',
};

/**
 * Hook pour rediriger automatiquement l'utilisateur vers son dashboard
 * en fonction de son rôle actif
 */
export const useRoleBasedRedirect = (shouldRedirect: boolean = true) => {
  const { user, loading: authLoading } = useAuth();
  const { data: currentRole, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!shouldRedirect || authLoading || roleLoading || !user) return;

    // Ne pas rediriger si on est déjà sur une page autorisée
    const publicPaths = ['/', '/connexion', '/inscription', '/produits', '/boutiques', '/a-propos', '/contact'];
    const isPublicPath = publicPaths.some(path => location.pathname === path);
    
    // Si on est sur une page publique, ne pas rediriger
    if (isPublicPath) return;

    // Si on a un rôle, rediriger vers le dashboard approprié
    if (currentRole && roleRedirects[currentRole as keyof typeof roleRedirects]) {
      const targetPath = roleRedirects[currentRole as keyof typeof roleRedirects];
      
      // Ne rediriger que si on n'est pas déjà sur un dashboard ou une page protégée
      const isDashboardPath = location.pathname.includes('/dashboard-') || location.pathname.includes('/admin/');
      const isProtectedPath = location.pathname.includes('/ma-boutique') || 
                              location.pathname.includes('/mes-') || 
                              location.pathname.includes('/profil') ||
                              location.pathname.includes('/creer-boutique') ||
                              location.pathname.includes('/ajouter-produit') ||
                              location.pathname.includes('/commandes') ||
                              location.pathname.includes('/notifications');
      
      // Si on est déjà sur une page protégée appropriée, ne pas rediriger
      if (isDashboardPath || isProtectedPath) return;

      // Sinon, rediriger vers le dashboard du rôle actif
      navigate(targetPath, { replace: true });
    }
  }, [user, currentRole, authLoading, roleLoading, navigate, location.pathname, shouldRedirect]);

  return { currentRole, isLoading: authLoading || roleLoading };
};
