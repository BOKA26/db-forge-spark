import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, MessageSquare, ShoppingCart, User } from 'lucide-react';
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

  // Fetch unread messages count (placeholder - will be replaced with real data later)
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-messages', user?.id],
    queryFn: async () => {
      // TODO: Replace with real message count from database
      return 57;
    },
    enabled: !!user?.id,
  });

  const navItems = [
    {
      path: '/',
      label: 'Accueil',
      icon: Home,
      activeColor: 'text-orange-500',
    },
    {
      path: '/categories',
      label: 'Catégories',
      icon: LayoutGrid,
      activeColor: 'text-foreground',
    },
    {
      path: '/messages',
      label: 'Messagerie',
      icon: MessageSquare,
      activeColor: 'text-foreground',
      badge: user ? unreadCount : 0,
    },
    {
      path: '/panier',
      label: 'Panier',
      icon: ShoppingCart,
      activeColor: 'text-foreground',
      requireAuth: true,
    },
  ];

  if (!user) {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50">
        <div className="flex items-center justify-around h-14">
          {navItems.filter(item => !item.requireAuth).map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center gap-1 flex-1"
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? item.activeColor : 'text-muted-foreground'
                  }`}
                />
                <span
                  className={`text-[10px] ${
                    isActive ? item.activeColor : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
          <Link to="/connexion" className="flex flex-col items-center justify-center gap-1 flex-1">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Connexion</span>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-1 relative flex-1"
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? item.activeColor : 'text-muted-foreground'
                  }`}
                />
                {item.badge && item.badge > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 min-w-5 px-1 flex items-center justify-center text-xs"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span
                className={`text-[10px] ${
                  isActive ? item.activeColor : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
        
        {/* Profile Dropdown */}
        <div className="flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full h-full flex flex-col items-center justify-center gap-1 rounded-none hover:bg-transparent"
              >
                <User className={`h-5 w-5 ${location.pathname === '/profil' ? 'text-foreground' : 'text-muted-foreground'}`} />
                <span className={`text-[10px] ${location.pathname === '/profil' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Mon Trade
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background mb-2">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {userProfile?.nom || 'Utilisateur'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profil" className="cursor-pointer">Mon Profil</Link>
              </DropdownMenuItem>
              {userRole === 'acheteur' && (
                <DropdownMenuItem asChild>
                  <Link to="/mes-commandes" className="cursor-pointer">Mes Commandes</Link>
                </DropdownMenuItem>
              )}
              {userRole === 'vendeur' && (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard-vendeur" className="cursor-pointer">Dashboard Vendeur</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/ma-boutique" className="cursor-pointer">Ma Boutique</Link>
                  </DropdownMenuItem>
                </>
              )}
              {userRole === 'livreur' && (
                <DropdownMenuItem asChild>
                  <Link to="/mes-livraisons" className="cursor-pointer">Mes Livraisons</Link>
                </DropdownMenuItem>
              )}
              {userRole === 'admin' && (
                <DropdownMenuItem asChild>
                  <Link to="/admin/dashboard" className="cursor-pointer">Dashboard Admin</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};
