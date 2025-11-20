import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShoppingBag, TrendingUp, Store } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-accent/10 to-background py-16 md:py-24 lg:py-32">
      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23000' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>
      
      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-8 md:space-y-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Plateforme N°1 du Commerce Africain</span>
          </div>
          
          <div className="space-y-4 md:space-y-6 max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight">
              Découvrez les Meilleurs<br />
              <span className="text-primary">Produits Africains</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Des milliers de produits authentiques, livrés directement depuis les fabricants africains. Qualité garantie, prix compétitifs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 md:gap-5 w-full sm:w-auto sm:justify-center mt-2">
            <Button 
              asChild 
              size="lg" 
              className="h-14 md:h-16 text-base md:text-lg px-8 md:px-10 min-w-[220px] touch-manipulation shadow-lg hover:shadow-xl transition-shadow font-semibold"
            >
              <Link to="/produits">
                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 mr-3" />
                Voir les Produits
              </Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline"
              className="h-14 md:h-16 text-base md:text-lg px-8 md:px-10 min-w-[220px] touch-manipulation border-2 hover:bg-primary/5 font-semibold"
            >
              <Link to="/boutiques">
                <Store className="w-5 h-5 md:w-6 md:h-6 mr-3" />
                Explorer les Boutiques
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 w-full max-w-4xl mt-12">
            <div className="flex flex-col items-center p-6 md:p-8 bg-card rounded-2xl border-2 border-border hover:border-primary/50 transition-colors shadow-sm">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 md:w-10 md:h-10 text-primary" />
              </div>
              <h3 className="font-bold text-lg md:text-xl text-foreground mb-1">10,000+ Produits</h3>
              <p className="text-sm md:text-base text-muted-foreground">Catalogue varié et authentique</p>
            </div>
            <div className="flex flex-col items-center p-6 md:p-8 bg-card rounded-2xl border-2 border-border hover:border-primary/50 transition-colors shadow-sm">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-african-green/20 to-african-green/5 flex items-center justify-center mb-4">
                <Store className="w-8 h-8 md:w-10 md:h-10 text-african-green" />
              </div>
              <h3 className="font-bold text-lg md:text-xl text-foreground mb-1">500+ Fabricants</h3>
              <p className="text-sm md:text-base text-muted-foreground">Vérifiés et fiables</p>
            </div>
            <div className="flex flex-col items-center p-6 md:p-8 bg-card rounded-2xl border-2 border-border hover:border-primary/50 transition-colors shadow-sm">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-accent" />
              </div>
              <h3 className="font-bold text-lg md:text-xl text-foreground mb-1">Prix Compétitifs</h3>
              <p className="text-sm md:text-base text-muted-foreground">Directement du fabricant</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
