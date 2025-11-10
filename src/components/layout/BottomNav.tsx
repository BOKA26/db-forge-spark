import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, MessageSquare, ShoppingCart, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const BottomNav = () => {
  const location = useLocation();

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
      badge: 57,
    },
    {
      path: '/panier',
      label: 'Panier',
      icon: ShoppingCart,
      activeColor: 'text-foreground',
    },
    {
      path: '/profile',
      label: 'Mon Alibaba',
      icon: User,
      activeColor: 'text-foreground',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 pb-safe">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-1 relative"
            >
              <div className="relative">
                <Icon
                  className={`h-6 w-6 ${
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
                className={`text-xs ${
                  isActive ? item.activeColor : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
