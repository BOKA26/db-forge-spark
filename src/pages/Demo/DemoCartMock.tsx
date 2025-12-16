import { ShieldCheck, Lock, MapPin, CreditCard, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DemoCartMockProps {
  progress: number;
}

const DemoCartMock = ({ progress }: DemoCartMockProps) => {
  const showEscrowBadge = progress > 50;
  const highlightPayment = progress > 75;

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary p-4 pt-8">
        <h2 className="text-primary-foreground font-bold text-lg">Mon panier</h2>
        <p className="text-primary-foreground/70 text-sm">1 article</p>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {/* Cart Item */}
        <div className="bg-card rounded-xl border border-border p-3 mb-4">
          <div className="flex gap-3">
            <img
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop"
              alt="Machine"
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-medium text-sm">Machine de transformation de manioc</h3>
              <p className="text-xs text-muted-foreground">AgroTech CI</p>
              <div className="flex justify-between items-end mt-2">
                <div className="flex items-center gap-2 border border-border rounded-lg">
                  <button className="px-2 py-1 text-muted-foreground">-</button>
                  <span className="font-medium">1</span>
                  <button className="px-2 py-1 text-muted-foreground">+</button>
                </div>
                <p className="font-bold text-primary">2,500,000 F</p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-muted/50 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Adresse de livraison</h3>
          </div>
          <p className="text-sm">Marie KOFFI</p>
          <p className="text-xs text-muted-foreground">Abidjan, Cocody - Riviera 3</p>
          <p className="text-xs text-muted-foreground">+225 07 XX XX XX</p>
        </div>

        {/* Escrow Explanation */}
        <div className={cn(
          'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-3 mb-4 transition-all duration-500',
          showEscrowBadge ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}>
          <div className="flex items-start gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm text-green-700 dark:text-green-400">Paiement Escrow sécurisé</h3>
              <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                Vos fonds sont conservés en sécurité jusqu'à la confirmation de réception de votre commande.
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-xl border border-border p-3">
          <h3 className="font-semibold text-sm mb-3">Récapitulatif</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total</span>
              <span>2,500,000 F</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Livraison</span>
              <span>25,000 F</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frais Escrow</span>
              <span className="text-green-600">0 F</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">2,525,000 F</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-4 border-t border-border bg-background">
        <Button
          className={cn(
            'w-full h-12 text-base font-semibold transition-all duration-300 gap-2',
            highlightPayment && 'animate-pulse ring-4 ring-primary/30'
          )}
        >
          <Lock className="h-4 w-4" />
          Payer en toute sécurité
        </Button>
        <div className="flex items-center justify-center gap-2 mt-2">
          <CreditCard className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Mobile Money • Carte bancaire</span>
        </div>
      </div>

      {/* Floating Badge */}
      {showEscrowBadge && (
        <div className="absolute bottom-28 left-4 bg-primary text-primary-foreground rounded-lg px-3 py-2 shadow-lg animate-scale-in flex items-center gap-2">
          <Lock className="h-4 w-4" />
          <p className="text-xs font-medium">Fonds bloqués jusqu'à livraison</p>
        </div>
      )}
    </div>
  );
};

export default DemoCartMock;
