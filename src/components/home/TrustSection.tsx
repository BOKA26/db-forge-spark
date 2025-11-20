import { Shield, Truck, RotateCcw, Lock, CreditCard, Smartphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const trustBadges = [
  {
    icon: Shield,
    title: 'Paiement sécurisé',
    description: 'SSL & Cryptage 256-bit'
  },
  {
    icon: Truck,
    title: 'Livraison garantie',
    description: 'Suivi en temps réel'
  },
  {
    icon: RotateCcw,
    title: 'Retour facile',
    description: '14 jours pour changer d\'avis'
  },
  {
    icon: Lock,
    title: '100% Sécurisé',
    description: 'Protection des données'
  }
];

const paymentMethods = [
  { name: 'Visa', logo: '💳' },
  { name: 'Mastercard', logo: '💳' },
  { name: 'Orange Money', logo: '📱', color: 'bg-orange-500' },
  { name: 'MTN Money', logo: '📱', color: 'bg-yellow-500' },
  { name: 'Moov Money', logo: '📱', color: 'bg-blue-500' },
  { name: 'COD', logo: '💵', color: 'bg-green-500' }
];

export const TrustSection = () => {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Pourquoi Nous Choisir ?
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Votre satisfaction et sécurité sont nos priorités
          </p>
        </div>
        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10 md:mb-12">
          {trustBadges.map((badge, index) => (
            <Card key={index} className="border-primary/20 hover:border-primary/40 hover:shadow-md transition-all">
              <CardContent className="p-6 text-center touch-manipulation">
                <badge.icon className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold text-base md:text-lg mb-1 text-foreground">{badge.title}</h3>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="text-center mb-8 md:mb-10">
          <h3 className="text-xl md:text-2xl font-semibold mb-6 text-foreground flex items-center justify-center gap-2">
            <CreditCard className="w-6 h-6" />
            Moyens de Paiement Acceptés
          </h3>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {paymentMethods.map((method, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 bg-card border rounded-lg hover:shadow-md transition-all touch-manipulation min-w-[120px] md:min-w-[140px]"
              >
                <span className="text-2xl md:text-3xl">{method.logo}</span>
                <span className="text-sm md:text-base font-medium text-foreground">{method.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Info */}
        <div className="p-6 md:p-8 bg-primary/5 rounded-xl border border-primary/20">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <Lock className="w-8 h-8 text-primary flex-shrink-0" />
            <div className="text-sm md:text-base">
              <p className="font-semibold text-foreground text-lg mb-2">Garantie de Sécurité</p>
              <p className="text-muted-foreground">
                Vos paiements sont sécurisés avec un cryptage SSL. Nous ne stockons jamais vos informations bancaires.
              </p>
              <div className="flex flex-wrap gap-4 mt-3">
                <span className="font-medium text-foreground">✓ Livraison sous 2-5 jours</span>
                <span className="font-medium text-foreground">✓ Retour gratuit sous 14 jours</span>
                <span className="font-medium text-foreground">✓ Remboursement garanti</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
