import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth"; // pour garantir que l’utilisateur est bien chargé

// Définition du type pour les rôles utilisateurs
export type UserRoleData = {
  id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
};

/**
 * 🔹 useUserRole — récupère le rôle actif unique de l'utilisateur
 */
export const useUserRole = () => {
  const { user, loading } = useAuth();

  return useQuery<string | null>({
    queryKey: ["userRole", user?.id],
    enabled: !!user && !loading, // ⚠️ attend que useAuth ait fini
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data?.role || null;
    },
  });
};

/**
 * 🔹 useUserRoles — récupère tous les rôles de l'utilisateur
 */
export const useUserRoles = () => {
  const { user, loading } = useAuth();

  return useQuery<UserRoleData[]>({
    queryKey: ["userRoles", user?.id],
    enabled: !!user && !loading, // ⚠️ évite la requête inutile avant login
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("id, user_id, role, is_active, created_at")
        .eq("user_id", user!.id);

      if (error) throw error;
      return data || [];
    },
  });
};

/**
 * 🔹 useHasRole — vérifie si l'utilisateur a un rôle actif spécifique
 */
export const useHasRole = (role: string) => {
  const { data: userRoles, isLoading } = useUserRoles();

  // Rôle actif ou admin
  const hasRole = userRoles?.some((r) => (r.role === role && r.is_active === true) || r.role === "admin") ?? false;

  return { hasRole, isLoading };
};
