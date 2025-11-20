import { Link } from 'react-router-dom';
import { 
  Smartphone, 
  Shirt, 
  Home as HomeIcon, 
  Sparkles, 
  Utensils, 
  Baby,
  Palette,
  Dumbbell,
  BookOpen,
  Briefcase,
  Gift,
  TrendingUp
} from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

const categories = [
  {
    name: 'Mode & Vêtements',
    icon: Shirt,
    subcategories: [
      { name: 'Vêtements Homme', href: '/produits?categorie=Mode&sub=homme' },
      { name: 'Vêtements Femme', href: '/produits?categorie=Mode&sub=femme' },
      { name: 'Enfants & Bébés', href: '/produits?categorie=Mode&sub=enfants' },
      { name: 'Chaussures', href: '/produits?categorie=Mode&sub=chaussures' },
      { name: 'Accessoires', href: '/produits?categorie=Mode&sub=accessoires' },
    ],
  },
  {
    name: 'Électronique',
    icon: Smartphone,
    subcategories: [
      { name: 'Smartphones & Tablettes', href: '/produits?categorie=Électronique&sub=smartphones' },
      { name: 'Ordinateurs', href: '/produits?categorie=Électronique&sub=ordinateurs' },
      { name: 'Audio & Vidéo', href: '/produits?categorie=Électronique&sub=audio' },
      { name: 'Accessoires', href: '/produits?categorie=Électronique&sub=accessoires' },
    ],
  },
  {
    name: 'Maison & Décoration',
    icon: HomeIcon,
    subcategories: [
      { name: 'Meubles', href: '/produits?categorie=Maison&sub=meubles' },
      { name: 'Décoration', href: '/produits?categorie=Maison&sub=decoration' },
      { name: 'Cuisine & Électroménager', href: '/produits?categorie=Maison&sub=cuisine' },
      { name: 'Literie & Linge', href: '/produits?categorie=Maison&sub=literie' },
    ],
  },
  {
    name: 'Beauté & Cosmétiques',
    icon: Sparkles,
    subcategories: [
      { name: 'Maquillage', href: '/produits?categorie=Beauté&sub=maquillage' },
      { name: 'Soins de la Peau', href: '/produits?categorie=Beauté&sub=soins' },
      { name: 'Parfums', href: '/produits?categorie=Beauté&sub=parfums' },
      { name: 'Cheveux', href: '/produits?categorie=Beauté&sub=cheveux' },
    ],
  },
  {
    name: 'Alimentation',
    icon: Utensils,
    subcategories: [
      { name: 'Épices & Condiments', href: '/produits?categorie=Alimentation&sub=epices' },
      { name: 'Produits Locaux', href: '/produits?categorie=Alimentation&sub=locaux' },
      { name: 'Boissons', href: '/produits?categorie=Alimentation&sub=boissons' },
    ],
  },
];

const quickLinks = [
  { name: 'Nouveautés', href: '/produits?sort=recent', icon: TrendingUp },
  { name: 'Promotions', href: '/produits?promo=true', icon: Gift },
  { name: 'Best-sellers', href: '/produits?bestsellers=true', icon: Sparkles },
];

export const MegaMenu = () => {
  return (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="h-10 font-semibold">
            Catégories
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 w-[800px] lg:grid-cols-[1fr_200px]">
              <div className="grid grid-cols-2 gap-4">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <h4 className="font-bold text-sm">{category.name}</h4>
                      </div>
                      <ul className="space-y-1.5">
                        {category.subcategories.map((sub) => (
                          <li key={sub.name}>
                            <NavigationMenuLink asChild>
                              <Link
                                to={sub.href}
                                className="block text-sm text-muted-foreground hover:text-primary hover:bg-muted px-3 py-1.5 rounded-md transition-colors"
                              >
                                {sub.name}
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
              
              {/* Quick Links Sidebar */}
              <div className="space-y-2 border-l pl-4">
                <h4 className="font-bold text-sm mb-4">Raccourcis</h4>
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavigationMenuLink asChild key={link.name}>
                      <Link
                        to={link.href}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg transition-colors group"
                      >
                        <Icon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">{link.name}</span>
                      </Link>
                    </NavigationMenuLink>
                  );
                })}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
