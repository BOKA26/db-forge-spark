-- Create shops table
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendeur_id UUID NOT NULL,
  nom_boutique TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  adresse TEXT,
  telephone TEXT,
  email TEXT,
  site_web TEXT,
  statut TEXT NOT NULL DEFAULT 'en_attente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Vendors can view own shops"
  ON public.shops
  FOR SELECT
  USING (vendeur_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Vendors can insert own shops"
  ON public.shops
  FOR INSERT
  WITH CHECK (vendeur_id = auth.uid());

CREATE POLICY "Vendors can update own shops"
  ON public.shops
  FOR UPDATE
  USING (vendeur_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (vendeur_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Allow anyone to view active shops (for public shop pages)
CREATE POLICY "Anyone can view active shops"
  ON public.shops
  FOR SELECT
  USING (statut = 'actif');

-- Add shop_id to products table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'products' 
                 AND column_name = 'shop_id') THEN
    ALTER TABLE public.products ADD COLUMN shop_id UUID REFERENCES public.shops(id);
  END IF;
END $$;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_shops_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_shops_updated_at();