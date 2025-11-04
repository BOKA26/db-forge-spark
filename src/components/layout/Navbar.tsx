import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Search, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUserRole } from '@/hooks/useUserRole';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const { data: userRole } = useUserRole();

  console.log('🔍 Navbar - User Role:', userRole);
  console.log('🔍 Navbar - User:', user);

  const getDashboardLink = () => {
    if (userRole === 'admin') return '/admin';
    if (userRole === 'acheteur') return '/dashboard-acheteur';
    if (userRole === 'vendeur') return '/dashboard-vendeur';
    if (userRole === 'livreur') return '/dashboard-livreur';
    return '/';
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
          
          {user ? (
            <>
              <Link to="/panier">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </Link>

              <NotificationBell />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={getDashboardLink()}>Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/messages">Messages</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
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
          <SheetContent>
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
              {user ? (
                <>
                  <Link to="/panier">
                    <Button variant="ghost" className="w-full justify-start">
                      Panier
                    </Button>
                  </Link>
                  <Link to={getDashboardLink()}>
                    <Button variant="ghost" className="w-full justify-start">
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/messages">
                    <Button variant="ghost" className="w-full justify-start">
                      Messages
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