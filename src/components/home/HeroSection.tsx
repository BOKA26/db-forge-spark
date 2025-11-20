import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShoppingBag, TrendingUp, Store } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 md:py-20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
          <div className="space-y-3 md:space-y-4">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Découvrez les Meilleurs Produits Africains
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Des milliers de produits authentiques, livrés directement depuis les fabricants africains
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto sm:justify-center">
            <Button 
              asChild 
              size="lg" 
              className="h-12 md:h-14 text-base md:text-lg px-6 md:px-8 min-w-[200px] touch-manipulation"
            >
              <Link to="/produits">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Voir les Produits
              </Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline"
              className="h-12 md:h-14 text-base md:text-lg px-6 md:px-8 min-w-[200px] touch-manipulation"
            >
              <Link to="/boutiques">
                <Store className="w-5 h-5 mr-2" />
                Explorer les Boutiques
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 w-full max-w-3xl mt-8">
            <div className="flex flex-col items-center p-4 bg-card rounded-lg border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">10,000+ Produits</h3>
              <p className="text-sm text-muted-foreground">Catalogue varié</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-card rounded-lg border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">500+ Fabricants</h3>
              <p className="text-sm text-muted-foreground">Vérifiés et fiables</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-card rounded-lg border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Prix Compétitifs</h3>
              <p className="text-sm text-muted-foreground">Directement du fabricant</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
