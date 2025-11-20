import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEOHead } from '@/components/seo/SEOHead';
import { Card, CardContent } from '@/components/ui/card';

const Terms = () => {
  return (
    <>
      <SEOHead
        title="Conditions Générales d'Utilisation"
        description="Conditions générales d'utilisation de BokaTrade : marketplace B2B avec système Escrow sécurisé pour l'Afrique de l'Ouest. Droits et obligations des utilisateurs."
        keywords="CGU, conditions générales, marketplace b2b, escrow, règlement"
        canonical="/cgu"
      />
      <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <h1 className="text-4xl font-bold mb-6">Conditions Générales d'Utilisation</h1>
          
          <Card className="mb-6">
            <CardContent className="p-8 space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-3">1. Acceptation des conditions</h2>
                <p className="text-muted-foreground">
                  En accédant et en utilisant la plateforme BokaTrade, vous acceptez d'être lié par les présentes 
                  conditions générales d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser 
                  nos services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">2. Description du service</h2>
                <p className="text-muted-foreground mb-2">
                  BokaTrade est une plateforme de commerce B2B qui met en relation acheteurs et vendeurs professionnels. 
                  Nos services incluent :
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Marketplace de produits et services B2B</li>
                  <li>Système de paiement Escrow sécurisé</li>
                  <li>Système de triple validation des transactions</li>
                  <li>Suivi des livraisons</li>
                  <li>Gestion des boutiques en ligne</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">3. Inscription et compte utilisateur</h2>
                <p className="text-muted-foreground mb-2">
                  Pour utiliser nos services, vous devez créer un compte en fournissant des informations exactes et à jour. 
                  Vous êtes responsable de :
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>La confidentialité de vos identifiants de connexion</li>
                  <li>Toutes les activités effectuées depuis votre compte</li>
                  <li>La mise à jour de vos informations personnelles</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">4. Système Escrow</h2>
                <p className="text-muted-foreground">
                  Les paiements effectués sur BokaTrade sont sécurisés par notre système Escrow. Les fonds sont bloqués 
                  jusqu'à la validation complète de la transaction par les trois parties (acheteur, vendeur, livreur). 
                  Le déblocage des fonds intervient uniquement lorsque toutes les validations sont confirmées.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">5. Obligations des utilisateurs</h2>
                <p className="text-muted-foreground mb-2">En utilisant BokaTrade, vous vous engagez à :</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Respecter toutes les lois et réglementations applicables</li>
                  <li>Fournir des informations exactes sur les produits et services</li>
                  <li>Honorer vos engagements commerciaux</li>
                  <li>Ne pas utiliser la plateforme à des fins frauduleuses</li>
                  <li>Maintenir un comportement professionnel</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">6. Frais et commissions</h2>
                <p className="text-muted-foreground">
                  BokaTrade applique des frais de service sur les transactions effectuées via la plateforme. 
                  Ces frais sont clairement indiqués avant la validation de chaque transaction. Les tarifs peuvent 
                  être modifiés avec un préavis de 30 jours.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">7. Résolution des litiges</h2>
                <p className="text-muted-foreground">
                  En cas de litige entre parties, BokaTrade met à disposition un système de médiation. Les fonds 
                  Escrow restent bloqués jusqu'à résolution du litige. Les décisions de médiation sont finales et 
                  exécutoires.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">8. Limitation de responsabilité</h2>
                <p className="text-muted-foreground">
                  BokaTrade agit en tant qu'intermédiaire entre acheteurs et vendeurs. Nous ne sommes pas responsables 
                  de la qualité des produits, des retards de livraison, ou de tout autre problème découlant des 
                  transactions entre utilisateurs, sauf en cas de dysfonctionnement avéré de notre système Escrow.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">9. Modification des conditions</h2>
                <p className="text-muted-foreground">
                  Nous nous réservons le droit de modifier ces conditions générales à tout moment. Les utilisateurs 
                  seront informés des modifications importantes par email et/ou notification sur la plateforme.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">10. Contact</h2>
                <p className="text-muted-foreground">
                  Pour toute question concernant ces conditions générales, veuillez nous contacter à : 
                  legal@bokatrade.com
                </p>
              </section>
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground text-center">
            Dernière mise à jour : Novembre 2024
          </p>
        </div>
      </main>

      <Footer />
    </div>
    </>
  );
};

export default Terms;
