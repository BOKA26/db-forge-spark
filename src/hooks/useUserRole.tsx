import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["app_role"];

type UserRoleData = {
  id: string;
  user_id: string;
  role: UserRole;
  is_active: boolean;
  created_at: string | null;
};

/**
 * 🔹 useUserRole — récupère le rôle actif unique de l'utilisateur
 */
export const useUserRole = () => {
  return useQuery<UserRole | null>({
    queryKey: ["userRole"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return null;

      const { data, error }: { data: UserRoleData | null, error: any } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle() as any;

      if (error) throw error;
      return data?.role || null;
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return [];

      const { data, error }: { data: UserRoleData[] | null, error: any } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id) as any;

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

  const hasRole = userRoles?.some((r) => (r.role === role && r.is_active === true) || r.role === "admin") ?? false;

  return { hasRole, isLoading };
};
