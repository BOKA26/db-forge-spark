import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Package, Store, Users, ShoppingCart, MessageSquare, User, LogOut, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { CategoriesDropdown } from '@/components/layout/CategoriesDropdown';

export const MobileMenu = ({ userProfile }: { userProfile?: { nom: string } | null }) => {
  const { user, signOut } = useAuth();
  const { data: userRole } = useUserRole();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLinkClick = () => {
    setOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/produits?q=${encodeURIComponent(searchTerm)}`;
      setOpen(false);
    }
  };

  const mainLinks = [
    { to: '/', icon: Home, label: 'Accueil' },
    { to: '/produits', icon: Package, label: 'Produits' },
    { to: '/boutiques', icon: Store, label: 'Boutiques' },
    { to: '/pour-vendeurs', icon: Users, label: 'Pour Vendeurs' },
  ];

  const userLinks = user ? [
    { to: '/panier', icon: ShoppingCart, label: 'Panier' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/profil', icon: User, label: 'Mon Profil' },
  ] : [];

  const roleLinks = {
    acheteur: [{ to: '/mes-commandes', label: 'Mes Commandes' }],
    vendeur: [
      { to: '/dashboard-vendeur', label: 'Dashboard Vendeur' },
      { to: '/ma-boutique', label: 'Ma Boutique' },
    ],
    livreur: [{ to: '/mes-livraisons', label: 'Mes Livraisons' }],
    admin: [{ to: '/admin/dashboard', label: 'Dashboard Admin' }],
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden h-11 w-11"
          aria-label="Menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[350px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">
            {user ? `Bonjour, ${userProfile?.nom || 'Utilisateur'}` : 'Menu'}
          </SheetTitle>
        </SheetHeader>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="mt-6 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </form>

        {/* Categories Button */}
        <div className="mb-4">
          <CategoriesDropdown />
        </div>

        <Separator className="mb-4" />

        <div className="flex flex-col gap-2">
          {/* Main Navigation */}
          <div className="space-y-1">
            {mainLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={handleLinkClick}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 text-base"
                >
                  <link.icon className="mr-3 h-5 w-5" />
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {user && (
            <>
              <Separator className="my-3" />
              
              {/* User Links */}
              <div className="space-y-1">
                {userLinks.map((link) => (
                  <Link key={link.to} to={link.to} onClick={handleLinkClick}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-12 text-base"
                    >
                      <link.icon className="mr-3 h-5 w-5" />
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </div>

              {/* Role-specific Links */}
              {userRole && roleLinks[userRole as keyof typeof roleLinks] && (
                <>
                  <Separator className="my-3" />
                  <div className="space-y-1">
                    <p className="px-3 py-2 text-sm font-medium text-muted-foreground">
                      {userRole === 'vendeur' ? 'Espace Vendeur' : 
                       userRole === 'livreur' ? 'Espace Livreur' :
                       userRole === 'admin' ? 'Administration' : 
                       'Mon Espace'}
                    </p>
                    {roleLinks[userRole as keyof typeof roleLinks].map((link) => (
                      <Link key={link.to} to={link.to} onClick={handleLinkClick}>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start h-12 text-base"
                        >
                          {link.label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              <Separator className="my-3" />
              
              {/* Logout */}
              <Button 
                variant="ghost" 
                className="w-full justify-start h-12 text-base text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  signOut();
                  handleLinkClick();
                }}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Déconnexion
              </Button>
            </>
          )}

          {!user && (
            <>
              <Separator className="my-3" />
              <div className="space-y-2">
                <Link to="/connexion" onClick={handleLinkClick}>
                  <Button variant="outline" className="w-full h-12 text-base">
                    Connexion
                  </Button>
                </Link>
                <Link to="/inscription" onClick={handleLinkClick}>
                  <Button className="w-full h-12 text-base">
                    Inscription
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
