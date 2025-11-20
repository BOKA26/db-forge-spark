import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/40 mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* À propos */}
          <div>
            <h3 className="font-semibold mb-4">À propos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/a-propos" className="text-muted-foreground hover:text-foreground">
                  Qui sommes-nous
                </Link>
              </li>
              <li>
                <Link to="/pour-vendeurs" className="text-muted-foreground hover:text-foreground">
                  Devenir vendeur
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Aide */}
          <div>
            <h3 className="font-semibold mb-4">Aide</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="font-semibold mb-4">Légal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/mentions-legales" className="text-muted-foreground hover:text-foreground">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link to="/cgu" className="text-muted-foreground hover:text-foreground">
                  CGV/CGU
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/politique-confidentialite" className="text-muted-foreground hover:text-foreground">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Restez informé des dernières offres
            </p>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BokaTrade. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};