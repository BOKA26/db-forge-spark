import { Search, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DemoHomeMockProps {
  progress: number;
}

const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: 'Machine de transformation',
    price: '2,500,000 FCFA',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop',
    badge: 'Populaire',
  },
  {
    id: 2,
    name: 'Équipement agricole',
    price: '1,800,000 FCFA',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=200&h=200&fit=crop',
    badge: 'Nouveau',
  },
  {
    id: 3,
    name: 'Matériaux BTP',
    price: '950,000 FCFA',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=200&fit=crop',
    badge: null,
  },
  {
    id: 4,
    name: 'Textile en gros',
    price: '450,000 FCFA',
    image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=200&h=200&fit=crop',
    badge: 'Promo',
  },
];

const STATS = [
  { icon: Users, label: 'Vendeurs', value: '500+' },
  { icon: TrendingUp, label: 'Produits', value: '10K+' },
  { icon: ShieldCheck, label: 'Transactions', value: '100%' },
];

const DemoHomeMock = ({ progress }: DemoHomeMockProps) => {
  const showBadge = progress > 60;

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary p-4 pt-8">
        <h2 className="text-primary-foreground font-bold text-lg mb-3">BokaTrade</h2>
        <div className="bg-primary-foreground/10 rounded-full flex items-center px-4 py-2.5 backdrop-blur">
          <Search className="h-4 w-4 text-primary-foreground/70 mr-2" />
          <span className="text-primary-foreground/70 text-sm">Rechercher un produit...</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-around py-4 bg-muted/30 border-b border-border">
        {STATS.map((stat, i) => (
          <div key={i} className="text-center">
            <stat.icon className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Products Grid */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Produits vedettes</h3>
          <span className="text-xs text-primary">Voir tout →</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {FEATURED_PRODUCTS.map((product, index) => (
            <div
              key={product.id}
              className={cn(
                'bg-card rounded-xl overflow-hidden border border-border shadow-sm transition-all duration-300',
                index === 0 && progress > 30 && 'ring-2 ring-primary ring-offset-2 scale-[1.02]'
              )}
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-24 object-cover"
                />
                {product.badge && (
                  <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full">
                    {product.badge}
                  </span>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate">{product.name}</p>
                <p className="text-sm font-bold text-primary">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Badge */}
      {showBadge && (
        <div className="absolute bottom-20 left-4 right-4 bg-primary text-primary-foreground rounded-xl p-3 shadow-xl animate-scale-in flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">10,000+ produits vérifiés</p>
            <p className="text-xs opacity-90">Paiement sécurisé par Escrow</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoHomeMock;
