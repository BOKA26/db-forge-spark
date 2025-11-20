import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const WhatsAppButton = () => {
  const whatsappNumber = '+237600000000'; // Replace with actual number
  const message = encodeURIComponent('Bonjour, j\'ai une question sur vos produits');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 touch-manipulation"
      aria-label="Contactez-nous sur WhatsApp"
    >
      <Button
        size="lg"
        className="h-14 w-14 md:h-16 md:w-16 rounded-full shadow-lg bg-[#25D366] hover:bg-[#20BA5A] text-white"
      >
        <MessageCircle className="w-7 h-7 md:w-8 md:h-8" />
      </Button>
      <span className="sr-only">Contactez-nous sur WhatsApp</span>
    </a>
  );
};
