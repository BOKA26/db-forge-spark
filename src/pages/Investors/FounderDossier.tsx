import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, Brain, LayoutGrid, Map, Wallet, HelpCircle, 
  BarChart3, CheckCircle2, Users, Star, TrendingUp, 
  Shield, Target, Clock, Zap, ArrowRight
} from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';

const FounderDossier = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = () => {
    window.print();
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
                { q: 'C\'est quoi gagner ?', a: '10% du marché B2B Afrique de l\'Ouest = 100M€ GMV/an.' },
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

          {/* Section 6: Analyse Lancement */}
          <Section icon={BarChart3} title="6. Analyse du Lancement (J15)">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">KPI</th>
                    <th className="text-center py-2">Objectif J15</th>
                    <th className="text-center py-2">Réalisé</th>
                    <th className="text-center py-2">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { kpi: 'Visiteurs uniques', obj: '1,000', real: 'TBD' },
                    { kpi: 'Inscriptions', obj: '200', real: 'TBD' },
                    { kpi: 'Vendeurs inscrits', obj: '30', real: 'TBD' },
                    { kpi: 'Produits listés', obj: '100', real: 'TBD' },
                    { kpi: 'Premières commandes', obj: '5', real: 'TBD' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2 font-medium">{row.kpi}</td>
                      <td className="text-center">{row.obj}</td>
                      <td className="text-center">{row.real}</td>
                      <td className="text-center">🔄</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Section 7: 21 Actifs */}
          <Section icon={CheckCircle2} title="7. 21 Actifs Stratégiques Validés" className="page-break">
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

          {/* Section 8: Utilisateurs */}
          <Section icon={Users} title="8. Utilisateurs">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Répartition actuelle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { role: 'Acheteurs', count: 'TBD', color: 'bg-blue-500' },
                      { role: 'Vendeurs', count: 'TBD', color: 'bg-green-500' },
                      { role: 'Livreurs', count: 'TBD', color: 'bg-amber-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          <span>{item.role}</span>
                        </div>
                        <span className="font-semibold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Objectifs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { j: 'J30', target: '500 utilisateurs' },
                      { j: 'J90', target: '2,000 utilisateurs' },
                      { j: 'J180', target: '10,000 utilisateurs' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <Badge variant="outline">{item.j}</Badge>
                        <span className="font-semibold">{item.target}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* Section 9: Preuves Sociales */}
          <Section icon={Star} title="9. Preuves Sociales">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Témoignages</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <p className="italic text-sm mb-2">"Avant BokaTrade, j'avais peur de vendre en ligne. Maintenant mes fonds sont sécurisés."</p>
                      <p className="text-xs text-muted-foreground">— Vendeur Beta, Abidjan</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <p className="italic text-sm mb-2">"La triple validation m'a convaincu de passer ma première commande B2B en ligne."</p>
                      <p className="text-xs text-muted-foreground">— Acheteur Beta, Dakar</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Badges de confiance</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    '🔒 Escrow 100% sécurisé',
                    '✅ Vendeurs vérifiés',
                    '📍 Livraison trackée',
                    '🏆 Beta 0% commission',
                  ].map((badge, i) => (
                    <Badge key={i} variant="secondary" className="text-sm py-1 px-3">{badge}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Section 10: KPIs */}
          <Section icon={TrendingUp} title="10. KPIs du Lancement" className="page-break">
            <Card className="bg-primary/5 border-primary/20 mb-6">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">North Star Metric</p>
                <p className="text-2xl font-bold text-primary">GMV mensuel sécurisé par Escrow</p>
                <p className="mt-2">Objectif M1 : <span className="font-bold">10 millions FCFA</span></p>
              </CardContent>
            </Card>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Catégorie</th>
                    <th className="text-left py-2">Métrique</th>
                    <th className="text-center py-2">J1</th>
                    <th className="text-center py-2">J7</th>
                    <th className="text-center py-2">J15</th>
                    <th className="text-center py-2">J30</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { cat: 'Acquisition', met: 'Visiteurs' },
                    { cat: '', met: 'Inscriptions' },
                    { cat: 'Activation', met: 'Vendeurs actifs' },
                    { cat: '', met: 'Produits listés' },
                    { cat: 'Revenus', met: 'GMV' },
                    { cat: '', met: 'Transactions' },
                    { cat: 'Rétention', met: 'Retour J7' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2 font-medium">{row.cat}</td>
                      <td className="py-2">{row.met}</td>
                      <td className="text-center">-</td>
                      <td className="text-center">-</td>
                      <td className="text-center">-</td>
                      <td className="text-center">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

export default FounderDossier;
