import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, ChevronLeft, ChevronRight, AlertTriangle, Lightbulb, 
  Play, TrendingUp, Wallet, Target, Users, Store, ShoppingBag, 
  Shield, CheckCircle2, Truck, Zap, ArrowRight, Globe, DollarSign,
  Printer
} from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import EmbeddedDemo from '@/components/demo/EmbeddedDemo';

const SlideDeck = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: tractionData } = useQuery({
    queryKey: ['slide-deck-traction'],
    queryFn: async () => {
      const [usersRes, shopsRes, productsRes, ordersRes, betaRes] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('shops').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, montant', { count: 'exact' }),
        supabase.from('beta_sellers').select('id, statut', { count: 'exact' })
      ]);

      const gmv = ordersRes.data?.reduce((acc, order) => acc + Number(order.montant || 0), 0) || 0;
      const betaAccepted = betaRes.data?.filter(b => b.statut === 'accepté').length || 0;

      return {
        users: usersRes.count || 0,
        shops: shopsRes.count || 0,
        products: productsRes.count || 0,
        orders: ordersRes.count || 0,
        gmv,
        betaApplications: betaRes.count || 0,
        betaAccepted
      };
    }
  });

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num) + ' FCFA';
  };

  const handleExportPDF = () => {
    window.print();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToSlide(currentSlide + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToSlide(currentSlide - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const slides = [
    // Slide 1: Problème
    {
      id: 'probleme',
      title: 'Le Problème',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <AlertTriangle className="h-20 w-20 text-destructive mb-8" />
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            85% des commerçants africains
            <br />
            <span className="text-destructive">ne font pas confiance</span>
            <br />
            au commerce en ligne
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mt-8 max-w-4xl">
            <div className="bg-destructive/10 rounded-xl p-6">
              <p className="text-5xl font-bold text-destructive mb-2">$2.1B</p>
              <p className="text-muted-foreground">Perdus en fraudes e-commerce/an en Afrique</p>
            </div>
            <div className="bg-destructive/10 rounded-xl p-6">
              <p className="text-5xl font-bold text-destructive mb-2">67%</p>
              <p className="text-muted-foreground">Abandonnent avant paiement par méfiance</p>
            </div>
            <div className="bg-destructive/10 rounded-xl p-6">
              <p className="text-5xl font-bold text-destructive mb-2">0</p>
              <p className="text-muted-foreground">Solution Escrow B2B locale</p>
            </div>
          </div>
        </div>
      )
    },
    // Slide 2: Solution
    {
      id: 'solution',
      title: 'Notre Solution',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <Lightbulb className="h-20 w-20 text-primary mb-8" />
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            BokaTrade
          </h2>
          <p className="text-2xl text-muted-foreground mb-8">
            Le marketplace B2B sécurisé par <span className="text-primary font-bold">Escrow</span>
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mt-4">
            <div className="bg-primary/5 rounded-2xl p-8 border border-primary/20">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Paiement Escrow</h3>
              <p className="text-muted-foreground">Fonds bloqués jusqu'à réception confirmée</p>
            </div>
            <div className="bg-green-500/5 rounded-2xl p-8 border border-green-500/20">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Triple Validation</h3>
              <p className="text-muted-foreground">Vendeur + Livreur + Acheteur</p>
            </div>
            <div className="bg-amber-500/5 rounded-2xl p-8 border border-amber-500/20">
              <Truck className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Tracking GPS</h3>
              <p className="text-muted-foreground">Suivi en temps réel des livraisons</p>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-3 text-lg">
            <ArrowRight className="h-5 w-5 text-primary" />
            <span className="font-medium">Zéro fraude. 100% confiance. Paiement garanti.</span>
          </div>
        </div>
      )
    },
    // Slide 3: Démo
    {
      id: 'demo',
      title: 'Démo Produit',
      content: (
        <div className="flex flex-col items-center justify-center h-full px-8">
          <div className="flex items-center gap-3 mb-6">
            <Play className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">Parcours Utilisateur</h2>
          </div>
          <p className="text-muted-foreground mb-6 text-center max-w-xl">
            De la découverte à la transaction sécurisée en 5 étapes
          </p>
          <EmbeddedDemo />
        </div>
      )
    },
    // Slide 4: Traction
    {
      id: 'traction',
      title: 'Traction',
      content: (
        <div className="flex flex-col items-center justify-center h-full px-8">
          <TrendingUp className="h-16 w-16 text-primary mb-6" />
          <h2 className="text-4xl font-bold mb-2">Traction & KPIs</h2>
          <Badge className="mb-8">Données en temps réel</Badge>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mb-8">
            <div className="bg-blue-500/10 rounded-xl p-6 text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-4xl font-bold">{tractionData?.users || 0}</p>
              <p className="text-sm text-muted-foreground">Utilisateurs</p>
            </div>
            <div className="bg-green-500/10 rounded-xl p-6 text-center">
              <Store className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-4xl font-bold">{tractionData?.shops || 0}</p>
              <p className="text-sm text-muted-foreground">Boutiques</p>
            </div>
            <div className="bg-purple-500/10 rounded-xl p-6 text-center">
              <ShoppingBag className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-4xl font-bold">{tractionData?.orders || 0}</p>
              <p className="text-sm text-muted-foreground">Commandes</p>
            </div>
            <div className="bg-amber-500/10 rounded-xl p-6 text-center">
              <DollarSign className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{formatCurrency(tractionData?.gmv || 0)}</p>
              <p className="text-sm text-muted-foreground">GMV Total</p>
            </div>
          </div>

          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 max-w-2xl">
            <h3 className="font-bold mb-4 text-center">Programme Beta Vendeurs</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-primary">{tractionData?.betaApplications || 0}</p>
                <p className="text-xs text-muted-foreground">Candidatures</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{tractionData?.betaAccepted || 0}</p>
                <p className="text-xs text-muted-foreground">Acceptés</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{tractionData?.products || 0}</p>
                <p className="text-xs text-muted-foreground">Produits</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    // Slide 5: Business Model
    {
      id: 'business-model',
      title: 'Business Model',
      content: (
        <div className="flex flex-col items-center justify-center h-full px-8">
          <Wallet className="h-16 w-16 text-primary mb-6" />
          <h2 className="text-4xl font-bold mb-8">Business Model</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
            <div className="bg-muted/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-primary" />
                Sources de Revenus
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                  <span>Commission transaction</span>
                  <Badge variant="default">3-5%</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                  <span>Frais Escrow</span>
                  <Badge variant="default">1.5%</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                  <span>Abonnement Premium</span>
                  <Badge variant="secondary">À venir</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                  <span>Livraison intégrée</span>
                  <Badge variant="secondary">À venir</Badge>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-2xl p-8 border border-primary/20">
              <h3 className="text-2xl font-bold mb-6">Projections</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">M3 - GMV</span>
                  <span className="font-bold">5M FCFA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">M6 - GMV</span>
                  <span className="font-bold">25M FCFA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">M12 - GMV</span>
                  <span className="font-bold text-primary">100M FCFA</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">MRR M12</span>
                    <span className="font-bold text-green-600">5M FCFA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-8 text-center">
            🎁 Beta: 0% commission pour les 100 premiers vendeurs
          </p>
        </div>
      )
    },
    // Slide 6: Vision
    {
      id: 'vision',
      title: 'Vision 12 Mois',
      content: (
        <div className="flex flex-col items-center justify-center h-full px-8">
          <Target className="h-16 w-16 text-primary mb-6" />
          <h2 className="text-4xl font-bold mb-2">Vision à 12 Mois</h2>
          <p className="text-xl text-muted-foreground mb-8">Devenir le "Alibaba africain"</p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mb-8">
            <div className="relative">
              <div className="bg-blue-500/10 rounded-2xl p-6 text-center h-full">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Q1</Badge>
                <h3 className="text-lg font-bold mt-4 mb-4">Lancement</h3>
                <ul className="text-sm text-muted-foreground text-left space-y-2">
                  <li>✓ MVP fonctionnel</li>
                  <li>✓ 100 vendeurs beta</li>
                  <li>✓ Escrow opérationnel</li>
                  <li>✓ 5M FCFA GMV</li>
                </ul>
              </div>
            </div>
            <div className="relative">
              <div className="bg-green-500/10 rounded-2xl p-6 text-center h-full">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="secondary">Q2-Q3</Badge>
                <h3 className="text-lg font-bold mt-4 mb-4">Croissance</h3>
                <ul className="text-sm text-muted-foreground text-left space-y-2">
                  <li>→ 500+ vendeurs actifs</li>
                  <li>→ App mobile iOS/Android</li>
                  <li>→ Expansion Sénégal</li>
                  <li>→ 50M FCFA GMV</li>
                </ul>
              </div>
            </div>
            <div className="relative">
              <div className="bg-primary/10 rounded-2xl p-6 text-center h-full border-2 border-primary/30">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="default">Q4</Badge>
                <h3 className="text-lg font-bold mt-4 mb-4">Scale</h3>
                <ul className="text-sm text-muted-foreground text-left space-y-2">
                  <li>🎯 2000+ vendeurs</li>
                  <li>🎯 5 pays UEMOA</li>
                  <li>🎯 Seed Round</li>
                  <li>🎯 100M FCFA GMV</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl p-6 max-w-2xl">
            <Globe className="h-12 w-12 text-primary flex-shrink-0" />
            <div>
              <p className="font-bold text-lg">Objectif 2027</p>
              <p className="text-muted-foreground">1 milliard $ de transactions B2B sécurisées en Afrique</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
    }
  };

  return (
    <>
      <SEOHead 
        title="Pitch Deck - BokaTrade" 
        description="Présentation investisseurs BokaTrade" 
      />
      
      <style>{`
        @page {
          size: A4 landscape;
          margin: 0;
        }
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          html, body { 
            margin: 0 !important; 
            padding: 0 !important; 
            width: 100% !important;
            height: 100% !important;
          }
          /* Hide all navigation, footer, headers */
          nav, footer, header, 
          .no-print, 
          .screen-only,
          [class*="BottomNav"],
          [class*="bottom-nav"],
          [class*="Navbar"],
          [class*="navbar"],
          [class*="Footer"],
          [class*="footer"],
          [class*="fixed bottom"],
          .fixed.bottom-0 {
            display: none !important;
            visibility: hidden !important;
          }
          #print-container {
            display: block !important;
            visibility: visible !important;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
          .print-slide-page {
            page-break-after: always;
            page-break-inside: avoid;
            break-after: page;
            break-inside: avoid;
            min-height: 100vh;
            width: 100%;
            padding: 40px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            background: white;
          }
          .print-slide-page:last-child {
            page-break-after: avoid;
          }
        }
        @media screen {
          #print-container {
            display: none;
          }
        }
      `}</style>

      {/* Print Container - Hidden on screen, visible on print */}
      <div id="print-container">
        {slides.map((slide) => (
          <div key={`print-${slide.id}`} className="print-slide-page">
            <div className="flex-1 flex items-center justify-center">
              {slide.id === 'demo' ? (
                <div className="text-center py-12 w-full">
                  <Play className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Démo Interactive</h3>
                  <p className="text-gray-600 mb-4">Parcours utilisateur en 5 étapes</p>
                  <div className="flex justify-center gap-4 flex-wrap">
                    {['Découverte', 'Sélection', 'Commande', 'Validation', 'Succès'].map((step, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {i + 1}. {step}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-6">
                    🔗 Voir la démo en direct sur bokatrade.com/demo
                  </p>
                </div>
              ) : (
                slide.content
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="min-h-screen bg-background flex flex-col screen-only">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border no-print">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">BokaTrade</h1>
              <Badge variant="outline">Pitch Deck</Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {currentSlide + 1} / {slides.length}
              </span>
              <Button onClick={handleExportPDF} size="sm" className="gap-2">
                <Printer className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Slide Content */}
        <div className="flex-1 relative overflow-hidden">
          <div 
            className="slide-content h-full w-full transition-transform duration-500 ease-out"
            style={{ minHeight: 'calc(100vh - 120px)' }}
          >
            {slides[currentSlide].content}
          </div>
        </div>

        {/* Navigation */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border no-print">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => goToSlide(currentSlide - 1)}
                disabled={currentSlide === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>
              
              {/* Slide indicators */}
              <div className="flex items-center gap-2">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide 
                        ? 'bg-primary w-8' 
                        : 'bg-muted hover:bg-muted-foreground/30'
                    }`}
                    title={slide.title}
                  />
                ))}
              </div>

              <Button 
                variant="outline" 
                onClick={() => goToSlide(currentSlide + 1)}
                disabled={currentSlide === slides.length - 1}
                className="gap-2"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Slide titles */}
            <div className="flex justify-center gap-4 mt-2 overflow-x-auto">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  className={`text-xs px-2 py-1 rounded whitespace-nowrap transition-colors ${
                    index === currentSlide 
                      ? 'text-primary font-medium' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {index + 1}. {slide.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SlideDeck;
