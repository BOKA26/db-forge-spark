import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const refuseCookies = () => {
    localStorage.setItem('cookie-consent', 'refused');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-5">
      <Card className="p-4 shadow-lg border-2">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-sm">🍪 Gestion des cookies</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mt-1 -mr-1"
            onClick={refuseCookies}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Nous utilisons des cookies pour améliorer votre expérience et analyser le trafic. 
          En continuant, vous acceptez notre utilisation des cookies.{' '}
          <Link to="/politique-confidentialite" className="underline hover:text-foreground">
            En savoir plus
          </Link>
        </p>
        <div className="flex gap-2">
          <Button
            onClick={acceptCookies}
            size="sm"
            className="flex-1"
          >
            Accepter
          </Button>
          <Button
            onClick={refuseCookies}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Refuser
          </Button>
        </div>
      </Card>
    </div>
  );
};
