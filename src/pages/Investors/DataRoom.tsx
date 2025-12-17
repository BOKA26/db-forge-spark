import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Download, Lock, TrendingUp, Shield, 
  Rocket, Search, Database, CheckCircle2, AlertCircle,
  FileCheck, Globe, Briefcase, Users, Target
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

const DataRoom = () => {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const stats = [
    { label: "Beta Sellers", value: "120+", icon: Users },
    { label: "Acheteurs Inscrits", value: "350+", icon: Target },
    { label: "GMV", value: "2.5M FCFA", icon: TrendingUp },
    { label: "Transactions", value: "180+", icon: Briefcase },
  ];

  const documents = {
    technique: [
      { 
        id: "launch-checklist",
        name: "Launch Day Checklist", 
        icon: Rocket, 
        status: "Complet",
        description: "Checklist complète de lancement de la plateforme"
      },
      { 
        id: "seo-strategy",
        name: "Stratégie SEO (90 jours)", 
        icon: Search, 
        status: "En cours",
        description: "Plan d'optimisation SEO et Google Search Console"
      },
      { 
        id: "security-gdpr",
        name: "Sécurité & GDPR/ARTCI", 
        icon: Shield, 
        status: "Complet",
        description: "Guide de conformité et sécurité technique"
      },
      { 
        id: "database-schema",
        name: "Architecture Base de Données", 
        icon: Database, 
        status: "Disponible",
        description: "Schéma complet et documentation technique"
      },
    ],
    business: [
      { 
        id: "pitch-deck",
        name: "Pitch Deck Investisseur", 
        icon: Briefcase, 
        status: "Disponible",
        description: "Présentation complète de BokaTrade"
      },
      { 
        id: "market-analysis",
        name: "Analyse de Marché", 
        icon: Globe, 
        status: "Disponible",
        description: "TAM/SAM/SOM et opportunités"
      },
    ],
    legal: [
      { 
        id: "terms",
        name: "Conditions Générales", 
        icon: FileCheck, 
        status: "Disponible",
        description: "CGU et CGV de la plateforme"
      },
      { 
        id: "privacy",
        name: "Politique de Confidentialité", 
        icon: Lock, 
        status: "Disponible",
        description: "Conformité GDPR/ARTCI"
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="secondary">
            <Lock className="w-3 h-3 mr-1" />
            Accès Investisseurs
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Data Room BokaTrade
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Documentation technique et business complète pour investisseurs
          </p>
        </div>

        {/* Live Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="pt-6">
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Documents */}
        <Tabs defaultValue="technique" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="technique">
              <Database className="w-4 h-4 mr-2" />
              Technique
            </TabsTrigger>
            <TabsTrigger value="business">
              <TrendingUp className="w-4 h-4 mr-2" />
              Business
            </TabsTrigger>
            <TabsTrigger value="legal">
              <Shield className="w-4 h-4 mr-2" />
              Légal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="technique" className="space-y-4">
            {documents.technique.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedDoc(doc.id)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <doc.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{doc.name}</CardTitle>
                        <CardDescription>{doc.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {doc.status === "Complet" && <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" />}
                      {doc.status === "En cours" && <AlertCircle className="w-3 h-3 mr-1 text-yellow-500" />}
                      {doc.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Consulter le document
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            {documents.business.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedDoc(doc.id)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <doc.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{doc.name}</CardTitle>
                        <CardDescription>{doc.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">{doc.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Consulter le document
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="legal" className="space-y-4">
            {documents.legal.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedDoc(doc.id)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <doc.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{doc.name}</CardTitle>
                        <CardDescription>{doc.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">{doc.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Consulter le document
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Document Viewer */}
        {selectedDoc && (
          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Contenu du Document</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDoc(null)}>
                  Fermer
                </Button>
              </div>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              {selectedDoc === "launch-checklist" && <LaunchChecklistContent />}
              {selectedDoc === "seo-strategy" && <SEOStrategyContent />}
              {selectedDoc === "security-gdpr" && <SecurityGDPRContent />}
              {selectedDoc === "database-schema" && <DatabaseSchemaContent />}
              {selectedDoc === "pitch-deck" && <PitchDeckContent />}
            </CardContent>
          </Card>
        )}

        {/* FAQ */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Questions Fréquentes</CardTitle>
            <CardDescription>Réponses aux questions des investisseurs</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Comment BokaTrade génère des revenus ?</AccordionTrigger>
                <AccordionContent>
                  Commission de 7% sur chaque transaction + Services premium vendeurs (mise en avant, analytics avancés)
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Quelle est la proposition de valeur unique ?</AccordionTrigger>
                <AccordionContent>
                  Premier système Escrow à triple validation en Afrique garantissant la sécurité des transactions B2B
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Quels sont les prochains marchés cibles ?</AccordionTrigger>
                <AccordionContent>
                  Phase 1: Togo / Phase 2: Bénin, Burkina Faso / Phase 3: Toute l'Afrique de l'Ouest
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="mt-12 text-center space-y-4">
          <h2 className="text-2xl font-bold">Prêt à investir dans l'avenir du B2B africain ?</h2>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => setSelectedDoc('pitch-deck')}>
              <Download className="w-5 h-5 mr-2" />
              Télécharger le Deck Complet
            </Button>
            <Button size="lg" variant="outline">
              Planifier un Appel
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Document Content Components
const LaunchChecklistContent = () => (
  <div className="prose prose-sm max-w-none dark:prose-invert">
    <h2 className="text-2xl font-bold mb-4">📋 LAUNCH DAY CHECKLIST - BokaTrade</h2>
    <Separator className="my-4" />
    
    <h3 className="text-xl font-semibold mt-6 mb-3">🔐 1. SÉCURITÉ & AUTHENTIFICATION</h3>
    <h4 className="text-lg font-semibold mt-4 mb-2">Base de données Supabase</h4>
    <ul className="list-disc pl-6 space-y-1">
      <li>✅ RLS (Row Level Security) activé sur toutes les tables critiques</li>
      <li>✅ Tables users - accès restreint par utilisateur</li>
      <li>✅ Tables orders - visibilité selon rôle (acheteur/vendeur/livreur)</li>
      <li>✅ Tables payments - accès ultra-restreint</li>
      <li>✅ Politiques RLS configurées pour chaque rôle</li>
      <li>✅ Secrets Supabase bien configurés</li>
    </ul>

    <h4 className="text-lg font-semibold mt-4 mb-2">Paiements</h4>
    <ul className="list-disc pl-6 space-y-1">
      <li>✅ Paystack API Keys (production) configurées comme secrets</li>
      <li>✅ Webhook Paystack testé en environnement de production</li>
      <li>✅ Signature verification activée dans le webhook</li>
      <li>✅ Gestion des erreurs de paiement implémentée</li>
    </ul>

    <h4 className="text-lg font-semibold mt-4 mb-2">Edge Functions</h4>
    <ul className="list-disc pl-6 space-y-1">
      <li>✅ paystack-initialize</li>
      <li>✅ paystack-webhook</li>
      <li>✅ secure-admin-register</li>
      <li>✅ validate-admin-code</li>
      <li>✅ assign-courier</li>
    </ul>

    <h3 className="text-xl font-semibold mt-6 mb-3">📊 2. BASE DE DONNÉES & DONNÉES</h3>
    <ul className="list-disc pl-6 space-y-1">
      <li>✅ Tables créées: users, profiles, shops, products, orders, payments, deliveries</li>
      <li>✅ courier_locations, notifications, inquiries, beta_sellers, contact_submissions</li>
      <li>✅ Index créés sur colonnes fréquemment interrogées</li>
      <li>✅ Backup automatique configuré</li>
    </ul>

    <h3 className="text-xl font-semibold mt-6 mb-3">🎨 3. INTERFACE UTILISATEUR</h3>
    <h4 className="text-lg font-semibold mt-4 mb-2">Pages publiques testées</h4>
    <ul className="list-disc pl-6 space-y-1">
      <li>✅ Page d'accueil (/) - chargement rapide, images optimisées</li>
      <li>✅ Liste produits (/produits) - pagination, filtres</li>
      <li>✅ Détail produit (/produit/:id)</li>
      <li>✅ Boutique publique (/boutique/:id)</li>
      <li>✅ Pages légales (mentions, CGV, confidentialité, à propos, contact)</li>
    </ul>

    <h3 className="text-xl font-semibold mt-6 mb-3">💳 6. PAIEMENTS & TRANSACTIONS</h3>
    <p className="mb-2">Flow de paiement complet:</p>
    <ol className="list-decimal pl-6 space-y-1">
      <li>Acheteur ajoute au panier</li>
      <li>Procède au paiement</li>
      <li>Paystack redirige</li>
      <li>Webhook reçoit confirmation</li>
      <li>Commande mise à jour</li>
      <li>Paiement enregistré en Escrow</li>
      <li>Livraison créée</li>
      <li>Notifications envoyées</li>
    </ol>
    <p className="mt-2">✅ Commission: 7%</p>

    <h3 className="text-xl font-semibold mt-6 mb-3">📊 MÉTRIQUES À SURVEILLER JOUR 1</h3>
    <ul className="list-disc pl-6 space-y-1">
      <li>✅ Nombre d'inscriptions (Objectif Phase 1: 100 acheteurs, 20 vendeurs)</li>
      <li>✅ Taux de conversion inscription → commande</li>
      <li>✅ Temps moyen de chargement des pages</li>
      <li>✅ Taux d'erreur (&lt; 1%)</li>
      <li>✅ Première transaction réussie 🎉</li>
    </ul>
  </div>
);

const SEOStrategyContent = () => (
  <div className="prose prose-sm max-w-none dark:prose-invert">
    <h2 className="text-2xl font-bold mb-4">📊 STRATÉGIE SEO (90 jours)</h2>
    <Separator className="my-4" />
    
    <h3 className="text-xl font-semibold mt-6 mb-3">🎯 SEMAINE 1 (Jours 1-7): Configuration Technique</h3>
    <h4 className="text-lg font-semibold mt-4 mb-2">Google Search Console & Analytics</h4>
    <ul className="list-disc pl-6 space-y-1">
      <li>Créer et vérifier compte Google Search Console</li>
      <li>Ajouter domaine principal (bokatrade.com)</li>
      <li>Configurer Google Analytics 4 (GA4)</li>
      <li>Installer tag gtag.js dans index.html</li>
      <li>Soumettre sitemap.xml</li>
    </ul>

    <h4 className="text-lg font-semibold mt-4 mb-2">Fichiers Techniques</h4>
    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /cart
Disallow: /api/
Sitemap: https://bokatrade.com/sitemap.xml`}
    </pre>

    <h3 className="text-xl font-semibold mt-6 mb-3">📈 SEMAINE 2-4 (Jours 8-30): Optimisation On-Page</h3>
    <h4 className="text-lg font-semibold mt-4 mb-2">Meta Tags & Structured Data</h4>
    <p className="mb-2">Optimiser les meta tags pour chaque type de page:</p>
    <ul className="list-disc pl-6 space-y-1">
      <li><strong>Page d'accueil:</strong> "BokaTrade - Marketplace de Confiance au Togo"</li>
      <li><strong>Pages produits:</strong> "Nom produit - Prix FCFA | BokaTrade"</li>
      <li><strong>Pages boutiques:</strong> "Nom boutique - Boutique Officielle | BokaTrade"</li>
    </ul>

    <h4 className="text-lg font-semibold mt-4 mb-2">Schema.org structured data</h4>
    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Nom du produit",
  "offers": {
    "@type": "Offer",
    "price": "10000",
    "priceCurrency": "XOF",
    "availability": "https://schema.org/InStock"
  }
}`}
    </pre>

    <h3 className="text-xl font-semibold mt-6 mb-3">🚀 SEMAINE 5-8 (Jours 31-60): Contenu & Autorité</h3>
    <ul className="list-disc pl-6 space-y-1">
      <li>Créer pages catégories optimisées</li>
      <li>Blog / Centre d'aide SEO</li>
      <li>Google My Business</li>
      <li>Stratégie de backlinks</li>
    </ul>

    <h3 className="text-xl font-semibold mt-6 mb-3">🎯 KPIs à Suivre</h3>
    <ul className="list-disc pl-6 space-y-1">
      <li>Impressions: Objectif +50% en 90 jours</li>
      <li>Clics organiques: Objectif +100% en 90 jours</li>
      <li>CTR moyen: Objectif 3-5%</li>
      <li>Position moyenne: Top 10 pour mots-clés principaux</li>
    </ul>
  </div>
);

const SecurityGDPRContent = () => (
  <div className="prose prose-sm max-w-none dark:prose-invert">
    <h2 className="text-2xl font-bold mb-4">🔐 SÉCURITÉ & CONFORMITÉ (GDPR/ARTCI)</h2>
    <Separator className="my-4" />
    
    <h3 className="text-xl font-semibold mt-6 mb-3">📋 RÉSUMÉ EXÉCUTIF</h3>
    <p className="mb-2">Guide de mise en conformité BokaTrade avec:</p>
    <ul className="list-disc pl-6 space-y-1">
      <li>GDPR (Règlement Général sur la Protection des Données - Europe)</li>
      <li>ARTCI (Autorité de Régulation des Télécommunications/TIC - Côte d'Ivoire)</li>
      <li>Meilleures pratiques de sécurité pour plateforme B2B</li>
    </ul>

    <h3 className="text-xl font-semibold mt-6 mb-3">🎯 PHASE 1: CONFORMITÉ LÉGALE</h3>
    <h4 className="text-lg font-semibold mt-4 mb-2">Documents légaux obligatoires</h4>
    <Badge variant="outline" className="mr-2 mb-2">✅ Disponible</Badge>
    <ul className="list-disc pl-6 space-y-1">
      <li>Politique de Confidentialité (/politique-confidentialite)</li>
      <li>Conditions Générales d'Utilisation (/conditions-utilisation)</li>
      <li>Mentions Légales (/mentions-legales)</li>
    </ul>

    <h4 className="text-lg font-semibold mt-4 mb-2">Sections GDPR requises</h4>
    <ul className="list-disc pl-6 space-y-1">
      <li>Base légale du traitement (Article 6 GDPR)</li>
      <li>Durée de conservation précise</li>
      <li>Transferts internationaux</li>
      <li>Droits des utilisateurs (Art. 15-22)</li>
      <li>Contact DPO: dpo@bokatrade.com</li>
    </ul>

    <h3 className="text-xl font-semibold mt-6 mb-3">🔐 PHASE 2: SÉCURITÉ TECHNIQUE</h3>
    <h4 className="text-lg font-semibold mt-4 mb-2">Row Level Security (RLS)</h4>
    <Badge variant="destructive" className="mb-2">CRITIQUE</Badge>
    <p className="mt-2 mb-2">Vérifier que TOUTES les tables ont RLS activé:</p>
    <ul className="list-disc pl-6 space-y-1">
      <li>✅ users / profiles (données personnelles)</li>
      <li>✅ orders (transactions financières)</li>
      <li>✅ payments (informations bancaires)</li>
      <li>✅ deliveries (données de localisation)</li>
      <li>✅ shops (informations commerciales)</li>
      <li>✅ user_roles (privilèges)</li>
    </ul>

    <h4 className="text-lg font-semibold mt-4 mb-2">Gestion des secrets</h4>
    <div className="bg-destructive/10 p-4 rounded-lg my-4">
      <p className="font-semibold mb-2">⚠️ À NE JAMAIS mettre dans le code:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>❌ Clés API privées</li>
        <li>❌ Tokens d'accès</li>
        <li>❌ Mots de passe</li>
        <li>❌ Clés de chiffrement</li>
      </ul>
    </div>

    <h3 className="text-xl font-semibold mt-6 mb-3">💰 BUDGET ESTIMÉ</h3>
    <ul className="list-disc pl-6 space-y-1">
      <li>Conseil juridique GDPR/ARTCI: 500 000 - 1 000 000 FCFA</li>
      <li>Déclaration ARTCI: 50 000 - 100 000 FCFA</li>
      <li>Audit sécurité externe: 1 000 000 - 2 000 000 FCFA</li>
      <li>Développement features GDPR: 10-15 jours dev</li>
    </ul>
    <p className="mt-2"><strong>TOTAL ESTIMÉ: 2 500 000 - 4 000 000 FCFA</strong></p>
  </div>
);

const DatabaseSchemaContent = () => (
  <div className="prose prose-sm max-w-none dark:prose-invert">
    <h2 className="text-2xl font-bold mb-4">🗄️ ARCHITECTURE BASE DE DONNÉES</h2>
    <Separator className="my-4" />
    
    <h3 className="text-xl font-semibold mt-6 mb-3">🔑 Tables Principales</h3>
    
    <h4 className="text-lg font-semibold mt-4 mb-2">👥 Utilisateurs & Authentification</h4>
    <ul className="list-disc pl-6 space-y-1">
      <li><code>auth.users</code> (Supabase Auth) → <code>users</code> → <code>user_roles</code> → <code>profiles</code></li>
      <li>Système multi-rôles avec <code>app_role</code> enum: admin, acheteur, vendeur, livreur</li>
    </ul>

    <h4 className="text-lg font-semibold mt-4 mb-2">🏪 Commerce</h4>
    <ul className="list-disc pl-6 space-y-1">
      <li><code>shops</code> - Boutiques vendeurs</li>
      <li><code>products</code> - Produits avec prix paliers, couleurs, tailles</li>
      <li><code>orders</code> - Commandes avec statut workflow</li>
    </ul>

    <h4 className="text-lg font-semibold mt-4 mb-2">💰 Paiement & Livraison</h4>
    <ul className="list-disc pl-6 space-y-1">
      <li><code>payments</code> - Paiements Paystack avec escrow</li>
      <li><code>deliveries</code> - Livraisons avec tracking</li>
      <li><code>validations</code> - Triple validation: acheteur ✓ vendeur ✓ livreur ✓</li>
      <li><code>courier_locations</code> - Géolocalisation en temps réel</li>
    </ul>

    <h3 className="text-xl font-semibold mt-6 mb-3">🔐 Sécurité RLS</h3>
    <Badge variant="outline" className="mb-4">✅ Toutes les tables ont RLS activé</Badge>
    
    <div className="space-y-2">
      <div className="bg-muted p-3 rounded">
        <strong>users:</strong> Propre profil + admin
      </div>
      <div className="bg-muted p-3 rounded">
        <strong>orders:</strong> Parties impliquées (acheteur/vendeur/livreur)
      </div>
      <div className="bg-muted p-3 rounded">
        <strong>payments:</strong> Lecture par parties, écriture admin uniquement
      </div>
    </div>

    <h3 className="text-xl font-semibold mt-6 mb-3">🔄 Triggers & Fonctions</h3>
    <h4 className="text-lg font-semibold mt-4 mb-2">Triggers actifs:</h4>
    <ul className="list-disc pl-6 space-y-1">
      <li><code>handle_new_user()</code> → Création automatique dans users</li>
      <li><code>assign_default_buyer_role()</code> → Rôle acheteur par défaut</li>
      <li><code>unlock_payment_on_full_validation()</code> → Déblocage paiement</li>
    </ul>

    <h3 className="text-xl font-semibold mt-6 mb-3">🔑 Edge Functions</h3>
    <ul className="list-disc pl-6 space-y-1">
      <li><code>paystack-initialize</code> → Initialisation paiement</li>
      <li><code>paystack-webhook</code> → Webhook paiement</li>
      <li><code>assign-courier</code> → Assignation livreur automatique</li>
    </ul>
  </div>
);

const PitchDeckContent = () => (
  <div className="prose prose-sm max-w-none dark:prose-invert">
    <h2 className="text-2xl font-bold mb-4">🚀 PITCH DECK BOKATRADE</h2>
    <p className="text-lg font-semibold mb-4">La première marketplace B2B africaine avec Escrow intégré</p>
    <Separator className="my-4" />
    
    <h3 className="text-xl font-semibold mt-6 mb-3">SLIDE 1: PROBLÈME 🚨</h3>
    <p className="text-lg font-bold mb-3">Le B2B africain souffre d'un problème majeur de confiance</p>
    
    <h4 className="text-lg font-semibold mt-4 mb-2">3 blocages critiques:</h4>
    
    <div className="bg-destructive/10 p-4 rounded-lg my-4">
      <h5 className="font-semibold mb-2">💸 Risque d'impayé massif</h5>
      <ul className="list-disc pl-6 space-y-1">
        <li>67% des PME africaines rapportent des problèmes de paiement B2B</li>
        <li>Délai moyen de paiement: 90-120 jours (vs 30 jours en Europe)</li>
        <li>40% des transactions échouent par manque de garanties</li>
      </ul>
    </div>

    <h3 className="text-xl font-semibold mt-6 mb-3">SLIDE 2: SOLUTION ✅</h3>
    <p className="text-lg font-bold mb-3">BokaTrade: Marketplace B2B avec Escrow à triple validation</p>
    
    <div className="bg-primary/10 p-6 rounded-lg my-4">
      <h5 className="text-lg font-bold mb-2">🛡️ Système Escrow à Triple Validation™</h5>
      <p className="text-sm">
        Acheteur paie → Fonds bloqués → Vendeur expédie → Livreur valide → Acheteur confirme → Paiement libéré
      </p>
    </div>

    <h3 className="text-xl font-semibold mt-6 mb-3">SLIDE 3: MARCHÉ (TAM/SAM/SOM) 🌍</h3>
    
    <div className="space-y-4">
      <div className="bg-primary/20 p-4 rounded-lg">
        <h5 className="font-bold mb-2">TAM: $1,200 Mds</h5>
        <p className="text-sm">Marché B2B total Afrique subsaharienne</p>
      </div>

      <div className="bg-primary/15 p-4 rounded-lg">
        <h5 className="font-bold mb-2">SAM: $180 Mds</h5>
        <p className="text-sm">Afrique de l'Ouest francophone</p>
      </div>

      <div className="bg-primary/10 p-4 rounded-lg">
        <h5 className="font-bold mb-2">SOM: $2.5 Mds</h5>
        <p className="text-sm">Objectif 3-5 ans: Togo, Bénin, Burkina Faso</p>
      </div>
    </div>

    <h3 className="text-xl font-semibold mt-6 mb-3">📊 TRACTION</h3>
    <div className="grid grid-cols-2 gap-4 my-4">
      <div className="text-center p-4 bg-primary/10 rounded-lg">
        <div className="text-3xl font-bold text-primary">120+</div>
        <div className="text-sm">Beta Sellers</div>
      </div>
      <div className="text-center p-4 bg-primary/10 rounded-lg">
        <div className="text-3xl font-bold text-primary">350+</div>
        <div className="text-sm">Acheteurs</div>
      </div>
      <div className="text-center p-4 bg-primary/10 rounded-lg">
        <div className="text-3xl font-bold text-primary">2.5M</div>
        <div className="text-sm">GMV (FCFA)</div>
      </div>
      <div className="text-center p-4 bg-primary/10 rounded-lg">
        <div className="text-3xl font-bold text-primary">180+</div>
        <div className="text-sm">Transactions</div>
      </div>
    </div>
  </div>
);

export default DataRoom;
