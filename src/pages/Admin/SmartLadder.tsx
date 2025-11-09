import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, Store, Package, DollarSign, Target } from "lucide-react";

const SmartLadder = () => {
  const phases = [
    {
      phase: "Phase 1: Lancement",
      period: "0-3 mois",
      status: "en_cours",
      progress: 65,
      color: "bg-blue-500",
      objectives: [
        {
          category: "Utilisateurs",
          icon: Users,
          specific: "Atteindre 100 utilisateurs inscrits",
          measurable: "100 comptes créés sur la plateforme",
          achievable: "Via campagne marketing locale et bouche-à-oreille",
          relevant: "Base utilisateurs initiale pour valider le concept",
          timeBound: "Mois 1-3",
          current: 65,
          target: 100,
        },
        {
          category: "Boutiques",
          icon: Store,
          specific: "Onboarder 10 boutiques actives",
          measurable: "10 boutiques validées avec minimum 5 produits chacune",
          achievable: "Démarchage direct auprès des commerçants locaux",
          relevant: "Offre minimale pour attirer des acheteurs",
          timeBound: "Mois 1-3",
          current: 7,
          target: 10,
        },
        {
          category: "Transactions",
          icon: DollarSign,
          specific: "Générer 50 transactions réussies",
          measurable: "50 commandes livrées et payées",
          achievable: "Avec 10 boutiques et 100 utilisateurs actifs",
          relevant: "Prouver la viabilité du modèle économique",
          timeBound: "Mois 2-3",
          current: 32,
          target: 50,
        },
      ],
    },
    {
      phase: "Phase 2: Croissance Initiale",
      period: "3-6 mois",
      status: "planifie",
      progress: 0,
      color: "bg-green-500",
      objectives: [
        {
          category: "Utilisateurs",
          icon: Users,
          specific: "Atteindre 500 utilisateurs actifs",
          measurable: "500 comptes avec au moins 1 transaction",
          achievable: "Marketing digital ciblé + programme de parrainage",
          relevant: "Masse critique pour rentabilité",
          timeBound: "Mois 4-6",
          current: 0,
          target: 500,
        },
        {
          category: "Boutiques",
          icon: Store,
          specific: "Atteindre 50 boutiques vérifiées",
          measurable: "50 boutiques avec ventes régulières (min 10/mois)",
          achievable: "Extension à d'autres quartiers/villes",
          relevant: "Diversification de l'offre produits",
          timeBound: "Mois 4-6",
          current: 0,
          target: 50,
        },
        {
          category: "GMV",
          icon: TrendingUp,
          specific: "Atteindre 1M FCFA de GMV mensuel",
          measurable: "Volume total de transactions: 1 000 000 FCFA/mois",
          achievable: "Avec 50 boutiques et 500 utilisateurs actifs",
          relevant: "Preuve de traction commerciale",
          timeBound: "Mois 6",
          current: 0,
          target: 1000000,
        },
      ],
    },
    {
      phase: "Phase 3: Expansion",
      period: "6-12 mois",
      status: "planifie",
      progress: 0,
      color: "bg-purple-500",
      objectives: [
        {
          category: "Utilisateurs",
          icon: Users,
          specific: "Atteindre 2000 utilisateurs actifs",
          measurable: "2000 comptes avec transactions récurrentes",
          achievable: "Expansion géographique + partenariats",
          relevant: "Scale nécessaire pour levée de fonds",
          timeBound: "Mois 7-12",
          current: 0,
          target: 2000,
        },
        {
          category: "Boutiques",
          icon: Store,
          specific: "Atteindre 200 boutiques multi-catégories",
          measurable: "200 boutiques couvrant 10+ catégories",
          achievable: "Programme d'ambassadeurs vendeurs",
          relevant: "Marketplace complète et attractive",
          timeBound: "Mois 7-12",
          current: 0,
          target: 200,
        },
        {
          category: "GMV",
          icon: TrendingUp,
          specific: "Atteindre 5M FCFA de GMV mensuel",
          measurable: "Volume mensuel de 5 000 000 FCFA",
          achievable: "Croissance naturelle + marketing",
          relevant: "Rentabilité opérationnelle",
          timeBound: "Mois 12",
          current: 0,
          target: 5000000,
        },
        {
          category: "Livreurs",
          icon: Package,
          specific: "Constituer un réseau de 50 livreurs actifs",
          measurable: "50 livreurs avec min 20 livraisons/mois",
          achievable: "Recrutement et formation continue",
          relevant: "Garantir délais de livraison",
          timeBound: "Mois 9-12",
          current: 0,
          target: 50,
        },
      ],
    },
    {
      phase: "Phase 4: Maturité",
      period: "12-24 mois",
      status: "planifie",
      progress: 0,
      color: "bg-orange-500",
      objectives: [
        {
          category: "Utilisateurs",
          icon: Users,
          specific: "Atteindre 10 000 utilisateurs actifs",
          measurable: "10 000 comptes avec achats mensuels",
          achievable: "Présence multi-villes + marketing national",
          relevant: "Leader du marché e-commerce local",
          timeBound: "Mois 13-24",
          current: 0,
          target: 10000,
        },
        {
          category: "Boutiques",
          icon: Store,
          specific: "Atteindre 1000 boutiques vérifiées",
          measurable: "1000 boutiques actives toutes catégories",
          achievable: "Expansion nationale + API pour intégration",
          relevant: "Écosystème e-commerce complet",
          timeBound: "Mois 13-24",
          current: 0,
          target: 1000,
        },
        {
          category: "GMV",
          icon: TrendingUp,
          specific: "Atteindre 20M FCFA de GMV mensuel",
          measurable: "Volume mensuel de 20 000 000 FCFA",
          achievable: "Économies d'échelle + efficacité opérationnelle",
          relevant: "Profitabilité et attractivité investisseurs",
          timeBound: "Mois 24",
          current: 0,
          target: 20000000,
        },
        {
          category: "Break-even",
          icon: Target,
          specific: "Atteindre le seuil de rentabilité",
          measurable: "Revenus mensuels ≥ Coûts mensuels",
          achievable: "Optimisation coûts + volume critique",
          relevant: "Viabilité long terme et autonomie financière",
          timeBound: "Mois 18-24",
          current: 0,
          target: 100,
        },
      ],
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "en_cours":
        return <Badge className="bg-blue-500">En cours</Badge>;
      case "planifie":
        return <Badge variant="outline">Planifié</Badge>;
      default:
        return <Badge variant="secondary">À venir</Badge>;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            SMART Ladder - BokaTrade
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Plan de croissance stratégique sur 24 mois avec des objectifs Spécifiques, Mesurables, 
            Atteignables, Réalistes et Temporellement définis
          </p>
        </div>

        {/* Phases */}
        <div className="space-y-8">
          {phases.map((phase, phaseIdx) => (
            <Card key={phaseIdx} className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${phase.color}`} />
                      {phase.phase}
                    </CardTitle>
                    <CardDescription className="text-base mt-1">{phase.period}</CardDescription>
                  </div>
                  {getStatusBadge(phase.status)}
                </div>
                {phase.status === "en_cours" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progression globale</span>
                      <span className="font-semibold">{phase.progress}%</span>
                    </div>
                    <Progress value={phase.progress} className="h-2" />
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {phase.objectives.map((obj, objIdx) => {
                    const Icon = obj.icon;
                    const progressPercent = (obj.current / obj.target) * 100;

                    return (
                      <Card key={objIdx} className="bg-muted/30">
                        <CardHeader className="pb-3">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${phase.color} bg-opacity-10`}>
                              <Icon className={`w-5 h-5 ${phase.color.replace('bg-', 'text-')}`} />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg">{obj.category}</CardTitle>
                              <CardDescription className="text-sm mt-1">
                                {obj.specific}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          {/* Progress */}
                          {phase.status === "en_cours" && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {formatNumber(obj.current)} / {formatNumber(obj.target)}
                                </span>
                                <span className="font-medium">{Math.round(progressPercent)}%</span>
                              </div>
                              <Progress value={progressPercent} className="h-1.5" />
                            </div>
                          )}

                          {/* SMART Details */}
                          <div className="space-y-2 text-sm pt-2 border-t">
                            <div>
                              <span className="font-semibold text-primary">M</span>
                              <span className="text-muted-foreground">: {obj.measurable}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-green-600">A</span>
                              <span className="text-muted-foreground">: {obj.achievable}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-purple-600">R</span>
                              <span className="text-muted-foreground">: {obj.relevant}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-orange-600">T</span>
                              <span className="text-muted-foreground">: {obj.timeBound}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <Card className="mt-12 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Résumé Exécutif</CardTitle>
            <CardDescription>Vision globale sur 24 mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-3xl font-bold text-blue-600">10K</div>
                <div className="text-sm text-muted-foreground">Utilisateurs cibles</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <Store className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-3xl font-bold text-green-600">1000</div>
                <div className="text-sm text-muted-foreground">Boutiques actives</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-3xl font-bold text-purple-600">20M</div>
                <div className="text-sm text-muted-foreground">GMV mensuel (FCFA)</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <Target className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <div className="text-3xl font-bold text-orange-600">M18-24</div>
                <div className="text-sm text-muted-foreground">Break-even prévu</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SmartLadder;
