import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUserRole = () => {
  return useQuery({
    queryKey: ['userRole'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return null;

      const { data, error }: any = await supabase
        .from('user_roles')
        .select('role, is_active')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const activeRole = data?.find((r: any) => r.is_active === true);
      return activeRole?.role || null;
    },
  });
};

export const useUserRoles = () => {
  return useQuery({
    queryKey: ['userRoles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return [];

      const { data, error }: any = await supabase
        .from('user_roles')
        .select('role, is_active')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const activeRoles = data?.filter((r: any) => r.is_active === true);
      return activeRoles?.map((r: any) => r.role) || [];
    },
  });
};

export const useHasRole = (role: string) => {
  const { data: roles, isLoading } = useUserRoles();
  const hasRole = roles?.some((r) => r === role || r === 'admin') ?? false;
  return { hasRole, isLoading };
};
