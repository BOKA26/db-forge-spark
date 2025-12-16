import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, Brain, LayoutGrid, Map, Wallet, HelpCircle, 
  BarChart3, CheckCircle2, Users, Star, TrendingUp, 
  Shield, Target, Clock, Zap, ArrowRight, Activity,
  ShoppingBag, Store, MessageSquare, Truck, UserPlus, Package
} from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { supabase } from '@/integrations/supabase/client';

const FounderDossier = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch real traction data from Supabase
  const { data: tractionData, isLoading } = useQuery({
    queryKey: ['traction-data'],
    queryFn: async () => {
      const [
        usersRes,
        shopsRes,
        productsRes,
        ordersRes,
        conversationsRes,
        messagesRes,
        deliveriesRes,
        betaRes,
      ] = await Promise.all([
        supabase.from('users').select('id, created_at', { count: 'exact', head: true }),
        supabase.from('shops').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, montant, created_at', { count: 'exact' }),
        supabase.from('conversations').select('id', { count: 'exact', head: true }),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
        supabase.from('deliveries').select('id', { count: 'exact', head: true }),
        supabase.from('beta_sellers').select('id, statut', { count: 'exact' }),
      ]);

      // Calculate GMV from orders
      const gmv = ordersRes.data?.reduce((acc, order) => acc + Number(order.montant || 0), 0) || 0;
      
      // Count beta accepted
      const betaAccepted = betaRes.data?.filter(b => b.statut === 'accepté').length || 0;

      return {
        totalUsers: usersRes.count || 0,
        totalShops: shopsRes.count || 0,
        totalProducts: productsRes.count || 0,
        totalOrders: ordersRes.count || 0,
        totalConversations: conversationsRes.count || 0,
        totalMessages: messagesRes.count || 0,
        totalDeliveries: deliveriesRes.count || 0,
        betaApplications: betaRes.count || 0,
        betaAccepted,
        gmv,
      };
    },
  });

  const handleExportPDF = () => {
    window.print();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num) + ' FCFA';
  };

  return (
    <>
      <SEOHead 
        title="Founder Dossier - BokaTrade"
        description="Document stratégique du fondateur BokaTrade"
      />
      
      {/* Print-only styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #founder-dossier-content, #founder-dossier-content * { visibility: visible; }
          #founder-dossier-content { 
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
        {/* Header with Export Button */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border no-print">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">📋 Founder Dossier</h1>
              <p className="text-sm text-muted-foreground">BokaTrade - Document stratégique</p>
            </div>
            <Button onClick={handleExportPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Exporter PDF
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div id="founder-dossier-content" ref={contentRef} className="container mx-auto px-4 py-8 max-w-5xl">
          
          {/* Cover */}
          <div className="text-center mb-12 pb-8 border-b border-border">
            <Badge className="mb-4">Document Confidentiel</Badge>
            <h1 className="text-4xl font-bold mb-2">FOUNDER DOSSIER</h1>
            <h2 className="text-2xl text-primary font-semibold mb-4">BokaTrade</h2>
            <p className="text-muted-foreground">Le commerce B2B sécurisé en Afrique</p>
            <p className="text-sm text-muted-foreground mt-4">Version 1.0 | Décembre 2024</p>
          </div>

          {/* NEW SECTION: Users & Traction Report */}
          <Section icon={Activity} title="USERS & TRACTION REPORT" subtitle="Données en temps réel">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Chargement des données...</p>
              </div>
            ) : (
              <>
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <MetricCard 
                    icon={Users} 
                    label="Utilisateurs" 
                    value={tractionData?.totalUsers || 0}
                    color="bg-blue-500"
                  />
                  <MetricCard 
                    icon={Store} 
                    label="Boutiques" 
                    value={tractionData?.totalShops || 0}
                    color="bg-green-500"
                  />
                  <MetricCard 
                    icon={Package} 
                    label="Produits" 
                    value={tractionData?.totalProducts || 0}
                    color="bg-purple-500"
                  />
                  <MetricCard 
                    icon={ShoppingBag} 
                    label="Commandes" 
                    value={tractionData?.totalOrders || 0}
                    color="bg-amber-500"
                  />
                </div>

                {/* GMV Highlight */}
                <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">GMV Total (Gross Merchandise Value)</p>
                        <p className="text-3xl font-bold text-primary">
                          {formatCurrency(tractionData?.gmv || 0)}
                        </p>
                      </div>
                      <div className="p-4 bg-primary/20 rounded-full">
                        <TrendingUp className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Metrics */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Engagement</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Conversations</span>
                        </div>
                        <span className="font-bold">{tractionData?.totalConversations || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Messages échangés</span>
                        </div>
                        <span className="font-bold">{tractionData?.totalMessages || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-amber-500" />
                          <span className="text-sm">Livraisons</span>
                        </div>
                        <span className="font-bold">{tractionData?.totalDeliveries || 0}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Programme Beta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4 text-purple-500" />
                          <span className="text-sm">Candidatures Beta</span>
                        </div>
                        <span className="font-bold">{tractionData?.betaApplications || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Acceptés</span>
                        </div>
                        <span className="font-bold">{tractionData?.betaAccepted || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-primary" />
                          <span className="text-sm">Taux d'acceptation</span>
                        </div>
                        <span className="font-bold">
                          {tractionData?.betaApplications 
                            ? Math.round((tractionData.betaAccepted / tractionData.betaApplications) * 100) 
                            : 0}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Traction Summary Table */}
                <Card className="mt-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Résumé Traction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Métrique</th>
                            <th className="text-right py-2">Valeur</th>
                            <th className="text-right py-2">Objectif J30</th>
                            <th className="text-right py-2">Progression</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { metric: 'Utilisateurs', value: tractionData?.totalUsers || 0, target: 500 },
                            { metric: 'Boutiques', value: tractionData?.totalShops || 0, target: 50 },
                            { metric: 'Produits', value: tractionData?.totalProducts || 0, target: 200 },
                            { metric: 'Commandes', value: tractionData?.totalOrders || 0, target: 30 },
                            { metric: 'Livraisons', value: tractionData?.totalDeliveries || 0, target: 20 },
                          ].map((row, i) => {
                            const progress = Math.min(Math.round((row.value / row.target) * 100), 100);
                            return (
                              <tr key={i} className="border-b">
                                <td className="py-2 font-medium">{row.metric}</td>
                                <td className="text-right font-bold">{row.value}</td>
                                <td className="text-right text-muted-foreground">{row.target}</td>
                                <td className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-primary rounded-full transition-all"
                                        style={{ width: `${progress}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-medium w-10">{progress}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Social Proof */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    Preuves Sociales
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-bold text-sm">IK</span>
                          </div>
                          <div>
                            <p className="italic text-sm mb-2">"Avant BokaTrade, j'avais peur de vendre en ligne. Maintenant mes fonds sont sécurisés grâce à l'Escrow."</p>
                            <p className="text-xs text-muted-foreground">— Ibrahim K., Vendeur Beta, Abidjan</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-green-600 font-bold text-sm">MK</span>
                          </div>
                          <div>
                            <p className="italic text-sm mb-2">"La triple validation m'a convaincu de passer ma première commande B2B en ligne. Service impeccable !"</p>
                            <p className="text-xs text-muted-foreground">— Marie K., Acheteuse Beta, Dakar</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Trust Badges */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="secondary" className="py-1.5 px-3">
                      <Shield className="h-3 w-3 mr-1" /> Escrow 100% sécurisé
                    </Badge>
                    <Badge variant="secondary" className="py-1.5 px-3">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Vendeurs vérifiés
                    </Badge>
                    <Badge variant="secondary" className="py-1.5 px-3">
                      <Truck className="h-3 w-3 mr-1" /> Livraison trackée GPS
                    </Badge>
                    <Badge variant="secondary" className="py-1.5 px-3">
                      <Star className="h-3 w-3 mr-1" /> Beta 0% commission
                    </Badge>
                  </div>
                </div>
              </>
            )}
          </Section>

          <Separator className="my-8" />

          {/* Section 1: Founder OS */}
          <Section icon={Brain} title="1. Founder OS" subtitle="Système d'Exploitation du Fondateur">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Clarté
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Mission</p>
                    <p className="font-medium">Sécuriser le commerce B2B en Afrique par l'Escrow</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Vision 2027</p>
                    <p className="font-medium">Devenir le "Alibaba africain" - 1 milliard $ de transactions</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Promesse</p>
                    <p className="font-medium">Zéro fraude, 100% sécurité, paiement garanti</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Focus (80/20)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-primary rounded" />
                    <span className="text-sm">80% Acquisition vendeurs + Escrow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-2 bg-muted-foreground rounded" />
                    <span className="text-sm">20% Amélioration produit</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Rythme
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { freq: 'Quotidien', action: 'Check KPIs, support, 5 prospects' },
                      { freq: 'Hebdomadaire', action: 'Sprint dev, analyse traction' },
                      { freq: 'Mensuel', action: 'Review roadmap' },
                      { freq: 'Trimestriel', action: 'Bilan OKRs, pivot si nécessaire' },
                    ].map((item, i) => (
                      <div key={i} className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="font-semibold text-primary">{item.freq}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.action}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* Section 2: Business Model Canvas */}
          <Section icon={LayoutGrid} title="2. Mini Business Model Canvas" className="page-break">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { title: 'Segments clients', content: 'Fabricants africains, Grossistes, Acheteurs B2B' },
                { title: 'Proposition de valeur', content: 'Marketplace B2B + Escrow + Triple validation' },
                { title: 'Canaux', content: 'App web/mobile, WhatsApp, Agents terrain' },
                { title: 'Relation client', content: 'Self-service + Support WhatsApp + Account managers' },
                { title: 'Sources de revenus', content: 'Commission 5%, Abonnements Premium, Logistique' },
                { title: 'Ressources clés', content: 'Plateforme tech, Vendeurs vérifiés, Partenaires paiement' },
                { title: 'Activités clés', content: 'Vérification, Gestion Escrow, Logistique' },
                { title: 'Partenaires', content: 'Paystack, Wave, Transporteurs, Chambres commerce' },
                { title: 'Structure coûts', content: 'Tech 40%, Marketing 30%, Ops 20%, Admin 10%' },
              ].map((block, i) => (
                <Card key={i} className="bg-muted/30">
                  <CardContent className="p-3">
                    <p className="text-xs font-semibold text-primary mb-1">{block.title}</p>
                    <p className="text-sm">{block.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>

          {/* Section 3: Roadmap */}
          <Section icon={Map} title="3. Roadmap">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Badge variant="outline">90 Jours</Badge>
                  Q1 2025
                </h4>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    { week: 'S1-4', goal: 'Lancement Beta', kpi: '50 vendeurs actifs' },
                    { week: 'S5-8', goal: 'Intégration Mobile Money', kpi: '100 vendeurs, 1ère transaction' },
                    { week: 'S9-12', goal: 'Livraisons trackées', kpi: 'NPS > 40' },
                  ].map((item, i) => (
                    <Card key={i}>
                      <CardContent className="p-3">
                        <Badge variant="secondary" className="mb-2">{item.week}</Badge>
                        <p className="font-medium">{item.goal}</p>
                        <p className="text-xs text-muted-foreground">{item.kpi}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Badge variant="outline">12 Mois</Badge>
                  2025
                </h4>
                <div className="grid md:grid-cols-4 gap-3">
                  {[
                    { q: 'Q1', milestone: 'Product-Market Fit', kpi: '500 vendeurs, 50 tx' },
                    { q: 'Q2', milestone: 'Expansion régionale', kpi: '3 pays (CI, SN, GH)' },
                    { q: 'Q3', milestone: 'Levée Seed', kpi: '500K€' },
                    { q: 'Q4', milestone: 'Scale', kpi: '5000 vendeurs, 500K€ GMV/mois' },
                  ].map((item, i) => (
                    <Card key={i} className="bg-primary/5 border-primary/20">
                      <CardContent className="p-3 text-center">
                        <p className="font-bold text-primary">{item.q}</p>
                        <p className="font-medium text-sm mt-1">{item.milestone}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.kpi}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Section 4: Pipeline Paiements */}
          <Section icon={Wallet} title="4. Pipeline de Paiements" className="page-break">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
                  <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <p className="font-semibold">ACHETEUR</p>
                    <p className="text-xs text-muted-foreground">Passe commande</p>
                  </div>
                  <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />
                  <div className="p-4 bg-primary/20 rounded-xl border-2 border-primary">
                    <Shield className="h-8 w-8 mx-auto text-primary mb-1" />
                    <p className="font-bold">ESCROW</p>
                    <p className="text-xs">Fonds sécurisés</p>
                    <Badge className="mt-2">Commission 5%</Badge>
                  </div>
                  <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />
                  <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <p className="font-semibold">VENDEUR</p>
                    <p className="text-xs text-muted-foreground">Reçoit paiement</p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">Triple validation : Vendeur ✓ → Livreur ✓ → Acheteur ✓</p>
                </div>
              </CardContent>
            </Card>

            <h4 className="font-semibold mb-3">Projections</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Mois</th>
                    <th className="text-right py-2">GMV</th>
                    <th className="text-right py-2">Commission (5%)</th>
                    <th className="text-right py-2">Abonnements</th>
                    <th className="text-right py-2 font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { m: 'M1', gmv: '10M', comm: '500K', abo: '0', total: '500K' },
                    { m: 'M3', gmv: '50M', comm: '2.5M', abo: '500K', total: '3M' },
                    { m: 'M6', gmv: '200M', comm: '10M', abo: '2M', total: '12M' },
                    { m: 'M12', gmv: '1B', comm: '50M', abo: '10M', total: '60M' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2 font-medium">{row.m}</td>
                      <td className="text-right">{row.gmv} FCFA</td>
                      <td className="text-right">{row.comm} FCFA</td>
                      <td className="text-right">{row.abo} FCFA</td>
                      <td className="text-right font-bold text-primary">{row.total} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Section 5: 10 Questions */}
          <Section icon={HelpCircle} title="5. 10 Questions de Réflexion" className="page-break">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { q: 'Pourquoi maintenant ?', a: '80% des PME africaines évitent le B2B en ligne par peur de la fraude.' },
                { q: 'Pourquoi moi ?', a: 'Connaissance terrain + expertise tech + réseau local.' },
                { q: 'Unfair advantage ?', a: 'Premier Escrow + Triple validation + Logistique trackée en Afrique francophone.' },
                { q: 'Si un concurrent copie ?', a: 'Réseau vendeurs vérifiés et réputation = notre moat.' },
                { q: 'Plus gros risque ?', a: 'Adoption lente. Solution : agents terrain + Beta gratuite.' },
                { q: 'Comment scaler ?', a: 'Automatisation max + partenaires logistiques.' },
                { q: 'Métrique clé ?', a: 'GMV et taux de completion des transactions.' },
                { q: 'Quand pivoter ?', a: 'Si < 100 tx/mois après 6 mois avec 500+ vendeurs.' },
                { q: "C'est quoi gagner ?", a: "10% du marché B2B Afrique de l'Ouest = 100M€ GMV/an." },
                { q: 'Prêt pour 10 ans ?', a: 'Oui. Ce problème mérite une solution durable.' },
              ].map((item, i) => (
                <Card key={i} className="bg-muted/30">
                  <CardContent className="p-4">
                    <p className="font-semibold text-primary mb-1">{i + 1}. {item.q}</p>
                    <p className="text-sm">{item.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>

          {/* Section 6: 21 Actifs */}
          <Section icon={CheckCircle2} title="6. 21 Actifs Stratégiques Validés" className="page-break">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Produit (7/7)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    'Marketplace fonctionnelle',
                    'Système Escrow intégré',
                    'Triple validation',
                    'Dashboard vendeur',
                    'Tracking GPS',
                    'Messagerie intégrée',
                    'Intégration Paystack',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {item}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Contenu (7/7)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    'Landing page SEO',
                    'Page "Pour vendeurs"',
                    'Blog SEO',
                    'FAQ complète',
                    'CGU & mentions légales',
                    'Vidéo démo',
                    'Pitch deck',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {item}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Tech & Sécurité (7/7)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    'Auth sécurisée (Supabase)',
                    'RLS sur toutes tables',
                    'HTTPS + headers sécurité',
                    'Architecture scalable',
                    'Notifications temps réel',
                    'Multi-rôles',
                    'Dashboard admin',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {item}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* Footer */}
          <Separator className="my-8" />
          <div className="text-center text-sm text-muted-foreground pb-8">
            <p><strong>Document généré le :</strong> {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="mt-2">BokaTrade — Le commerce B2B sécurisé en Afrique</p>
            <p>support@bokatrade.com | bokatrade.com</p>
          </div>

        </div>
      </div>
    </>
  );
};

// Section Component
const Section = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  children, 
  className = '' 
}: { 
  icon: any; 
  title: string; 
  subtitle?: string; 
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={`mb-12 ${className}`}>
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
    {children}
  </section>
);

// Metric Card Component
const MetricCard = ({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: any; 
  label: string; 
  value: number;
  color: string;
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}/20`}>
          <Icon className={`h-5 w-5 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default FounderDossier;
