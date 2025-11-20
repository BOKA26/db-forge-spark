import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, MessageSquare, ShoppingCart, User, Store, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';

export const BottomNav = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { data: userRole } = useUserRole();

  // Fetch user profile data
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile-navbar', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('users')
        .select('nom')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch unread messages count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-messages', user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user?.id)
        .eq('is_read', false);
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Fetch cart items count
  const { data: cartCount = 0 } = useQuery({
    queryKey: ['cart-count', user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('acheteur_id', user?.id)
        .eq('statut', 'en_attente_paiement');
      return count || 0;
    },
    enabled: !!user?.id,
  });

  const navItems = [
    {
      path: '/',
      label: 'Accueil',
      icon: Home,
      activeColor: 'text-primary',
    },
    {
      path: '/boutiques',
      label: 'Shops',
      icon: ShoppingBag,
      activeColor: 'text-primary',
    },
    {
      path: '/messages',
      label: 'Messages',
      icon: MessageSquare,
      activeColor: 'text-primary',
      badge: user ? unreadCount : 0,
    },
    {
      path: '/panier',
      label: 'Panier',
      icon: ShoppingCart,
      activeColor: 'text-primary',
      requireAuth: true,
      badge: user ? cartCount : 0,
    },
  ];

  if (!user) {
    return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t shadow-lg z-50 safe-area-bottom">
      <div className="flex items-center justify-evenly h-16 px-1">
          {navItems.filter(item => !item.requireAuth).map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-2 touch-manipulation min-w-0"
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? item.activeColor : 'text-muted-foreground'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-medium leading-tight text-center ${
                  isActive ? item.activeColor : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </Link>
            );
          })}
          <Link to="/connexion" className="flex flex-col items-center justify-center gap-1 flex-1 py-2 touch-manipulation min-w-0">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground leading-tight text-center">Profile</span>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t shadow-lg z-50 safe-area-bottom">
      <div className="flex items-center justify-evenly h-16 px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const showBadge = item.badge !== undefined && item.badge > 0;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-2 touch-manipulation min-w-0"
            >
              <div className="relative flex items-center justify-center w-6 h-6">
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? item.activeColor : 'text-muted-foreground'
                  }`}
                />
                {showBadge && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 flex items-center justify-center text-[9px] font-bold rounded-full"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span
                className={`text-[10px] font-medium leading-tight text-center ${
                  isActive ? item.activeColor : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Profile/Trade Dropdown */}
        <div className="flex-1 flex items-center justify-center min-w-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex flex-col items-center justify-center gap-1 py-2 h-auto hover:bg-transparent touch-manipulation min-w-0 px-0"
              >
                <div className="relative flex items-center justify-center">
                  <User className={`h-5 w-5 ${location.pathname === '/profil' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <span className={`text-[10px] font-medium leading-tight text-center ${location.pathname === '/profil' ? 'text-primary' : 'text-muted-foreground'}`}>
                  Profile
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background mb-2 z-50">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {userProfile?.nom || 'Utilisateur'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profil" className="cursor-pointer h-10">Mon Profil</Link>
              </DropdownMenuItem>
              {userRole === 'acheteur' && (
                <DropdownMenuItem asChild>
                  <Link to="/mes-commandes" className="cursor-pointer h-10">Mes Commandes</Link>
                </DropdownMenuItem>
              )}
              {userRole === 'vendeur' && (
                <DropdownMenuItem asChild>
                  <Link to="/ma-boutique" className="cursor-pointer h-10">Ma Boutique</Link>
                </DropdownMenuItem>
              )}
              {userRole === 'livreur' && (
                <DropdownMenuItem asChild>
                  <Link to="/mes-livraisons" className="cursor-pointer h-10">Mes Livraisons</Link>
                </DropdownMenuItem>
              )}
              {userRole === 'admin' && (
                <DropdownMenuItem asChild>
                  <Link to="/admin/dashboard" className="cursor-pointer h-10">Dashboard Admin</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="cursor-pointer h-10">
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};
