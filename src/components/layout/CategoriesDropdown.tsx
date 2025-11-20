import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Grid3x3,
  Smartphone,
  Shirt,
  Home as HomeIcon,
  Sparkles,
  Utensils,
  Baby,
  Palette,
  Dumbbell,
  BookOpen,
  ChevronRight,
} from 'lucide-react';

const categories = [
  {
    name: 'Mode & Vêtements',
    icon: Shirt,
    href: '/produits?categorie=Mode',
    color: 'text-pink-500',
  },
  {
    name: 'Électronique',
    icon: Smartphone,
    href: '/produits?categorie=Électronique',
    color: 'text-blue-500',
  },
  {
    name: 'Maison & Décoration',
    icon: HomeIcon,
    href: '/produits?categorie=Maison',
    color: 'text-amber-500',
  },
  {
    name: 'Beauté & Cosmétiques',
    icon: Sparkles,
    href: '/produits?categorie=Beauté',
    color: 'text-purple-500',
  },
  {
    name: 'Alimentation',
    icon: Utensils,
    href: '/produits?categorie=Alimentation',
    color: 'text-green-500',
  },
  {
    name: 'Enfants & Bébés',
    icon: Baby,
    href: '/produits?categorie=Enfants',
    color: 'text-cyan-500',
  },
  {
    name: 'Art & Artisanat',
    icon: Palette,
    href: '/produits?categorie=Art',
    color: 'text-orange-500',
  },
  {
    name: 'Sport & Loisirs',
    icon: Dumbbell,
    href: '/produits?categorie=Sport',
    color: 'text-red-500',
  },
];

export const CategoriesDropdown = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="default" className="md:hidden h-11 gap-2 font-semibold">
          <Grid3x3 className="w-5 h-5" />
          Catégories
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left flex items-center gap-2">
            <Grid3x3 className="w-5 h-5" />
            Toutes les Catégories
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-2">
          <Link
            to="/produits"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Grid3x3 className="w-5 h-5 text-primary" />
              <span className="font-semibold">Tous les produits</span>
            </div>
            <ChevronRight className="w-5 h-5 text-primary" />
          </Link>

          <Separator className="my-4" />

          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                to={category.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-muted transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted group-hover:bg-background flex items-center justify-center transition-colors">
                    <Icon className={`w-5 h-5 ${category.color}`} />
                  </div>
                  <span className="font-medium">{category.name}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};
