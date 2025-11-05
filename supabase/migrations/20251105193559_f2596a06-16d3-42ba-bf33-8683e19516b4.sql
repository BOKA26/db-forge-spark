-- Ajouter les champs manquants pour le style Alibaba
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS price_tier_1 numeric,
ADD COLUMN IF NOT EXISTS price_tier_2 numeric,
ADD COLUMN IF NOT EXISTS price_tier_3 numeric,
ADD COLUMN IF NOT EXISTS price_tier_4 numeric,
ADD COLUMN IF NOT EXISTS sample_price numeric,
ADD COLUMN IF NOT EXISTS sizes jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS colors jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS customization_options jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS origin_country text DEFAULT 'CI';

-- Créer une table pour les demandes de renseignements (inquiries)
CREATE TABLE IF NOT EXISTS public.inquiries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id),
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  buyer_phone text,
  message text NOT NULL,
  quantity integer NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS sur la table inquiries
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Policy : vendeurs peuvent voir les demandes pour leurs produits
CREATE POLICY "Vendors can view inquiries for their products"
ON public.inquiries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = inquiries.product_id
    AND p.vendeur_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Policy : tout le monde peut créer une demande
CREATE POLICY "Anyone can create inquiries"
ON public.inquiries
FOR INSERT
WITH CHECK (true);