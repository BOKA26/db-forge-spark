-- Create live_streams table
CREATE TABLE public.live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
  vendeur_id UUID NOT NULL,
  titre TEXT NOT NULL,
  description TEXT,
  statut TEXT NOT NULL DEFAULT 'planifié' CHECK (statut IN ('planifié', 'en_cours', 'terminé')),
  agora_channel_id TEXT,
  agora_token TEXT,
  viewers_count INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  thumbnail_url TEXT,
  recorded_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create live_viewers table
CREATE TABLE public.live_viewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  live_stream_id UUID REFERENCES public.live_streams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_viewers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for live_streams
CREATE POLICY "Anyone can view active live streams"
  ON public.live_streams
  FOR SELECT
  USING (statut = 'en_cours' OR has_role(auth.uid(), 'admin'::app_role) OR vendeur_id = auth.uid());

CREATE POLICY "Vendors can insert their own live streams"
  ON public.live_streams
  FOR INSERT
  WITH CHECK (vendeur_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Vendors can update their own live streams"
  ON public.live_streams
  FOR UPDATE
  USING (vendeur_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (vendeur_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Vendors can delete their own live streams"
  ON public.live_streams
  FOR DELETE
  USING (vendeur_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for live_viewers
CREATE POLICY "Anyone can view live viewers"
  ON public.live_viewers
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert viewer records"
  ON public.live_viewers
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own viewer records"
  ON public.live_viewers
  FOR UPDATE
  USING (user_id = auth.uid() OR user_id IS NULL)
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Create indexes for performance
CREATE INDEX idx_live_streams_vendeur ON public.live_streams(vendeur_id);
CREATE INDEX idx_live_streams_shop ON public.live_streams(shop_id);
CREATE INDEX idx_live_streams_statut ON public.live_streams(statut);
CREATE INDEX idx_live_viewers_live_stream ON public.live_viewers(live_stream_id);
CREATE INDEX idx_live_viewers_user ON public.live_viewers(user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_live_streams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_live_streams_updated_at_trigger
  BEFORE UPDATE ON public.live_streams
  FOR EACH ROW
  EXECUTE FUNCTION update_live_streams_updated_at();