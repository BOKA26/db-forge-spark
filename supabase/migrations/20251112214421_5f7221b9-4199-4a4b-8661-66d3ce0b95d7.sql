-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1_id UUID NOT NULL,
  participant_2_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(participant_1_id, participant_2_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_conversations_participant_1 ON public.conversations(participant_1_id);
CREATE INDEX idx_conversations_participant_2 ON public.conversations(participant_2_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_messages_is_read ON public.messages(is_read);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
ON public.conversations
FOR SELECT
USING (
  auth.uid() = participant_1_id OR 
  auth.uid() = participant_2_id OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (
  auth.uid() = participant_1_id OR 
  auth.uid() = participant_2_id
);

CREATE POLICY "Users can update their own conversations"
ON public.conversations
FOR UPDATE
USING (
  auth.uid() = participant_1_id OR 
  auth.uid() = participant_2_id
);

-- RLS Policies for messages
CREATE POLICY "Users can view their own messages"
ON public.messages
FOR SELECT
USING (
  auth.uid() = sender_id OR 
  auth.uid() = receiver_id OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can send messages"
ON public.messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
ON public.messages
FOR UPDATE
USING (auth.uid() = receiver_id);

-- Function to update conversation timestamp
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

-- Trigger to update conversation timestamp on new message
CREATE TRIGGER update_conversation_updated_at
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_timestamp();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;