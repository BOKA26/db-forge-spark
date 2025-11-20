import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Cpu, 
  Footprints, 
  Sofa, 
  Lightbulb, 
  Refrigerator, 
  Car,
  Wrench,
  Sun,
  Boxes
} from 'lucide-react';

const categories = [
  { name: '📱 Électronique', slug: 'electronique', icon: Cpu, color: 'from-blue-500/10 to-blue-600/10' },
  { name: '👟 Chaussures', slug: 'chaussures', icon: Footprints, color: 'from-purple-500/10 to-purple-600/10' },
  { name: '🪑 Meubles', slug: 'meubles', icon: Sofa, color: 'from-amber-500/10 to-amber-600/10' },
  { name: '💡 Éclairage', slug: 'eclairage', icon: Lightbulb, color: 'from-yellow-500/10 to-yellow-600/10' },
  { name: '🏠 Électroménager', slug: 'electromenager', icon: Refrigerator, color: 'from-green-500/10 to-green-600/10' },
  { name: '🚗 Automobile', slug: 'automobile', icon: Car, color: 'from-red-500/10 to-red-600/10' },
  { name: '🔧 Bricolage', slug: 'bricolage', icon: Wrench, color: 'from-gray-500/10 to-gray-600/10' },
  { name: '☀️ Énergie Renouvelable', slug: 'energie', icon: Sun, color: 'from-orange-500/10 to-orange-600/10' },
];

export const CategoryGrid = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Boxes className="w-6 h-6 text-primary" />
            <h2 className="text-2xl md:text-4xl font-bold text-foreground">
              Catégories Populaires
            </h2>
          </div>
          <p className="text-muted-foreground text-base md:text-lg">
            Explorez nos catégories les plus demandées
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link 
                key={category.slug} 
                to={`/produits?categorie=${encodeURIComponent(category.slug)}`}
              >
                <Card className="h-full hover:shadow-lg transition-all hover:scale-105 group touch-manipulation">
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm md:text-base text-foreground">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
