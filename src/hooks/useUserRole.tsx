import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * 🔹 useUserRole — récupère le rôle actif unique de l'utilisateur
 * (ex : 'vendeur', 'acheteur', 'livreur')
 */
export const useUserRole = () => {
  return useQuery({
    queryKey: ["userRole"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id) return null;

      // 🔍 On sélectionne uniquement les rôles actifs
      const { data, error } = await supabase
        .from("user_roles")
        .select("role, is_active")
        .eq("user_id", user.id)
        .eq("is_active", true) // ✅ seulement le rôle actif
        .single();

      if (error && error.code !== "PGRST116") throw error; // ignore "no rows found"
      return data?.role || null;
    },
  });
};

/**
 * 🔹 useUserRoles — récupère tous les rôles de l'utilisateur
 */
export const useUserRoles = () => {
  return useQuery({
    queryKey: ["userRoles"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id) return [];

      const { data, error } = await supabase.from("user_roles").select("role, is_active").eq("user_id", user.id);

      if (error) throw error;

      return data || [];
    },
  });
};

/**
 * 🔹 useHasRole — vérifie si l'utilisateur a le rôle requis (actif)
 */
export const useHasRole = (role: string) => {
  const { data: userRoles, isLoading } = useUserRoles();

  // Vérifie si le rôle demandé est actif ou si l'utilisateur est admin
  const hasRole = userRoles?.some((r: any) => (r.role === role && r.is_active === true) || r.role === "admin") ?? false;

  return { hasRole, isLoading };
};
