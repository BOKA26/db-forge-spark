import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole, useUserRoles } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ShoppingCart, Store, Truck, Plus } from 'lucide-react';

const roleConfig = {
  acheteur: {
    label: 'Acheteur',
    icon: ShoppingCart,
    path: '/dashboard-acheteur',
    color: 'bg-blue-500',
  },
  vendeur: {
    label: 'Vendeur',
    icon: Store,
    path: '/dashboard-vendeur',
    color: 'bg-green-500',
  },
  livreur: {
    label: 'Livreur',
    icon: Truck,
    path: '/dashboard-livreur',
    color: 'bg-orange-500',
  },
  admin: {
    label: 'Admin',
    icon: ShoppingCart,
    path: '/admin/dashboard',
    color: 'bg-purple-500',
  },
};

export const RoleSwitcher = () => {
  const { user } = useAuth();
  const { data: currentRole } = useUserRole();
  const { data: userRoles } = useUserRoles();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const switchRoleMutation = useMutation({
    mutationFn: async (newRole: 'acheteur' | 'vendeur' | 'livreur' | 'admin') => {
      if (!user) throw new Error('User not authenticated');

      // Désactiver tous les rôles
      await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Activer le nouveau rôle
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: true })
        .eq('user_id', user.id)
        .eq('role', newRole);

      if (error) throw error;
      return newRole;
    },
    onSuccess: (newRole) => {
      queryClient.invalidateQueries({ queryKey: ['userRole'] });
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
      
      const config = roleConfig[newRole as keyof typeof roleConfig];
      if (config) {
        toast.success(`Basculé vers le rôle ${config.label}`);
        navigate(config.path);
      }
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors du changement de rôle');
    },
  });

  const addRoleMutation = useMutation({
    mutationFn: async (newRole: 'acheteur' | 'vendeur' | 'livreur' | 'admin') => {
      if (!user) throw new Error('User not authenticated');

      // Désactiver tous les rôles actuels
      await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Ajouter et activer le nouveau rôle
      const { error } = await supabase
        .from('user_roles')
        .insert([{
          user_id: user.id,
          role: newRole,
          is_active: true,
        }]);

      if (error) throw error;
      return newRole;
    },
    onSuccess: (newRole) => {
      queryClient.invalidateQueries({ queryKey: ['userRole'] });
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
      
      const config = roleConfig[newRole as keyof typeof roleConfig];
      if (config) {
        toast.success(`Rôle ${config.label} activé !`);
        
        // Redirection spéciale pour vendeur (vers création de boutique)
        if (newRole === 'vendeur') {
          navigate('/creer-boutique');
        } else {
          navigate(config.path);
        }
      }
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'ajout du rôle');
    },
  });

  if (!currentRole || !userRoles) return null;

  const CurrentRoleIcon = roleConfig[currentRole as keyof typeof roleConfig]?.icon || ShoppingCart;
  const activeRoles = userRoles.filter(r => r.is_active);
  const inactiveRoles = userRoles.filter(r => !r.is_active);

  // Rôles disponibles à ajouter
  const availableRoles = ['acheteur', 'vendeur', 'livreur'].filter(
    role => !userRoles.some(ur => ur.role === role)
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CurrentRoleIcon className="h-4 w-4" />
          {roleConfig[currentRole as keyof typeof roleConfig]?.label || currentRole}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Rôle actif</DropdownMenuLabel>
        {activeRoles.map((role) => {
          const config = roleConfig[role.role as keyof typeof roleConfig];
          const Icon = config?.icon || ShoppingCart;
          return (
            <DropdownMenuItem key={role.id} className="gap-2">
              <Icon className="h-4 w-4" />
              {config?.label || role.role}
              <Badge variant="default" className="ml-auto">Actif</Badge>
            </DropdownMenuItem>
          );
        })}

        {inactiveRoles.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Mes autres rôles</DropdownMenuLabel>
            {inactiveRoles.map((role) => {
              const config = roleConfig[role.role as keyof typeof roleConfig];
              const Icon = config?.icon || ShoppingCart;
              return (
                <DropdownMenuItem
                  key={role.id}
                  className="gap-2 cursor-pointer"
                  onClick={() => switchRoleMutation.mutate(role.role as 'acheteur' | 'vendeur' | 'livreur' | 'admin')}
                  disabled={switchRoleMutation.isPending}
                >
                  <Icon className="h-4 w-4" />
                  {config?.label || role.role}
                  <span className="ml-auto text-xs text-muted-foreground">Basculer</span>
                </DropdownMenuItem>
              );
            })}
          </>
        )}

        {availableRoles.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Ajouter un rôle</DropdownMenuLabel>
            {availableRoles.map((role) => {
              const config = roleConfig[role as keyof typeof roleConfig];
              const Icon = config?.icon || ShoppingCart;
              return (
                <DropdownMenuItem
                  key={role}
                  className="gap-2 cursor-pointer"
                  onClick={() => addRoleMutation.mutate(role as 'acheteur' | 'vendeur' | 'livreur' | 'admin')}
                  disabled={addRoleMutation.isPending}
                >
                  <Plus className="h-4 w-4" />
                  {config?.label || role}
                  <span className="ml-auto text-xs text-muted-foreground">Ajouter</span>
                </DropdownMenuItem>
              );
            })}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
