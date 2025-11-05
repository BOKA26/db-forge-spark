-- Créer une table pour suivre la géolocalisation des livreurs
CREATE TABLE IF NOT EXISTS public.courier_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID REFERENCES public.deliveries(id) ON DELETE CASCADE NOT NULL,
  livreur_id UUID NOT NULL,
  latitude NUMERIC(10, 8) NOT NULL,
  longitude NUMERIC(11, 8) NOT NULL,
  accuracy NUMERIC,
  heading NUMERIC,
  speed NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(delivery_id)
);

-- Activer RLS
ALTER TABLE public.courier_locations ENABLE ROW LEVEL SECURITY;

-- Policy: Les parties concernées peuvent voir la position
CREATE POLICY "Delivery parties can view location"
ON public.courier_locations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.deliveries d
    WHERE d.id = courier_locations.delivery_id
    AND (d.livreur_id = auth.uid() OR d.acheteur_id = auth.uid() OR d.vendeur_id = auth.uid())
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Policy: Le livreur peut insérer/mettre à jour sa position
CREATE POLICY "Courier can insert own location"
ON public.courier_locations
FOR INSERT
WITH CHECK (livreur_id = auth.uid());

CREATE POLICY "Courier can update own location"
ON public.courier_locations
FOR UPDATE
USING (livreur_id = auth.uid())
WITH CHECK (livreur_id = auth.uid());

-- Activer Realtime pour cette table
ALTER TABLE public.courier_locations REPLICA IDENTITY FULL;

-- Créer un index pour améliorer les performances
CREATE INDEX idx_courier_locations_delivery_id ON public.courier_locations(delivery_id);
CREATE INDEX idx_courier_locations_livreur_id ON public.courier_locations(livreur_id);
CREATE INDEX idx_courier_locations_created_at ON public.courier_locations(created_at DESC);