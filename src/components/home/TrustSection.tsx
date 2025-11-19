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
    <section className="py-8 md:py-12 bg-muted/30">
      <div className="container px-4">
        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {trustBadges.map((badge, index) => (
            <Card key={index} className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-4 text-center">
                <badge.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold text-sm mb-1 text-foreground">{badge.title}</h3>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />
            Moyens de paiement acceptés
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {paymentMethods.map((method, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 bg-card border rounded-lg hover:shadow-md transition-shadow"
              >
                <span className="text-2xl">{method.logo}</span>
                <span className="text-sm font-medium text-foreground">{method.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Politique de sécurité</p>
              <p>
                Vos paiements sont sécurisés avec un cryptage SSL. Nous ne stockons jamais vos informations bancaires. 
                <span className="font-medium"> Livraison sous 2-5 jours</span> • 
                <span className="font-medium"> Retour gratuit sous 14 jours</span> • 
                <span className="font-medium"> Remboursement garanti</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
