import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, DollarSign, Smartphone, Headphones, 
  Package, TrendingUp, Award, Users, 
  CheckCircle, ArrowRight, Lock, Clock,
  Star, Zap
} from 'lucide-react';

const ForSellers = () => {
  // États pour calculateur
  const [revenuePerMonth, setRevenuePerMonth] = useState([5000000]);
  const [transactionsPerMonth, setTransactionsPerMonth] = useState([50]);
  const [currentCommission, setCurrentCommission] = useState([8]);
  
  // États pour le formulaire
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom_complet: '',
    email: '',
    telephone: '',
    nom_entreprise: '',
    secteur_activite: '',
    ca_mensuel_range: '',
    nombre_produits: '',
    ville: '',
    message: '',
    acceptTerms: false
  });

  // Calculs dynamiques
  const currentCost = (revenuePerMonth[0] * currentCommission[0]) / 100;
  const betaSavings = currentCost * 3;
  const postBetaCost = (revenuePerMonth[0] * 5) / 100;
  const postBetaSavings = currentCost - postBetaCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptTerms) {
      toast.error('Veuillez accepter les conditions générales');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('beta_sellers')
        .insert([{
          nom_complet: formData.nom_complet,
          email: formData.email,
          telephone: formData.telephone,
          nom_entreprise: formData.nom_entreprise,
          secteur_activite: formData.secteur_activite,
          ca_mensuel_range: formData.ca_mensuel_range,
          nombre_produits: parseInt(formData.nombre_produits) || null,
          ville: formData.ville,
          message: formData.message || null,
        }]);

      if (error) throw error;

      toast.success('🎉 Inscription enregistrée! Notre équipe vous contactera sous 24-48h.');
      
      // Reset form
      setFormData({
        nom_complet: '',
        email: '',
        telephone: '',
        nom_entreprise: '',
        secteur_activite: '',
        ca_mensuel_range: '',
        nombre_produits: '',
        ville: '',
        message: '',
        acceptTerms: false
      });
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById('inscription-beta')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground py-20 md:py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-accent text-accent-foreground">
              Programme Bêta - Places limitées
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Vendez en toute sécurité avec le système Escrow intégré
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              La première marketplace B2B africaine avec paiement sécurisé à triple validation. 
              Protégez vos transactions, développez votre business.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="flex flex-col items-center">
                <Lock className="h-8 w-8 mb-2" />
                <span className="text-sm font-semibold">100% sécurisé avec Escrow</span>
              </div>
              <div className="flex flex-col items-center">
                <DollarSign className="h-8 w-8 mb-2" />
                <span className="text-sm font-semibold">0% commission 3 mois</span>
              </div>
              <div className="flex flex-col items-center">
                <Zap className="h-8 w-8 mb-2" />
                <span className="text-sm font-semibold">Paiements en 24-48h</span>
              </div>
              <div className="flex flex-col items-center">
                <TrendingUp className="h-8 w-8 mb-2" />
                <span className="text-sm font-semibold">Marketplace pan-africaine</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={scrollToForm} className="bg-background text-foreground hover:bg-background/90">
                Rejoindre la bêta gratuitement
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById('escrow-section')?.scrollIntoView({ behavior: 'smooth' })} className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Voir comment ça marche
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Reassurance Bar */}
      <section className="border-y bg-background py-8">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Shield className="h-10 w-10 text-primary mb-2" />
              <h3 className="font-semibold">Paiement Escrow</h3>
              <p className="text-sm text-muted-foreground">Triple validation vendeur-livreur-acheteur</p>
            </div>
            <div className="flex flex-col items-center">
              <DollarSign className="h-10 w-10 text-primary mb-2" />
              <h3 className="font-semibold">0% commission</h3>
              <p className="text-sm text-muted-foreground">Pendant les 3 premiers mois (offre bêta)</p>
            </div>
            <div className="flex flex-col items-center">
              <Smartphone className="h-10 w-10 text-primary mb-2" />
              <h3 className="font-semibold">Interface simple</h3>
              <p className="text-sm text-muted-foreground">Créez votre boutique en 5 minutes</p>
            </div>
            <div className="flex flex-col items-center">
              <Headphones className="h-10 w-10 text-primary mb-2" />
              <h3 className="font-semibold">Support 24/7</h3>
              <p className="text-sm text-muted-foreground">Équipe dédiée aux vendeurs bêta</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            La marketplace qui protège vraiment vos transactions
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle>🛡️ Sécurité Maximale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">✓ Paiement bloqué en Escrow jusqu'à validation complète</p>
              <p className="text-muted-foreground">✓ Protection contre les impayés et fraudes</p>
              <p className="text-muted-foreground">✓ Triple vérification (vendeur → livreur → acheteur)</p>
              <p className="text-muted-foreground">✓ Aucun risque de perte financière</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Package className="h-12 w-12 text-primary mb-4" />
              <CardTitle>💼 Business sans friction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">✓ Catalogue produits illimité</p>
              <p className="text-muted-foreground">✓ Photos et descriptions optimisées</p>
              <p className="text-muted-foreground">✓ Gestion commandes centralisée</p>
              <p className="text-muted-foreground">✓ Statistiques de vente en temps réel</p>
              <p className="text-muted-foreground">✓ Notifications automatiques à chaque étape</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-primary mb-4" />
              <CardTitle>🚀 Croissance accélérée</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">✓ Accès à des milliers d'acheteurs B2B</p>
              <p className="text-muted-foreground">✓ Visibilité pan-africaine</p>
              <p className="text-muted-foreground">✓ Badge "Vendeur pionnier" (crédibilité)</p>
              <p className="text-muted-foreground">✓ Formation personnalisée gratuite</p>
              <p className="text-muted-foreground">✓ Mise en avant sur la plateforme</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Calculator */}
      <section className="bg-muted py-16">
        <div className="container">
          <Card className="max-w-3xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl">
                Combien allez-vous économiser avec BokaTrade?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div>
                  <Label>Chiffre d'affaires mensuel: {revenuePerMonth[0].toLocaleString()} FCFA</Label>
                  <Slider
                    value={revenuePerMonth}
                    onValueChange={setRevenuePerMonth}
                    min={100000}
                    max={50000000}
                    step={100000}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Nombre de transactions/mois: {transactionsPerMonth[0]}</Label>
                  <Slider
                    value={transactionsPerMonth}
                    onValueChange={setTransactionsPerMonth}
                    min={5}
                    max={500}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Taux commission actuel: {currentCommission[0]}%</Label>
                  <Slider
                    value={currentCommission}
                    onValueChange={setCurrentCommission}
                    min={0}
                    max={15}
                    step={0.5}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">❌ Avec commission {currentCommission[0]}%:</p>
                  <p className="text-2xl font-bold">Vous payez: {currentCost.toLocaleString()} FCFA/mois</p>
                </div>

                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">✅ Avec BokaTrade Bêta (3 mois):</p>
                  <p className="text-2xl font-bold">Vous payez: 0 FCFA</p>
                  <p className="text-xl text-primary font-semibold">💰 Économie: {betaSavings.toLocaleString()} FCFA</p>
                </div>

                <div className="bg-accent/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Après bêta (commission 5%):</p>
                  <p className="text-2xl font-bold">Vous payez: {postBetaCost.toLocaleString()} FCFA/mois</p>
                  <p className="text-xl text-accent-foreground font-semibold">
                    💰 Économie vs concurrent: {postBetaSavings.toLocaleString()} FCFA/mois
                  </p>
                </div>
              </div>

              <Button size="lg" className="w-full" onClick={scrollToForm}>
                Profiter de l'offre bêta maintenant
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Escrow Explanation */}
      <section id="escrow-section" className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comment fonctionne notre système Escrow à triple validation?
          </h2>
          <p className="text-xl text-muted-foreground">
            Un processus transparent qui protège vendeurs et acheteurs
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="escrow-step">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">💳 L'acheteur commande et paie</h3>
                    <p className="text-muted-foreground mb-4">
                      Le montant est bloqué de façon sécurisée. Ni le vendeur ni l'acheteur ne peut y toucher.
                    </p>
                    <Badge variant="secondary">✓ Paiement sécurisé</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="h-8 w-8 text-primary animate-bounce" />
          </div>

          <div className="escrow-step">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">📦 Le vendeur prépare et expédie</h3>
                    <p className="text-muted-foreground mb-4">
                      Vous préparez la commande. Le livreur la récupère et la valide.
                    </p>
                    <Badge variant="secondary">✓ Marchandise expédiée</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="h-8 w-8 text-primary animate-bounce" />
          </div>

          <div className="escrow-step">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">✅ L'acheteur reçoit et valide</h3>
                    <p className="text-muted-foreground mb-4">
                      L'acheteur confirme la réception. Le paiement est instantanément libéré!
                    </p>
                    <Badge className="bg-primary">✓ Paiement libéré vers votre compte 🎉</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                En cas de problème
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>🛡️ Litige automatique si non-validation après 7 jours</p>
              <p>🤝 Équipe support médiateur neutre</p>
              <p>💰 Remboursement ou résolution garantie</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ils nous font déjà confiance
            </h2>
            <p className="text-xl text-muted-foreground">
              Découvrez l'expérience des vendeurs pionniers
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-5 w-5 fill-primary text-primary" />)}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Enfin une marketplace qui me protège vraiment! Plus d'impayés, plus de stress. 
                  Le système Escrow change tout."
                </p>
                <div className="flex items-center gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center">
                    AD
                  </div>
                  <div>
                    <p className="font-semibold">Amadou Diallo</p>
                    <p className="text-sm text-muted-foreground">Grossiste en électronique, Dakar</p>
                    <p className="text-sm text-primary font-semibold">+2M FCFA/mois</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-5 w-5 fill-primary text-primary" />)}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Interface ultra simple, j'ai créé ma boutique en 10 minutes. 
                  Les notifications automatiques sont géniales!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center">
                    FT
                  </div>
                  <div>
                    <p className="font-semibold">Fatoumata Traoré</p>
                    <p className="text-sm text-muted-foreground">Vente en gros textile, Abidjan</p>
                    <p className="text-sm text-primary font-semibold">150+ transactions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-5 w-5 fill-primary text-primary" />)}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Le badge 'Vendeur pionnier' m'a donné une crédibilité instantanée. 
                  Mes ventes ont doublé en 2 mois!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center">
                    OB
                  </div>
                  <div>
                    <p className="font-semibold">Omar Ba</p>
                    <p className="text-sm text-muted-foreground">Agro-alimentaire, Lomé</p>
                    <p className="text-sm text-primary font-semibold">+120% de croissance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Beta Advantages */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <Badge className="mb-4 text-lg">⏰ Places limitées - 15 boutiques seulement</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Devenez vendeur pionnier - Offre exclusive bêta
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <DollarSign className="h-10 w-10 text-primary mb-2" />
              <CardTitle>🎁 0% commission pendant 3 mois</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Économisez des centaines de milliers de FCFA. Aucun frais caché, aucun abonnement.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Award className="h-10 w-10 text-primary mb-2" />
              <CardTitle>🏆 Badge "Vendeur Pionnier"</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Mise en avant sur la page d'accueil. Crédibilité instantanée. Statut permanent.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>📚 Formation personnalisée</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                4 webinars exclusifs. Guide complet "Réussir sur BokaTrade". Tutoriels vidéo.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Headphones className="h-10 w-10 text-primary mb-2" />
              <CardTitle>💬 Support prioritaire 24/7</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Ligne directe avec l'équipe. Réponse garantie sous 2h. Groupe WhatsApp privé.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <DollarSign className="h-10 w-10 text-primary mb-2" />
              <CardTitle>💰 Bonus parrainage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                50,000 FCFA par vendeur actif parrainé. Pas de limite. Crédit commission.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-2" />
              <CardTitle>📊 Statistiques avancées</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Dashboard analytique complet. Insights sur vos clients. Recommandations personnalisées.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted py-16">
        <div className="container max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Questions fréquentes
          </h2>
          
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="bg-background rounded-lg px-6">
              <AccordionTrigger>
                ❓ Qu'est-ce que le système Escrow exactement?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  Le système Escrow est un coffre-fort numérique qui protège l'argent de la transaction. 
                  Quand un acheteur commande, le paiement est bloqué et sécurisé. Il n'est libéré vers votre compte 
                  qu'après validation complète par les 3 parties:<br/><br/>
                  ✅ Vous (vendeur) confirmez l'expédition<br/>
                  ✅ Le livreur confirme la prise en charge<br/>
                  ✅ L'acheteur confirme la réception<br/><br/>
                  Cela élimine 100% des risques d'impayés!
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-background rounded-lg px-6">
              <AccordionTrigger>
                💰 Combien coûte l'inscription sur BokaTrade?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  L'inscription est 100% GRATUITE. Pendant la phase bêta:<br/><br/>
                  • 0% de commission pendant 3 mois<br/>
                  • Aucun frais d'inscription<br/>
                  • Aucun frais d'abonnement<br/>
                  • Aucun coût caché<br/><br/>
                  Après la bêta, commission de seulement 5% (vs 8-15% chez les concurrents).
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-background rounded-lg px-6">
              <AccordionTrigger>
                ⏱️ Combien de temps pour recevoir mon paiement?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  Une fois que l'acheteur valide la réception:<br/><br/>
                  • Le paiement est libéré INSTANTANÉMENT<br/>
                  • Transfert vers votre compte: 24-48h ouvrées<br/>
                  • Via Paystack (100% sécurisé)<br/>
                  • Notifications à chaque étape<br/><br/>
                  En moyenne: 3-5 jours entre la commande et l'argent sur votre compte!
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-background rounded-lg px-6">
              <AccordionTrigger>
                🛡️ Que se passe-t-il en cas de litige?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  Notre équipe gère tous les litiges:<br/><br/>
                  1. Si l'acheteur ne valide pas après 7 jours → litige automatique<br/>
                  2. Équipe support analyse la situation (preuves des 2 côtés)<br/>
                  3. Médiation neutre et équitable<br/>
                  4. Décision sous 48-72h<br/>
                  5. Paiement libéré ou remboursement selon verdict<br/><br/>
                  Notre taux de résolution: 98%!
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-background rounded-lg px-6">
              <AccordionTrigger>
                📦 Quels types de produits puis-je vendre?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  BokaTrade est conçu pour le B2B (vente en gros):<br/><br/>
                  ✅ Électronique et high-tech<br/>
                  ✅ Textile et mode<br/>
                  ✅ Agro-alimentaire<br/>
                  ✅ Matériaux de construction<br/>
                  ✅ Équipements professionnels<br/>
                  ✅ Cosmétiques et beauté<br/>
                  ✅ Meubles et décoration<br/><br/>
                  ❌ Produits interdits: armes, drogues, contrefaçons
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Beta Form */}
      <section id="inscription-beta" className="container py-16">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <Badge className="mb-4 mx-auto">⏰ Plus que quelques places disponibles</Badge>
            <CardTitle className="text-3xl">Réservez votre place - Programme Bêta</CardTitle>
            <CardDescription>
              Rejoignez les vendeurs pionniers de BokaTrade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nom_complet">Nom complet *</Label>
                  <Input 
                    id="nom_complet"
                    required
                    value={formData.nom_complet}
                    onChange={(e) => setFormData({...formData, nom_complet: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email professionnel *</Label>
                  <Input 
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telephone">Téléphone WhatsApp *</Label>
                  <Input 
                    id="telephone"
                    type="tel"
                    required
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="nom_entreprise">Nom de votre entreprise *</Label>
                  <Input 
                    id="nom_entreprise"
                    required
                    value={formData.nom_entreprise}
                    onChange={(e) => setFormData({...formData, nom_entreprise: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="secteur_activite">Secteur d'activité *</Label>
                  <Select 
                    value={formData.secteur_activite} 
                    onValueChange={(value) => setFormData({...formData, secteur_activite: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronique">Électronique</SelectItem>
                      <SelectItem value="textile">Textile et mode</SelectItem>
                      <SelectItem value="agro">Agro-alimentaire</SelectItem>
                      <SelectItem value="construction">Matériaux de construction</SelectItem>
                      <SelectItem value="cosmetiques">Cosmétiques</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ca_mensuel_range">CA mensuel moyen *</Label>
                  <Select 
                    value={formData.ca_mensuel_range} 
                    onValueChange={(value) => setFormData({...formData, ca_mensuel_range: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="<1M">{"< 1M FCFA"}</SelectItem>
                      <SelectItem value="1M-5M">1M - 5M FCFA</SelectItem>
                      <SelectItem value="5M-10M">5M - 10M FCFA</SelectItem>
                      <SelectItem value="10M-50M">10M - 50M FCFA</SelectItem>
                      <SelectItem value=">50M">{"> 50M FCFA"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre_produits">Nombre de produits à vendre</Label>
                  <Input 
                    id="nombre_produits"
                    type="number"
                    min="1"
                    value={formData.nombre_produits}
                    onChange={(e) => setFormData({...formData, nombre_produits: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="ville">Ville *</Label>
                  <Input 
                    id="ville"
                    required
                    value={formData.ville}
                    onChange={(e) => setFormData({...formData, ville: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message (optionnel)</Label>
                <Textarea 
                  id="message"
                  placeholder="Pourquoi voulez-vous rejoindre BokaTrade? Quels sont vos besoins principaux?"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={4}
                />
              </div>

              <div className="flex items-start gap-2">
                <Checkbox 
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => setFormData({...formData, acceptTerms: checked as boolean})}
                  required
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  J'accepte les <Link to="/mentions-legales" className="text-primary hover:underline">Conditions Générales</Link> et 
                  la <Link to="/confidentialite" className="text-primary hover:underline">Politique de confidentialité</Link> *
                </Label>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Envoi en cours...' : '🚀 RÉSERVER MA PLACE BÊTA GRATUITE'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                ✅ Inscription gratuite • ✅ 0% commission • ✅ Aucun engagement
              </p>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* How to Start */}
      <section className="bg-muted py-16">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            3 étapes pour lancer votre boutique
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-4">
                  1
                </div>
                <CardTitle>INSCRIVEZ-VOUS</CardTitle>
                <CardDescription>(2 minutes)</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✓ Formulaire bêta</li>
                  <li>✓ Contact sous 24h</li>
                  <li>✓ Formation offerte</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-4">
                  2
                </div>
                <CardTitle>CRÉEZ VOTRE BOUTIQUE</CardTitle>
                <CardDescription>(5 minutes)</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✓ Logo & description</li>
                  <li>✓ Ajout premiers produits</li>
                  <li>✓ Configuration paiement</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-4">
                  3
                </div>
                <CardTitle>COMMENCEZ À VENDRE</CardTitle>
                <CardDescription>(Immédiatement)</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✓ Produits en ligne</li>
                  <li>✓ Acheteurs B2B accès</li>
                  <li>✓ 0% commission 3 mois</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-20">
        <div className="container text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Prêt à révolutionner votre business B2B?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
            Rejoignez les vendeurs pionniers qui font confiance au premier système Escrow B2B d'Afrique
          </p>
          <Badge className="mb-6 bg-accent text-accent-foreground text-lg">
            ⏰ Dernières places disponibles
          </Badge>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={scrollToForm} className="bg-background text-foreground hover:bg-background/90">
              Rejoindre la bêta maintenant
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm">
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Paiement Paystack sécurisé
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Données cryptées SSL
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ForSellers;
