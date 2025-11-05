import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type UserRoleData = {
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
  return useQuery<string | null>({
    queryKey: ["userRole"],
    queryFn: async () => {
      const authResponse = await supabase.auth.getUser();
      const userId = authResponse.data.user?.id;
      if (!userId) return null;

      const dbResponse: any = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .maybeSingle();

      if (dbResponse.error) throw dbResponse.error;
      return dbResponse.data?.role || null;
    },
  });
};

/**
 * 🔹 useUserRoles — récupère tous les rôles de l'utilisateur
 */
export const useUserRoles = () => {
  return useQuery<UserRoleData[]>({
    queryKey: ["userRoles"],
    queryFn: async () => {
      const authResponse = await supabase.auth.getUser();
      const userId = authResponse.data.user?.id;
      if (!userId) return [];

      const dbResponse: any = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId);

      if (dbResponse.error) throw dbResponse.error;
      return dbResponse.data || [];
    },
  });
};

/**
 * 🔹 useHasRole — vérifie si l'utilisateur a le rôle requis (actif)
 */
export const useHasRole = (role: string) => {
  const { data: userRoles, isLoading } = useUserRoles();

  const hasRole = userRoles?.some((r) => (r.role === role && r.is_active === true) || r.role === "admin") ?? false;

  return { hasRole, isLoading };
};
