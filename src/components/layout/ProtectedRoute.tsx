import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useHasRole } from '@/hooks/useUserRole';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: string;
}

/**
 * ProtectedRoute - Client-side route protection for UX purposes
 * 
 * SECURITY NOTE: This component provides UI-level access control only.
 * The real security enforcement happens at the database level through
 * Row Level Security (RLS) policies. Even if a user bypasses this client-side
 * check, all database operations are protected by RLS policies that verify
 * user roles server-side using the has_role() security definer function.
 * 
 * This component improves UX by preventing unauthorized navigation attempts
 * before they reach the backend.
 */
export const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { hasRole, isLoading: rolesLoading } = useHasRole(requireRole || '');

  // Wait for auth AND roles to be ready before deciding
  if (loading || (requireRole && rolesLoading)) {
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