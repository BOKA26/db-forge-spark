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
  signUp: (email: string, password: string, nom: string, role: string) => Promise<void>;
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

        // Redirect to appropriate dashboard after email confirmation or sign in
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle();

          const role = roleData?.role;
          
          // Only redirect if not already on a dashboard page
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/dashboard-') && !currentPath.includes('/ma-boutique')) {
            if (role === 'acheteur') {
              navigate('/dashboard-acheteur');
            } else if (role === 'vendeur') {
              navigate('/ma-boutique');
            } else if (role === 'livreur') {
              navigate('/dashboard-livreur');
            }
          }
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
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      // Get user role and redirect to appropriate dashboard
      if (data.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle();

        const role = roleData?.role;
        
        toast.success('Connexion réussie');
        
        // Redirect based on role
        if (role === 'acheteur') {
          navigate('/dashboard-acheteur');
        } else if (role === 'vendeur') {
          navigate('/ma-boutique');
        } else if (role === 'livreur') {
          navigate('/dashboard-livreur');
        } else {
          navigate('/');
        }
      } else {
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la connexion');
      throw error;
    }
  };

  const signUp = async (email: string, password: string, nom: string, role: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nom,
          }
        }
      });

      if (error) throw error;

      // Add user role
      if (data.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([{ user_id: data.user.id, role: role as any }]);

        if (roleError) throw roleError;
      }

      toast.success('Inscription réussie ! Vérifiez votre email.');
      navigate('/connexion');
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
      console.log('🔓 Tentative de déconnexion...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Erreur Supabase signOut:', error);
        throw error;
      }
      console.log('✅ Déconnexion Supabase réussie');
      toast.success('Déconnexion réussie');
      navigate('/');
    } catch (error: any) {
      console.error('❌ Erreur lors de la déconnexion:', error);
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