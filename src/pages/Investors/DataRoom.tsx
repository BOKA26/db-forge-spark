import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  FileText,
  Download,
  TrendingUp,
  Users,
  Store,
  DollarSign,
  Shield,
  Code,
  Target,
  Lock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  BarChart3,
} from "lucide-react";

const DataRoom = () => {
  const [accessGranted] = useState(true); // TODO: Implement proper access control

  // Métriques en temps réel
  const metrics = {
    users: { current: 127, target: 500, label: "Vendeurs Beta" },
    buyers: { current: 340, target: 1000, label: "Acheteurs inscrits" },
    gmv: { current: 450000, target: 1000000, label: "GMV (FCFA)" },
    transactions: { current: 23, target: 100, label: "Transactions" },
  };

  // Documents organisés par catégorie
  const documents = {
    legal: [
      { name: "Statuts de la société", type: "PDF", size: "450 KB", status: "available", link: "/cgu" },
      { name: "CGU & Conditions Générales", type: "PDF", size: "280 KB", status: "available", link: "/cgu" },
      { name: "Politique de confidentialité", type: "PDF", size: "320 KB", status: "available", link: "/politique-confidentialite" },
      { name: "Mentions légales", type: "PDF", size: "180 KB", status: "available", link: "/mentions-legales" },
      { name: "Déclaration ARTCI (Data Protection)", type: "PDF", size: "520 KB", status: "pending" },
      { name: "Contrats types (Vendeurs/Livreurs)", type: "PDF", size: "380 KB", status: "available" },
    ],
    financial: [
      { name: "Pitch Deck Investisseurs (12 slides)", type: "PDF", size: "2.4 MB", status: "available" },
      { name: "Projections financières 36 mois", type: "Excel", size: "180 KB", status: "available" },
      { name: "Unit Economics & KPIs", type: "PDF", size: "420 KB", status: "available" },
      { name: "Cap Table actuelle", type: "PDF", size: "120 KB", status: "confidential" },
      { name: "Termes de la levée Seed ($300K)", type: "PDF", size: "280 KB", status: "confidential" },
      { name: "Budget détaillé 12 mois", type: "Excel", size: "220 KB", status: "available" },
    ],
    technical: [
      { name: "Architecture technique", type: "PDF", size: "1.2 MB", status: "available" },
      { name: "Schéma base de données Supabase", type: "PNG", size: "850 KB", status: "available" },
      { name: "Roadmap produit 24 mois", type: "PDF", size: "680 KB", status: "available" },
      { name: "Stack technologique détaillée", type: "PDF", size: "320 KB", status: "available" },
      { name: "Rapport de sécurité & GDPR/ARTCI", type: "PDF", size: "1.5 MB", status: "available" },
      { name: "API Documentation (pour intégrations)", type: "PDF", size: "920 KB", status: "development" },
    ],
    business: [
      { name: "Analyse du marché TAM/SAM/SOM", type: "PDF", size: "1.8 MB", status: "available" },
      { name: "Analyse concurrentielle détaillée", type: "PDF", size: "1.2 MB", status: "available" },
      { name: "Stratégie Go-To-Market 24 mois", type: "PDF", size: "920 KB", status: "available" },
      { name: "Plan marketing & acquisition", type: "PDF", size: "780 KB", status: "available" },
      { name: "Partenariats signés & pipeline", type: "PDF", size: "450 KB", status: "confidential" },
      { name: "Témoignages clients & case studies", type: "PDF", size: "680 KB", status: "development" },
    ],
    team: [
      { name: "CVs fondateurs & équipe", type: "PDF", size: "2.1 MB", status: "confidential" },
      { name: "Organigramme & plan de recrutement", type: "PDF", size: "320 KB", status: "available" },
      { name: "Pacte d'associés", type: "PDF", size: "420 KB", status: "confidential" },
      { name: "Advisory Board & références", type: "PDF", size: "280 KB", status: "available" },
      { name: "Culture d'entreprise & valeurs", type: "PDF", size: "520 KB", status: "available" },
    ],
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Disponible</Badge>;
      case "confidential":
        return <Badge variant="secondary"><Lock className="w-3 h-3 mr-1" />Confidentiel</Badge>;
      case "pending":
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />En cours</Badge>;
      case "development":
        return <Badge variant="outline"><Code className="w-3 h-3 mr-1" />En dev</Badge>;
      default:
        return null;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toLocaleString();
  };

  if (!accessGranted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <CardTitle>Accès restreint</CardTitle>
              <CardDescription>
                Cette Data Room est réservée aux investisseurs invités.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Demander un accès
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Data Room Investisseurs
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Accès sécurisé à tous les documents juridiques, financiers et stratégiques de BokaTrade.
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
          <div className="flex items-center gap-2 mt-4">
            <Badge className="bg-green-500">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Due Diligence Ready
            </Badge>
            <Badge variant="outline">
              <Calendar className="w-3 h-3 mr-1" />
              Levée Seed en cours
            </Badge>
          </div>
        </div>

        {/* Métriques de traction */}
        <Card className="mb-8 border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <CardTitle>Métriques de traction (Live)</CardTitle>
            </div>
            <CardDescription>Données actualisées en temps réel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(metrics).map(([key, metric]) => {
                const progress = (metric.current / metric.target) * 100;
                const icons = {
                  users: Store,
                  buyers: Users,
                  gmv: DollarSign,
                  transactions: TrendingUp,
                };
                const Icon = icons[key as keyof typeof icons];

                return (
                  <div key={key} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">
                        {metric.label}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{formatNumber(metric.current)}</span>
                        <span className="text-sm text-muted-foreground">/ {formatNumber(metric.target)}</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <span className="text-xs text-muted-foreground">{Math.round(progress)}% de l'objectif</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Documents par catégorie */}
        <Tabs defaultValue="financial" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="financial">
              <DollarSign className="w-4 h-4 mr-2" />
              Financier
            </TabsTrigger>
            <TabsTrigger value="legal">
              <FileText className="w-4 h-4 mr-2" />
              Juridique
            </TabsTrigger>
            <TabsTrigger value="technical">
              <Code className="w-4 h-4 mr-2" />
              Technique
            </TabsTrigger>
            <TabsTrigger value="business">
              <Target className="w-4 h-4 mr-2" />
              Business
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="w-4 h-4 mr-2" />
              Équipe
            </TabsTrigger>
          </TabsList>

          {Object.entries(documents).map(([category, docs]) => (
            <TabsContent key={category} value={category}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Documents {category === 'financial' ? 'Financiers' :
                                category === 'legal' ? 'Juridiques' :
                                category === 'technical' ? 'Techniques' :
                                category === 'business' ? 'Business' : 'Équipe'}
                  </CardTitle>
                  <CardDescription>
                    {docs.filter(d => d.status === 'available').length} documents disponibles
                    sur {docs.length}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {docs.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium">{doc.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {doc.type} • {doc.size}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(doc.status)}
                          {doc.status === 'available' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => doc.link && window.open(doc.link, '_blank')}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* FAQ Investisseurs */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>FAQ Investisseurs</CardTitle>
            <CardDescription>Questions fréquentes des investisseurs potentiels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                q: "Quelle est la taille de la levée et les conditions ?",
                a: "Nous levons $300,000 en Seed pour 15% du capital (valorisation post-money de $2M). Détails complets dans le document 'Termes de la levée'."
              },
              {
                q: "Quel est le modèle de revenus ?",
                a: "4 sources : Commission 5% sur GMV (70%), Abonnements Premium vendeurs (15%), Services additionnels (10%), Frais de paiement (5%)."
              },
              {
                q: "Quels sont vos principaux KPIs actuels ?",
                a: "127 vendeurs beta inscrits, 340 acheteurs, 23 transactions complétées, GMV de 450K FCFA. Croissance +45% MoM."
              },
              {
                q: "Conformité GDPR/ARTCI ?",
                a: "100% conforme. RLS activé sur toutes les tables, déclaration ARTCI en cours, bannière cookies conforme, export de données implémenté."
              },
              {
                q: "Quelle est votre stratégie de sortie ?",
                a: "Acquisition stratégique (Jumia, Glovo, Yango) ou IPO locale après 5-7 ans. Comparables: Jumia valorisé à $400M, Konga à $150M."
              },
              {
                q: "Protection intellectuelle ?",
                a: "Triple Validation™ en cours de dépôt de brevet. Code propriétaire, base de données clients, algorithme de matching vendeurs-livreurs."
              },
            ].map((faq, idx) => (
              <div key={idx} className="border-b pb-4 last:border-0">
                <h4 className="font-semibold mb-2">{faq.q}</h4>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="mt-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold">Questions sur cette Data Room ?</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Nous sommes disponibles pour toute question complémentaire ou pour organiser 
                une présentation détaillée avec l'équipe fondatrice.
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg">
                  Planifier un appel
                </Button>
                <Button size="lg" variant="outline">
                  Contacter l'équipe
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default DataRoom;
