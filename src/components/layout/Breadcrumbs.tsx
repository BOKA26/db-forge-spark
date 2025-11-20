import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Mapping for route labels
const routeLabels: Record<string, string> = {
  '': 'Accueil',
  'produits': 'Produits',
  'produit': 'Détail Produit',
  'boutiques': 'Boutiques',
  'boutique': 'Boutique',
  'panier': 'Panier',
  'profil': 'Mon Profil',
  'mes-commandes': 'Mes Commandes',
  'ma-boutique': 'Ma Boutique',
  'pour-vendeurs': 'Pour Vendeurs',
  'categories': 'Catégories',
  'messages': 'Messages',
  'notifications': 'Notifications',
  'dashboard-acheteur': 'Dashboard Acheteur',
  'dashboard-vendeur': 'Dashboard Vendeur',
  'dashboard-livreur': 'Dashboard Livreur',
  'mes-livraisons': 'Mes Livraisons',
  'admin': 'Administration',
  'dashboard': 'Dashboard',
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumbs on home page
  if (pathnames.length === 0) return null;

  return (
    <div className="container px-4 md:px-6 py-3 md:py-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Accueil</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            const label = routeLabels[name] || name.charAt(0).toUpperCase() + name.slice(1);
            
            return (
              <div key={routeTo} className="flex items-center gap-2">
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="font-medium text-foreground line-clamp-1 max-w-[200px] sm:max-w-none">
                      {label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={routeTo} className="hover:text-primary transition-colors line-clamp-1 max-w-[150px] sm:max-w-none">
                        {label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
