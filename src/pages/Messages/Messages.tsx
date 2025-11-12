import { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  updated_at: string;
  other_user: {
    id: string;
    nom: string;
    email: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    is_read: boolean;
  };
  unread_count: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

const Messages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: convs, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Fetch other user details and last message for each conversation
      const conversationsWithDetails = await Promise.all(
        convs.map(async (conv) => {
          const otherUserId = conv.participant_1_id === user.id 
            ? conv.participant_2_id 
            : conv.participant_1_id;

          // Fetch other user
          const { data: otherUser } = await supabase
            .from('users')
            .select('id, nom, email')
            .eq('id', otherUserId)
            .single();

          // Fetch last message
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content, created_at, is_read')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Count unread messages
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('receiver_id', user.id)
            .eq('is_read', false);

          return {
            ...conv,
            other_user: otherUser || { id: otherUserId, nom: 'Utilisateur', email: '' },
            last_message: lastMsg,
            unread_count: count || 0,
          };
        })
      );

      return conversationsWithDetails;
    },
    enabled: !!user?.id,
  });

  // Fetch messages for selected conversation
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversation)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation || !user?.id) throw new Error('Invalid conversation');

      const receiverId = conversation.participant_1_id === user.id
        ? conversation.participant_2_id
        : conversation.participant_1_id;

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          receiver_id: receiverId,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages', user?.id] });
      setMessageText('');
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le message',
        variant: 'destructive',
      });
      console.error('Error sending message:', error);
    },
  });

  // Mark messages as read
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user?.id) return;

      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages', user?.id] });
    },
  });

  // Handle conversation selection
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    markAsReadMutation.mutate(conversationId);
  };

  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: messageText.trim(),
    });
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation] });
          queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['unread-messages', user?.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, selectedConversation, queryClient]);

  const selectedConvData = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container py-8 flex-1">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Messages</h1>
        </div>

        <div className="grid md:grid-cols-[350px_1fr] gap-4 h-[calc(100vh-250px)]">
          {/* Conversations List */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full">
                {loadingConversations ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Chargement...
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Aucune conversation pour le moment
                    </p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors border-b ${
                        selectedConversation === conv.id ? 'bg-muted' : ''
                      }`}
                    >
                      <Avatar>
                        <AvatarFallback>
                          {conv.other_user.nom.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold truncate">
                            {conv.other_user.nom}
                          </p>
                          {conv.last_message && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(conv.last_message.created_at), 'HH:mm')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.last_message?.content || 'Aucun message'}
                          </p>
                          {conv.unread_count > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 ml-2">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="flex flex-col">
            {selectedConvData ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Avatar>
                      <AvatarFallback>
                        {selectedConvData.other_user.nom.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {selectedConvData.other_user.nom}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedConvData.other_user.email}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-4 overflow-hidden">
                  <ScrollArea className="h-full pr-4" ref={scrollRef}>
                    <div className="space-y-4">
                      {messages.map((msg: Message) => {
                        const isOwn = msg.sender_id === user?.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isOwn
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                }`}
                              >
                                {format(new Date(msg.created_at), 'HH:mm')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>

                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Écrivez votre message..."
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button
                      type="submit"
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Sélectionnez une conversation</p>
                  <p className="text-muted-foreground">
                    Choisissez une conversation pour commencer à discuter
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Messages;
