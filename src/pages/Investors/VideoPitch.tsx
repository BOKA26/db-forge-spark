import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Clock, Target, Lightbulb, TrendingUp, Users, 
  DollarSign, Eye, ArrowRight, Video, Upload, CheckCircle2
} from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { Link } from 'react-router-dom';

const VideoPitch = () => {
  const [activeVideo, setActiveVideo] = useState<'pitch' | 'demo'>('pitch');

  const pitchSections = [
    { icon: Target, title: 'Le Problème', duration: '10s', description: '85% des commerçants africains ne font pas confiance au e-commerce' },
    { icon: Lightbulb, title: 'La Solution', duration: '15s', description: 'BokaTrade : escrow sécurisé + validation triple partie' },
    { icon: Play, title: 'La Démo Choc', duration: '10s', description: 'Parcours acheteur en 5 clics avec paiement sécurisé' },
    { icon: Users, title: 'La Traction', duration: '10s', description: 'Utilisateurs actifs, vendeurs vérifiés, GMV généré' },
    { icon: DollarSign, title: 'Business Model', duration: '10s', description: 'Commission 3-5% sur transactions + services premium' },
    { icon: Eye, title: 'La Vision', duration: '5s', description: 'Devenir le Alibaba de confiance pour l\'Afrique' },
  ];

  return (
    <>
      <SEOHead 
        title="Vidéo Pitch - BokaTrade Investisseurs" 
        description="Pitch vidéo d'1 minute et démo produit de BokaTrade" 
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Header */}
        <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-xl font-bold text-primary">BokaTrade</Link>
              <Badge variant="secondary">Investisseurs</Badge>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/pitch-deck">
                <Button variant="outline" size="sm">Pitch Deck</Button>
              </Link>
              <Link to="/data-room">
                <Button variant="outline" size="sm">Data Room</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Title Section */}
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="outline">
              <Video className="h-3 w-3 mr-1" />
              Vidéos Investisseurs
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Pitch Vidéo & Démo
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez BokaTrade en vidéo : pitch d'1 minute et démo produit de 30 secondes
            </p>
          </div>

          {/* Video Type Selector */}
          <div className="flex justify-center gap-4 mb-12">
            <Button 
              variant={activeVideo === 'pitch' ? 'default' : 'outline'}
              onClick={() => setActiveVideo('pitch')}
              className="gap-2"
            >
              <Clock className="h-4 w-4" />
              Pitch (1 min)
            </Button>
            <Button 
              variant={activeVideo === 'demo' ? 'default' : 'outline'}
              onClick={() => setActiveVideo('demo')}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Démo (30s)
            </Button>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Video Player Placeholder */}
            <Card className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex flex-col items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-primary/90 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-2xl">
                    <Play className="h-10 w-10 text-primary-foreground ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                  <Badge variant="secondary" className="bg-background/80">
                    {activeVideo === 'pitch' ? '1:00' : '0:30'}
                  </Badge>
                  <Badge variant="secondary" className="bg-background/80">
                    {activeVideo === 'pitch' ? 'Pitch Investisseurs' : 'Démo Produit'}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">
                    {activeVideo === 'pitch' ? 'Pitch BokaTrade' : 'Démo Produit'}
                  </h2>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {activeVideo === 'pitch' ? '1 minute' : '30 secondes'}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {activeVideo === 'pitch' 
                    ? 'Présentation complète de BokaTrade : problème, solution, traction et vision pour révolutionner le commerce B2B en Afrique.'
                    : 'Démonstration rapide du parcours utilisateur : de la découverte produit à la validation de livraison sécurisée.'
                  }
                </p>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-dashed border-border">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Upload className="h-5 w-5" />
                    <span className="text-sm">Vidéo en cours de production</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Video Structure / Info */}
            <div>
              {activeVideo === 'pitch' ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Structure du Pitch (1 min)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pitchSections.map((section, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <section.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold">{section.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {section.duration}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {section.description}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Durée totale</span>
                        <Badge>60 secondes max</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="h-5 w-5 text-primary" />
                      Parcours Démo (30s)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { step: 1, title: 'Découverte', description: 'L\'acheteur découvre un produit' },
                      { step: 2, title: 'Sélection', description: 'Choix des options et quantité' },
                      { step: 3, title: 'Commande', description: 'Paiement sécurisé via escrow' },
                      { step: 4, title: 'Livraison', description: 'Suivi GPS en temps réel' },
                      { step: 5, title: 'Validation', description: 'Triple validation et déblocage' },
                    ].map((step, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{step.title}</h3>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                        {index < 4 && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        {index === 4 && (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    ))}

                    <div className="pt-4">
                      <Link to="/demo">
                        <Button className="w-full gap-2">
                          <Play className="h-4 w-4" />
                          Essayer la démo interactive
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto bg-primary/5 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Intéressé par BokaTrade ?</h2>
                <p className="text-muted-foreground mb-6">
                  Consultez notre pitch deck complet ou accédez à la data room pour plus de détails.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/pitch-deck">
                    <Button size="lg" className="gap-2">
                      Voir le Pitch Deck
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/data-room">
                    <Button size="lg" variant="outline" className="gap-2">
                      Accéder à la Data Room
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoPitch;
