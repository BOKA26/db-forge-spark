import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, User, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Messages = () => {
  const { user } = useAuth();

  // Placeholder for future messaging system
  const { data: messages } = useQuery({
    queryKey: ['messages', user?.id],
    queryFn: async () => {
      // Future implementation
      return [];
    },
    enabled: !!user?.id,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container py-8 flex-1">
        <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
          <MessageSquare className="h-10 w-10" />
          Messages
        </h1>

        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-semibold mb-4">Messagerie</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              La fonctionnalité de messagerie sera bientôt disponible. Vous pourrez communiquer directement avec les vendeurs, acheteurs et livreurs.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" disabled>
                <User className="mr-2 h-4 w-4" />
                Contacts
              </Button>
              <Button variant="outline" disabled>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Messages;
