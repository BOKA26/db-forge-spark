import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { RoleSwitcher } from '@/components/layout/RoleSwitcher';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { SearchBar } from '@/components/layout/SearchBar';
import { MegaMenu } from '@/components/layout/MegaMenu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUserRole } from '@/hooks/useUserRole';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const { data: userRole } = useUserRole();
  const location = useLocation();

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

  const getDashboardLink = () => {
    if (userRole === 'admin') return '/admin/dashboard';
    if (userRole === 'acheteur') return '/dashboard-acheteur';
    if (userRole === 'vendeur') return '/ma-boutique';
    if (userRole === 'livreur') return '/dashboard-livreur';
    return '/profil';
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 md:h-18 items-center justify-between px-3 md:px-4">
          {/* Logo - Tactile optimized */}
          <Link to="/" className="flex items-center space-x-2 min-h-[44px] min-w-[44px] -ml-2 pl-2">
            <div className="h-8 w-8 md:h-9 md:w-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex-shrink-0 flex items-center justify-center">
              <span className="text-white font-bold text-sm">BT</span>
            </div>
            <span className="text-lg md:text-xl font-bold hidden sm:inline bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">BokaTrade</span>
          </Link>

          {/* Search Bar - Desktop Only */}
          <SearchBar className="hidden md:flex flex-1 max-w-2xl mx-6" />

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/">
              <Button 
                variant="ghost" 
                size="default" 
                className={cn("h-10", isActive('/') && "bg-accent")}
              >
                Accueil
              </Button>
            </Link>
            <Link to="/produits">
              <Button 
                variant="ghost" 
                size="default" 
                className={cn("h-10", isActive('/produits') && "bg-accent")}
              >
                Produits
              </Button>
            </Link>
            <Link to="/boutiques">
              <Button 
                variant="ghost" 
                size="default" 
                className={cn("h-10", isActive('/boutiques') && "bg-accent")}
              >
                Boutiques
              </Button>
            </Link>
            
            <MegaMenu />
            
            {user ? (
              <>
                <RoleSwitcher />
                
                <Link to="/panier">
                  <Button variant="ghost" size="icon" title="Panier" className="h-10 w-10">
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </Link>

                <NotificationBell />

                <Link to="/messages">
                  <Button variant="ghost" size="icon" title="Messages" className="h-10 w-10">
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-background z-50">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Bonjour, {userProfile?.nom || 'Utilisateur'}
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
                    <DropdownMenuItem asChild>
                      <Link to="/messages" className="cursor-pointer">Messages</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/connexion">
                  <Button variant="ghost" className="h-10">Connexion</Button>
                </Link>
                <Link to="/inscription">
                  <Button className="h-10">Inscription</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <MobileMenu userProfile={userProfile} />
        </div>
      </header>

    </>
  );
};