import { CheckCircle2, PartyPopper, ShieldCheck, Star, TrendingUp, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DemoSuccessMockProps {
  progress: number;
}

const DemoSuccessMock = ({ progress }: DemoSuccessMockProps) => {
  const showConfetti = progress > 20;
  const showDetails = progress > 40;
  const showStats = progress > 70;

  return (
    <div className="h-full bg-gradient-to-b from-green-50 to-background dark:from-green-950/20 flex flex-col">
      {/* Success Animation */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* Confetti Effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              >
                <PartyPopper
                  className={cn(
                    'h-4 w-4',
                    ['text-primary', 'text-amber-500', 'text-green-500', 'text-blue-500'][
                      Math.floor(Math.random() * 4)
                    ]
                  )}
                />
              </div>
            ))}
          </div>
        )}

        {/* Main Success Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-scale-in">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-primary flex items-center justify-center animate-bounce">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2 animate-fade-in">
          Paiement libéré !
        </h1>
        <p className="text-muted-foreground mb-6 animate-fade-in">
          La transaction a été complétée avec succès
        </p>

        {/* Transaction Details */}
        <div className={cn(
          'w-full bg-card rounded-xl border border-border p-4 mb-4 transition-all duration-500',
          showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}>
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold">Transaction sécurisée</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Commande</span>
              <span className="font-medium">#CMD-2024-001</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant</span>
              <span className="font-bold text-green-600">2,525,000 FCFA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vendeur</span>
              <span>AgroTech CI</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Statut</span>
              <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-0.5 rounded-full">
                ✓ Terminé
              </span>
            </div>
          </div>
        </div>

        {/* Rating Prompt */}
        <div className={cn(
          'w-full bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 transition-all duration-500',
          showDetails ? 'opacity-100 translate-y-0 delay-200' : 'opacity-0 translate-y-4'
        )}>
          <p className="text-sm font-medium mb-2">Comment s'est passée votre expérience ?</p>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'h-8 w-8 transition-all duration-300',
                  star <= 4
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-muted-foreground'
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      {showStats && (
        <div className="bg-primary text-primary-foreground p-4 animate-slide-in-right">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5" />
            <p className="font-bold">BokaTrade en chiffres</p>
          </div>
          <div className="flex justify-around text-center">
            <div>
              <p className="text-xl font-bold">100%</p>
              <p className="text-xs opacity-80">Sécurisé</p>
            </div>
            <div>
              <p className="text-xl font-bold">0%</p>
              <p className="text-xs opacity-80">Fraude</p>
            </div>
            <div>
              <p className="text-xl font-bold">24h</p>
              <p className="text-xs opacity-80">Support</p>
            </div>
          </div>
        </div>
      )}

      {/* Final Badge */}
      {showStats && (
        <div className="absolute bottom-24 left-4 right-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl p-4 shadow-xl animate-scale-in text-center">
          <p className="text-lg font-bold">🎉 Fonds libérés après livraison confirmée</p>
          <p className="text-sm opacity-90 mt-1">
            Zéro risque pour l'acheteur ET le vendeur
          </p>
        </div>
      )}
    </div>
  );
};

export default DemoSuccessMock;
