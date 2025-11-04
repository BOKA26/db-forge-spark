import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';

const Privacy = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <h1 className="text-4xl font-bold mb-6">Politique de Confidentialité</h1>
          
          <Card className="mb-6">
            <CardContent className="p-8 space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-3">1. Collecte des données</h2>
                <p className="text-muted-foreground mb-2">
                  BokaTrade collecte les données suivantes lors de votre utilisation de la plateforme :
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Informations d'identification (nom, email, téléphone)</li>
                  <li>Informations professionnelles (entreprise, secteur d'activité)</li>
                  <li>Données de transaction (commandes, paiements)</li>
                  <li>Données de navigation (cookies, logs)</li>
                  <li>Communications avec le support client</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">2. Utilisation des données</h2>
                <p className="text-muted-foreground mb-2">
                  Nous utilisons vos données personnelles pour :
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Gérer votre compte et vos transactions</li>
                  <li>Assurer la sécurité des paiements via notre système Escrow</li>
                  <li>Améliorer nos services</li>
                  <li>Vous envoyer des notifications importantes</li>
                  <li>Prévenir la fraude et assurer la sécurité de la plateforme</li>
                  <li>Respecter nos obligations légales</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">3. Partage des données</h2>
                <p className="text-muted-foreground mb-2">
                  Vos données peuvent être partagées avec :
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Les autres parties impliquées dans vos transactions (acheteurs, vendeurs, livreurs)</li>
                  <li>Nos prestataires de services techniques (hébergement, paiement)</li>
                  <li>Les autorités légales en cas d'obligation légale</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  Nous ne vendons jamais vos données personnelles à des tiers à des fins marketing.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">4. Sécurité des données</h2>
                <p className="text-muted-foreground">
                  Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour 
                  protéger vos données personnelles contre tout accès non autorisé, modification, divulgation ou 
                  destruction. Cela inclut le chiffrement des données sensibles, l'authentification sécurisée et 
                  des audits de sécurité réguliers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">5. Conservation des données</h2>
                <p className="text-muted-foreground">
                  Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services 
                  et respecter nos obligations légales. Les données de transaction sont conservées pendant 10 ans 
                  conformément aux obligations comptables. Vous pouvez demander la suppression de votre compte à 
                  tout moment.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">6. Vos droits</h2>
                <p className="text-muted-foreground mb-2">
                  Conformément à la réglementation sur la protection des données, vous disposez des droits suivants :
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Droit d'accès à vos données personnelles</li>
                  <li>Droit de rectification des données inexactes</li>
                  <li>Droit à l'effacement de vos données</li>
                  <li>Droit à la limitation du traitement</li>
                  <li>Droit à la portabilité de vos données</li>
                  <li>Droit d'opposition au traitement</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  Pour exercer ces droits, contactez-nous à : privacy@bokatrade.com
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">7. Cookies</h2>
                <p className="text-muted-foreground">
                  Notre site utilise des cookies pour améliorer votre expérience. Les cookies essentiels sont 
                  nécessaires au fonctionnement du site. Les cookies analytiques nous aident à comprendre comment 
                  vous utilisez le site. Vous pouvez gérer vos préférences de cookies dans les paramètres de votre 
                  navigateur.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">8. Transferts internationaux</h2>
                <p className="text-muted-foreground">
                  Vos données peuvent être transférées et stockées sur des serveurs situés en dehors de votre pays 
                  de résidence. Nous nous assurons que ces transferts sont effectués conformément à la réglementation 
                  applicable et que des garanties appropriées sont en place.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">9. Modifications de la politique</h2>
                <p className="text-muted-foreground">
                  Nous pouvons mettre à jour cette politique de confidentialité périodiquement. Nous vous informerons 
                  de tout changement significatif par email ou via une notification sur la plateforme. Nous vous 
                  encourageons à consulter régulièrement cette page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">10. Contact</h2>
                <p className="text-muted-foreground">
                  Pour toute question concernant cette politique de confidentialité ou le traitement de vos données 
                  personnelles, contactez notre délégué à la protection des données à : privacy@bokatrade.com
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
  );
};

export default Privacy;
