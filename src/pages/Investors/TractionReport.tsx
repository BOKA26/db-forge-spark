import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, Users, Store, Package, ShoppingBag, MessageSquare, 
  Truck, UserPlus, TrendingUp, Star, Shield, CheckCircle2, 
  Activity, Calendar, Target, Zap, ArrowUpRight
} from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { supabase } from '@/integrations/supabase/client';

const TractionReport = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  const { data: tractionData, isLoading } = useQuery({
    queryKey: ['traction-report-data'],
    queryFn: async () => {
      const [usersRes, shopsRes, productsRes, ordersRes, conversationsRes, messagesRes, deliveriesRes, betaRes] = await Promise.all([
        supabase.from('users').select('id, created_at', { count: 'exact' }),
        supabase.from('shops').select('id, statut', { count: 'exact' }),
        supabase.from('products').select('id, statut', { count: 'exact' }),
        supabase.from('orders').select('id, montant, created_at, statut', { count: 'exact' }),
        supabase.from('conversations').select('id', { count: 'exact', head: true }),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
        supabase.from('deliveries').select('id, statut', { count: 'exact' }),
        supabase.from('beta_sellers').select('id, statut', { count: 'exact' })
      ]);

      const gmv = ordersRes.data?.reduce((acc, order) => acc + Number(order.montant || 0), 0) || 0;
      const betaAccepted = betaRes.data?.filter(b => b.statut === 'accepté').length || 0;
      const activeShops = shopsRes.data?.filter(s => s.statut === 'actif').length || 0;
      const activeProducts = productsRes.data?.filter(p => p.statut === 'actif').length || 0;
      const completedDeliveries = deliveriesRes.data?.filter(d => d.statut === 'livré' || d.statut === 'livrée').length || 0;
      const completedOrders = ordersRes.data?.filter(o => o.statut === 'terminé').length || 0;

      return {
        totalUsers: usersRes.count || 0,
        totalShops: shopsRes.count || 0,
        activeShops,
        totalProducts: productsRes.count || 0,
        activeProducts,
        totalOrders: ordersRes.count || 0,
        completedOrders,
        totalConversations: conversationsRes.count || 0,
        totalMessages: messagesRes.count || 0,
        totalDeliveries: deliveriesRes.count || 0,
        completedDeliveries,
        betaApplications: betaRes.count || 0,
        betaAccepted,
        gmv
      };
    }
  });

  const handleExportPDF = () => {
    window.print();
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num) + ' FCFA';
  };

  const calculateGrowth = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <>
      <SEOHead 
        title="Users & Traction Report - BokaTrade" 
        description="Rapport de traction et métriques utilisateurs BokaTrade" 
      />
      
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #traction-report-content, #traction-report-content * { visibility: visible; }
          #traction-report-content { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            padding: 20px;
          }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
        }
      `}</style>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border no-print">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                Users & Traction Report
              </h1>
              <p className="text-sm text-muted-foreground">BokaTrade - Données en temps réel</p>
            </div>
            <Button onClick={handleExportPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Exporter PDF
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div id="traction-report-content" ref={contentRef} className="container mx-auto px-4 py-8 max-w-5xl">
          
          {/* Cover */}
          <div className="text-center mb-12 pb-8 border-b border-border">
            <Badge className="mb-4">Document Investisseurs</Badge>
            <h1 className="text-4xl font-bold mb-2">USERS & TRACTION REPORT</h1>
            <h2 className="text-2xl text-primary font-semibold mb-4">BokaTrade</h2>
            <p className="text-muted-foreground">Le commerce B2B sécurisé en Afrique</p>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </span>
              <span>|</span>
              <span>Version 1.0</span>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <p className="text-muted-foreground mt-4">Chargement des données...</p>
            </div>
          ) : (
            <>
              {/* Executive Summary */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Zap className="h-6 w-6 text-primary" />
                  Résumé Exécutif
                </h2>
                
                <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-primary">{tractionData?.totalUsers || 0}</p>
                        <p className="text-muted-foreground">Utilisateurs totaux</p>
                      </div>
                      <div className="text-center">
                        <p className="text-4xl font-bold text-green-600">{formatCurrency(tractionData?.gmv || 0)}</p>
                        <p className="text-muted-foreground">GMV Total</p>
                      </div>
                      <div className="text-center">
                        <p className="text-4xl font-bold text-amber-600">{tractionData?.totalOrders || 0}</p>
                        <p className="text-muted-foreground">Transactions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <Separator className="my-8" />

              {/* Key Metrics */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  Métriques Clés
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard 
                    icon={Users} 
                    label="Utilisateurs" 
                    value={tractionData?.totalUsers || 0}
                    subLabel="Depuis le lancement"
                    color="bg-blue-500"
                  />
                  <MetricCard 
                    icon={Store} 
                    label="Boutiques" 
                    value={tractionData?.totalShops || 0}
                    subLabel={`${tractionData?.activeShops || 0} actives`}
                    color="bg-green-500"
                  />
                  <MetricCard 
                    icon={Package} 
                    label="Produits" 
                    value={tractionData?.totalProducts || 0}
                    subLabel={`${tractionData?.activeProducts || 0} actifs`}
                    color="bg-purple-500"
                  />
                  <MetricCard 
                    icon={ShoppingBag} 
                    label="Commandes" 
                    value={tractionData?.totalOrders || 0}
                    subLabel={`${tractionData?.completedOrders || 0} terminées`}
                    color="bg-amber-500"
                  />
                </div>
              </section>

              {/* Engagement Metrics */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  Engagement & Activité
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Communications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/10 rounded-full">
                            <MessageSquare className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium">Conversations</p>
                            <p className="text-xs text-muted-foreground">Discussions B2B initiées</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold">{tractionData?.totalConversations || 0}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/10 rounded-full">
                            <MessageSquare className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <p className="font-medium">Messages</p>
                            <p className="text-xs text-muted-foreground">Messages échangés</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold">{tractionData?.totalMessages || 0}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Livraisons</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-500/10 rounded-full">
                            <Truck className="h-5 w-5 text-amber-500" />
                          </div>
                          <div>
                            <p className="font-medium">Livraisons totales</p>
                            <p className="text-xs text-muted-foreground">Commandes expédiées</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold">{tractionData?.totalDeliveries || 0}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/10 rounded-full">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <p className="font-medium">Livrées avec succès</p>
                            <p className="text-xs text-muted-foreground">Taux: {tractionData?.totalDeliveries ? Math.round((tractionData.completedDeliveries / tractionData.totalDeliveries) * 100) : 0}%</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold">{tractionData?.completedDeliveries || 0}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Beta Program */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <UserPlus className="h-6 w-6 text-primary" />
                  Programme Beta Vendeurs
                </h2>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <p className="text-3xl font-bold text-purple-600">{tractionData?.betaApplications || 0}</p>
                        <p className="text-sm text-muted-foreground">Candidatures reçues</p>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <p className="text-3xl font-bold text-green-600">{tractionData?.betaAccepted || 0}</p>
                        <p className="text-sm text-muted-foreground">Vendeurs acceptés</p>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <p className="text-3xl font-bold text-primary">
                          {tractionData?.betaApplications ? Math.round((tractionData.betaAccepted / tractionData.betaApplications) * 100) : 0}%
                        </p>
                        <p className="text-sm text-muted-foreground">Taux d'acceptation</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <div className="page-break" />

              {/* Growth Targets */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Target className="h-6 w-6 text-primary" />
                  Objectifs de Croissance (J30)
                </h2>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {[
                        { label: 'Utilisateurs', current: tractionData?.totalUsers || 0, target: 500, icon: Users },
                        { label: 'Boutiques', current: tractionData?.totalShops || 0, target: 50, icon: Store },
                        { label: 'Produits', current: tractionData?.totalProducts || 0, target: 200, icon: Package },
                        { label: 'Commandes', current: tractionData?.totalOrders || 0, target: 30, icon: ShoppingBag },
                        { label: 'Livraisons', current: tractionData?.totalDeliveries || 0, target: 20, icon: Truck },
                      ].map((item, i) => {
                        const progress = calculateGrowth(item.current, item.target);
                        const Icon = item.icon;
                        return (
                          <div key={i} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{item.label}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">{item.current} / {item.target}</span>
                                <Badge variant={progress >= 100 ? "default" : progress >= 50 ? "secondary" : "outline"}>
                                  {progress}%
                                </Badge>
                              </div>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Social Proof */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Star className="h-6 w-6 text-amber-500" />
                  Preuves Sociales
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-blue-500/5 to-transparent">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-bold">IK</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                            ))}
                          </div>
                          <p className="italic text-muted-foreground mb-3">
                            "Avant BokaTrade, j'avais peur de vendre en ligne. Maintenant mes fonds sont sécurisés grâce à l'Escrow. Je recommande à tous les vendeurs africains."
                          </p>
                          <p className="text-sm font-medium">Ibrahim K.</p>
                          <p className="text-xs text-muted-foreground">Vendeur Beta • Abidjan, Côte d'Ivoire</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-500/5 to-transparent">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 font-bold">MK</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                            ))}
                          </div>
                          <p className="italic text-muted-foreground mb-3">
                            "La triple validation m'a convaincu de passer ma première commande B2B en ligne. Service impeccable et équipe réactive !"
                          </p>
                          <p className="text-sm font-medium">Marie K.</p>
                          <p className="text-xs text-muted-foreground">Acheteuse Beta • Dakar, Sénégal</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-500/5 to-transparent">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 font-bold">AT</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                            ))}
                          </div>
                          <p className="italic text-muted-foreground mb-3">
                            "Enfin une plateforme qui comprend les défis du commerce B2B en Afrique. Le système Escrow change tout."
                          </p>
                          <p className="text-sm font-medium">Amadou T.</p>
                          <p className="text-xs text-muted-foreground">Grossiste • Bamako, Mali</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-amber-500/5 to-transparent">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-amber-600 font-bold">FD</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(4)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                            ))}
                            <Star className="h-4 w-4 text-amber-500" />
                          </div>
                          <p className="italic text-muted-foreground mb-3">
                            "Le suivi GPS des livraisons est un game-changer pour mes clients. Ils peuvent suivre leur commande en temps réel."
                          </p>
                          <p className="text-sm font-medium">Fatou D.</p>
                          <p className="text-xs text-muted-foreground">E-commerçante • Lomé, Togo</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap gap-3 mt-6 justify-center">
                  <Badge variant="secondary" className="py-2 px-4 text-sm">
                    <Shield className="h-4 w-4 mr-2" /> Escrow 100% sécurisé
                  </Badge>
                  <Badge variant="secondary" className="py-2 px-4 text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Vendeurs vérifiés
                  </Badge>
                  <Badge variant="secondary" className="py-2 px-4 text-sm">
                    <Truck className="h-4 w-4 mr-2" /> Livraison trackée GPS
                  </Badge>
                  <Badge variant="secondary" className="py-2 px-4 text-sm">
                    <Star className="h-4 w-4 mr-2" /> Beta 0% commission
                  </Badge>
                </div>
              </section>

              {/* Footer */}
              <div className="text-center pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Document généré automatiquement • {new Date().toLocaleDateString('fr-FR')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  BokaTrade - Le commerce B2B sécurisé en Afrique
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

// Metric Card Component
const MetricCard = ({ 
  icon: Icon, 
  label, 
  value, 
  subLabel,
  color 
}: { 
  icon: any; 
  label: string; 
  value: number;
  subLabel: string;
  color: string;
}) => (
  <Card className="overflow-hidden">
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${color}/10`}>
          <Icon className={`h-5 w-5 ${color.replace('bg-', 'text-')}`} />
        </div>
        <ArrowUpRight className="h-4 w-4 text-green-500" />
      </div>
      <div className="mt-3">
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{subLabel}</p>
      </div>
    </CardContent>
  </Card>
);

export default TractionReport;
