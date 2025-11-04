import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';

const LegalNotice = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <h1 className="text-4xl font-bold mb-6">Mentions Légales</h1>
          
          <Card className="mb-6">
            <CardContent className="p-8 space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-3">1. Éditeur du site</h2>
                <p className="text-muted-foreground mb-2">
                  Le site BokaTrade est édité par :
                </p>
                <ul className="text-muted-foreground space-y-1">
                  <li><strong>Raison sociale :</strong> BokaTrade SARL</li>
                  <li><strong>Capital social :</strong> 10 000 000 FCFA</li>
                  <li><strong>Siège social :</strong> Abidjan, Cocody, Côte d'Ivoire</li>
                  <li><strong>Email :</strong> contact@bokatrade.com</li>
                  <li><strong>Téléphone :</strong> +225 XX XX XX XX XX</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">2. Directeur de publication</h2>
                <p className="text-muted-foreground">
                  Le directeur de la publication du site est le représentant légal de BokaTrade SARL.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">3. Hébergement</h2>
                <p className="text-muted-foreground mb-2">
                  Le site BokaTrade est hébergé par :
                </p>
                <ul className="text-muted-foreground space-y-1">
                  <li><strong>Hébergeur :</strong> Supabase Inc.</li>
                  <li><strong>Adresse :</strong> 970 Toa Payoh North, #07-04, Singapore 318992</li>
                  <li><strong>Site web :</strong> https://supabase.com</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">4. Propriété intellectuelle</h2>
                <p className="text-muted-foreground mb-2">
                  L'ensemble du contenu de ce site (textes, images, vidéos, logos, design) est la propriété exclusive 
                  de BokaTrade SARL, sauf mention contraire. Toute reproduction, représentation, modification, 
                  publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le 
                  procédé utilisé, est interdite sans autorisation écrite préalable.
                </p>
                <p className="text-muted-foreground">
                  Les marques et logos BokaTrade sont des marques déposées. Toute utilisation non autorisée de ces 
                  marques est strictement interdite.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">5. Protection des données personnelles</h2>
                <p className="text-muted-foreground">
                  Conformément à la réglementation en vigueur sur la protection des données personnelles, vous 
                  disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données vous 
                  concernant. Pour exercer ces droits, veuillez nous contacter à : privacy@bokatrade.com
                </p>
                <p className="text-muted-foreground mt-2">
                  Pour plus d'informations, consultez notre{' '}
                  <a href="/politique-confidentialite" className="text-primary hover:underline">
                    Politique de Confidentialité
                  </a>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">6. Cookies</h2>
                <p className="text-muted-foreground">
                  Le site BokaTrade utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic. 
                  En poursuivant votre navigation sur ce site, vous acceptez l'utilisation de cookies. Vous pouvez 
                  à tout moment désactiver les cookies dans les paramètres de votre navigateur.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">7. Responsabilité</h2>
                <p className="text-muted-foreground">
                  BokaTrade s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. 
                  Toutefois, BokaTrade ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations 
                  mises à disposition sur ce site. BokaTrade ne pourra être tenu responsable des erreurs, d'une 
                  absence de disponibilité des informations et des services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">8. Liens hypertextes</h2>
                <p className="text-muted-foreground">
                  Le site peut contenir des liens hypertextes vers d'autres sites. BokaTrade n'exerce aucun contrôle 
                  sur ces sites et décline toute responsabilité quant à leur contenu. La présence de liens hypertextes 
                  vers d'autres sites ne saurait engager la responsabilité de BokaTrade.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">9. Droit applicable</h2>
                <p className="text-muted-foreground">
                  Les présentes mentions légales sont régies par le droit ivoirien. Tout litige relatif à 
                  l'utilisation du site sera soumis à la compétence exclusive des tribunaux d'Abidjan, Côte d'Ivoire.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">10. Contact</h2>
                <p className="text-muted-foreground">
                  Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
                </p>
                <ul className="text-muted-foreground space-y-1 mt-2">
                  <li><strong>Email :</strong> legal@bokatrade.com</li>
                  <li><strong>Téléphone :</strong> +225 XX XX XX XX XX</li>
                  <li><strong>Adresse :</strong> Abidjan, Cocody, Côte d'Ivoire</li>
                </ul>
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

export default LegalNotice;
