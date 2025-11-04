import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useHasRole } from '@/hooks/useUserRole';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: string;
}

export const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const hasRole = useHasRole(requireRole || '');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  if (requireRole && !hasRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};