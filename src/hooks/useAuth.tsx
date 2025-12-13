import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nom: string, telephone?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle sign out - redirect to home
        if (event === 'SIGNED_OUT') {
          navigate('/');
          return;
        }

        // Redirect after sign in will be handled by RoleBasedDashboard
        if (event === 'SIGNED_IN' && session?.user) {
          // Give time for user_roles to be created by trigger, then ensure acheteur is active
          setTimeout(async () => {
            // Check if user has an active role
            const { data: activeRole } = await supabase
              .from('user_roles')
              .select('id, role')
              .eq('user_id', session.user.id)
              .eq('is_active', true)
              .maybeSingle();

            // If no active role, activate acheteur role
            if (!activeRole) {
              // First check if acheteur role exists
              const { data: acheteurRole } = await supabase
                .from('user_roles')
                .select('id')
                .eq('user_id', session.user.id)
                .eq('role', 'acheteur')
                .maybeSingle();

              if (acheteurRole) {
                // Activate it
                await supabase
                  .from('user_roles')
                  .update({ is_active: true })
                  .eq('id', acheteurRole.id);
              } else {
                // Create and activate acheteur role
                await supabase
                  .from('user_roles')
                  .insert({ user_id: session.user.id, role: 'acheteur', is_active: true });
              }
            }

            const currentPath = window.location.pathname;
            // Only redirect if on login/register pages
            if (currentPath === '/connexion' || currentPath === '/inscription') {
              navigate('/dashboard'); // Will redirect to appropriate role dashboard
            }
          }, 300);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success('Connexion réussie');
      // Redirection vers /dashboard qui redirigera automatiquement vers le bon rôle
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la connexion');
      throw error;
    }
  };

  const signUp = async (email: string, password: string, nom: string, telephone?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nom,
            telephone,
          }
        }
      });

      if (error) throw error;

      toast.success('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.');
      // L'utilisateur sera redirigé vers /dashboard-acheteur après confirmation
    } catch (error: any) {
      if (error.message.includes('already registered')) {
        toast.error('Cet email est déjà utilisé');
      } else {
        toast.error(error.message || 'Erreur lors de l\'inscription');
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Déconnexion réussie');
      // La redirection est gérée automatiquement par onAuthStateChange
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la déconnexion');
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};