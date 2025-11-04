import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Search, Menu, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/notifications/NotificationBell';
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

export const Navbar = () => {
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

  const getDashboardLink = () => {
    if (userRole === 'admin') return '/admin';
    if (userRole === 'acheteur') return '/dashboard-acheteur';
    if (userRole === 'vendeur') return '/ma-boutique';
    if (userRole === 'livreur') return '/dashboard-livreur';
    return '/profil';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-primary" />
          <span className="text-xl font-bold">BokaTrade</span>
        </Link>

        {/* Search Bar - Desktop */}
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

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center space-x-4">
          <Link to="/">
            <Button variant="ghost">Accueil</Button>
          </Link>
          <Link to="/produits">
            <Button variant="ghost">Produits</Button>
          </Link>
          <Link to="/produits">
            <Button variant="ghost">Catégories</Button>
          </Link>
          
          {user ? (
            <>
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

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-background">
            <nav className="flex flex-col space-y-4 mt-8">
              <Link to="/">
                <Button variant="ghost" className="w-full justify-start">
                  Accueil
                </Button>
              </Link>
              <Link to="/produits">
                <Button variant="ghost" className="w-full justify-start">
                  Produits
                </Button>
              </Link>
              <Link to="/produits">
                <Button variant="ghost" className="w-full justify-start">
                  Catégories
                </Button>
              </Link>
              {user ? (
                <>
                  {userProfile && (
                    <div className="px-3 py-2 text-sm font-medium">
                      Bonjour, {userProfile.nom}
                    </div>
                  )}
                  <Link to="/panier">
                    <Button variant="ghost" className="w-full justify-start">
                      🛒 Panier
                    </Button>
                  </Link>
                  <Link to="/profil">
                    <Button variant="ghost" className="w-full justify-start">
                      Mon Profil
                    </Button>
                  </Link>
                  {userRole === 'acheteur' && (
                    <Link to="/mes-commandes">
                      <Button variant="ghost" className="w-full justify-start">
                        Mes Commandes
                      </Button>
                    </Link>
                  )}
                  {userRole === 'vendeur' && (
                    <>
                      <Link to="/dashboard-vendeur">
                        <Button variant="ghost" className="w-full justify-start">
                          📊 Dashboard Vendeur
                        </Button>
                      </Link>
                      <Link to="/ma-boutique">
                        <Button variant="ghost" className="w-full justify-start">
                          🏪 Ma Boutique
                        </Button>
                      </Link>
                    </>
                  )}
                  {userRole === 'livreur' && (
                    <Link to="/mes-livraisons">
                      <Button variant="ghost" className="w-full justify-start">
                        Mes Livraisons
                      </Button>
                    </Link>
                  )}
                  <Link to="/messages">
                    <Button variant="ghost" className="w-full justify-start">
                      💬 Messages
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={signOut}
                  >
                    Déconnexion
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/connexion">
                    <Button variant="ghost" className="w-full justify-start">
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/inscription">
                    <Button className="w-full">Inscription</Button>
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};