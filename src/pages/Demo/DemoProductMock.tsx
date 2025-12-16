import { Star, ShieldCheck, Truck, MessageCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DemoProductMockProps {
  progress: number;
}

const PRICE_TIERS = [
  { qty: '1-10', price: '2,500,000' },
  { qty: '11-50', price: '2,350,000' },
  { qty: '51-100', price: '2,200,000' },
  { qty: '100+', price: '2,000,000' },
];

const DemoProductMock = ({ progress }: DemoProductMockProps) => {
  const showPriceTiers = progress > 40;
  const highlightButton = progress > 70;

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Product Image */}
      <div className="relative h-48 bg-muted">
        <img
          src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop"
          alt="Machine de transformation"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-12 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" />
          Vendeur vérifié
        </div>
      </div>

      {/* Product Info */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-lg font-bold leading-tight">Machine de transformation de manioc</h1>
          <div className="flex items-center text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium ml-1">4.8</span>
          </div>
        </div>

        <p className="text-2xl font-bold text-primary mb-1">2,500,000 FCFA</p>
        <p className="text-xs text-muted-foreground mb-4">Prix unitaire • MOQ: 1 unité</p>

        {/* Seller Info */}
        <div className="bg-muted/50 rounded-xl p-3 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold">AT</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">AgroTech Côte d'Ivoire</p>
            <p className="text-xs text-muted-foreground">127 ventes • Abidjan</p>
          </div>
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Price Tiers */}
        <div className={cn(
          'transition-all duration-500',
          showPriceTiers ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Prix dégressifs B2B</h3>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {PRICE_TIERS.map((tier, i) => (
              <div
                key={i}
                className={cn(
                  'text-center p-2 rounded-lg border transition-colors',
                  i === 0 ? 'border-primary bg-primary/5' : 'border-border'
                )}
              >
                <p className="text-[10px] text-muted-foreground">{tier.qty}</p>
                <p className="text-xs font-bold">{tier.price.split(',')[0]}K</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <span>Paiement Escrow sécurisé</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Truck className="h-4 w-4 text-blue-500" />
            <span>Livraison avec suivi GPS</span>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-4 border-t border-border bg-background">
        <Button
          className={cn(
            'w-full h-12 text-base font-semibold transition-all duration-300',
            highlightButton && 'animate-pulse ring-4 ring-primary/30'
          )}
        >
          Ajouter au panier
        </Button>
      </div>

      {/* Floating Badge */}
      {showPriceTiers && (
        <div className="absolute bottom-24 right-4 bg-amber-500 text-white rounded-lg px-3 py-2 shadow-lg animate-scale-in">
          <p className="text-xs font-medium">💰 -20% sur grosses quantités</p>
        </div>
      )}
    </div>
  );
};

export default DemoProductMock;
