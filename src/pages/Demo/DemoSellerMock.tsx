import { Package, CheckCircle2, Clock, User, Truck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DemoSellerMockProps {
  progress: number;
}

const DemoSellerMock = ({ progress }: DemoSellerMockProps) => {
  const showValidation = progress > 30;
  const validated = progress > 60;
  const showTripleValidation = progress > 80;

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary p-4 pt-8">
        <h2 className="text-primary-foreground font-bold text-lg">Dashboard Vendeur</h2>
        <p className="text-primary-foreground/70 text-sm">AgroTech Côte d'Ivoire</p>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {/* Order Card */}
        <div className="bg-card rounded-xl border border-border overflow-hidden mb-4">
          <div className="bg-amber-50 dark:bg-amber-950/30 px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Nouvelle commande</span>
            </div>
            <span className="text-xs text-amber-600 dark:text-amber-500">#CMD-2024-001</span>
          </div>

          <div className="p-3">
            {/* Product */}
            <div className="flex gap-3 mb-3">
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=80&h=80&fit=crop"
                alt="Machine"
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-medium text-sm">Machine de transformation</h3>
                <p className="text-xs text-muted-foreground">Quantité: 1</p>
                <p className="text-sm font-bold text-primary mt-1">2,500,000 F</p>
              </div>
            </div>

            {/* Buyer Info */}
            <div className="bg-muted/50 rounded-lg p-2 mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Marie KOFFI</p>
                <p className="text-xs text-muted-foreground">Abidjan, Cocody</p>
              </div>
            </div>

            {/* Validation Button */}
            <div className={cn(
              'transition-all duration-500',
              showValidation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}>
              <Button
                className={cn(
                  'w-full gap-2 transition-all duration-300',
                  validated
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'animate-pulse ring-4 ring-primary/30'
                )}
                disabled={validated}
              >
                {validated ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Commande confirmée
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Confirmer la commande
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Triple Validation Status */}
        {showTripleValidation && (
          <div className="bg-card rounded-xl border border-border p-4 animate-scale-in">
            <h3 className="font-semibold text-sm mb-3">Triple validation en cours</h3>
            <div className="space-y-3">
              {/* Seller */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Vendeur</p>
                  <p className="text-xs text-green-600">Confirmé</p>
                </div>
              </div>

              {/* Courier */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Truck className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Livreur</p>
                  <p className="text-xs text-amber-600">En cours de livraison</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground animate-pulse" />
              </div>

              {/* Buyer */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Acheteur</p>
                  <p className="text-xs text-muted-foreground">En attente</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Badge */}
      {showTripleValidation && (
        <div className="absolute bottom-8 left-4 right-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl p-3 shadow-xl animate-scale-in">
          <p className="text-sm font-semibold text-center">
            ✓ Triple validation : Vendeur → Livreur → Acheteur
          </p>
          <p className="text-xs text-center opacity-90 mt-1">
            Paiement libéré après confirmation de tous les acteurs
          </p>
        </div>
      )}
    </div>
  );
};

export default DemoSellerMock;
