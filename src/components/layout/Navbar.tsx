import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Search, Menu, MessageSquare, Home, Store, Package } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { RoleSwitcher } from '@/components/layout/RoleSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUserRole } from '@/hooks/useUserRole';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
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
        <div className="container flex h-14 md:h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-7 w-7 md:h-8 md:w-8 rounded bg-primary" />
            <span className="text-lg md:text-xl font-bold hidden sm:inline">BokaTrade</span>
          </Link>

          {/* Search Bar - Desktop & Tablet */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher des produits..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Mobile Icons Right */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/produits">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Search className="h-5 w-5" />
              </Button>
            </Link>
            {user && (
              <Link to="/messages">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost">Accueil</Button>
            </Link>
            <Link to="/produits">
              <Button variant="ghost">Produits</Button>
            </Link>
            <Link to="/boutiques">
              <Button variant="ghost">Boutiques</Button>
            </Link>
            <Link to="/pour-vendeurs">
              <Button variant="ghost">Pour Vendeurs</Button>
            </Link>
            
            {user ? (
              <>
                <RoleSwitcher />
                
                <Link to="/panier">
                  <Button variant="ghost" size="icon" title="Panier">
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </Link>

                <NotificationBell />

                <Link to="/messages">
                  <Button variant="ghost" size="icon" title="Messages">
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-background">
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
                  <Button variant="ghost">Connexion</Button>
                </Link>
                <Link to="/inscription">
                  <Button>Inscription</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
        <div className="flex items-center justify-around h-14 px-2">
          <Link to="/" className="flex-1">
            <Button 
              variant="ghost" 
              className={cn(
                "w-full h-12 flex flex-col items-center justify-center gap-1 rounded-none",
                isActive('/') && "text-primary"
              )}
            >
              <Home className="h-5 w-5" />
              <span className="text-[10px]">Accueil</span>
            </Button>
          </Link>

          <Link to="/produits" className="flex-1">
            <Button 
              variant="ghost" 
              className={cn(
                "w-full h-12 flex flex-col items-center justify-center gap-1 rounded-none",
                isActive('/produits') && "text-primary"
              )}
            >
              <Package className="h-5 w-5" />
              <span className="text-[10px]">Produits</span>
            </Button>
          </Link>

          <Link to="/boutiques" className="flex-1">
            <Button 
              variant="ghost" 
              className={cn(
                "w-full h-12 flex flex-col items-center justify-center gap-1 rounded-none",
                isActive('/boutiques') && "text-primary"
              )}
            >
              <Store className="h-5 w-5" />
              <span className="text-[10px]">Boutiques</span>
            </Button>
          </Link>

          {user && (
            <>
              <Link to="/panier" className="flex-1">
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full h-12 flex flex-col items-center justify-center gap-1 rounded-none relative",
                    isActive('/panier') && "text-primary"
                  )}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="text-[10px]">Panier</span>
                </Button>
              </Link>

              <div className="flex-1">
                <NotificationBell 
                  iconClassName="h-5 w-5"
                  className="w-full h-12 flex flex-col items-center justify-center gap-1 rounded-none"
                  showLabel={true}
                />
              </div>

              <div className="flex-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full h-12 flex flex-col items-center justify-center gap-1 rounded-none",
                        isActive('/profil') && "text-primary"
                      )}
                    >
                      <User className="h-5 w-5" />
                      <span className="text-[10px]">Profil</span>
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
            </>
          )}

          {!user && (
            <Link to="/connexion" className="flex-1">
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full h-12 flex flex-col items-center justify-center gap-1 rounded-none",
                  isActive('/connexion') && "text-primary"
                )}
              >
                <User className="h-5 w-5" />
                <span className="text-[10px]">Connexion</span>
              </Button>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};