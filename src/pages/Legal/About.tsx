import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEOHead } from '@/components/seo/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, Globe, TrendingUp } from 'lucide-react';

const About = () => {
  return (
    <>
      <SEOHead
        title="À propos de BokaTrade"
        description="Découvrez BokaTrade, la marketplace B2B leader en Afrique de l'Ouest. Plateforme sécurisée avec Escrow pour faciliter le commerce professionnel entre acheteurs et vendeurs."
        keywords="à propos, bokatrade, marketplace b2b, afrique, mission, valeurs"
        canonical="/a-propos"
      />
      <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <h1 className="text-4xl font-bold mb-6">À propos de BokaTrade</h1>
          
          <Card className="mb-8">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-4">Notre Mission</h2>
              <p className="text-muted-foreground mb-4">
                BokaTrade est la première marketplace B2B en Afrique avec système de paiement Escrow intégré. 
                Notre mission est de sécuriser les transactions commerciales entre entreprises africaines en garantissant 
                la protection des acheteurs et des vendeurs.
              </p>
              <p className="text-muted-foreground">
                Grâce à notre système de triple validation (acheteur, vendeur, livreur), nous assurons que chaque 
                transaction se déroule dans la transparence et la confiance mutuelle.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <Shield className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sécurité maximale</h3>
                <p className="text-muted-foreground">
                  Système Escrow avec fonds bloqués jusqu'à validation complète de la transaction
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Communauté active</h3>
                <p className="text-muted-foreground">
                  Des milliers d'entreprises africaines font confiance à BokaTrade
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Globe className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Portée africaine</h3>
                <p className="text-muted-foreground">
                  Connectez-vous avec des fournisseurs et acheteurs à travers tout le continent
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Croissance garantie</h3>
                <p className="text-muted-foreground">
                  Développez votre activité en toute confiance avec nos outils professionnels
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-4">Notre Histoire</h2>
              <p className="text-muted-foreground mb-4">
                Fondée en 2024, BokaTrade est née de la volonté de résoudre le problème majeur de la confiance 
                dans les transactions B2B en Afrique. Trop souvent, acheteurs et vendeurs hésitent à faire affaire 
                ensemble par manque de garanties.
              </p>
              <p className="text-muted-foreground">
                Notre plateforme innovante avec système Escrow et triple validation apporte enfin la solution 
                qu'attendaient les entreprises africaines pour commercer en toute sérénité.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
    </>
  );
};

export default About;
