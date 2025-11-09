-- Création de la table pour les inscriptions bêta vendeurs
CREATE TABLE IF NOT EXISTS public.beta_sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Informations contact
  nom_complet TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telephone TEXT NOT NULL,
  
  -- Informations entreprise
  nom_entreprise TEXT NOT NULL,
  secteur_activite TEXT NOT NULL,
  ca_mensuel_range TEXT NOT NULL,
  nombre_produits INTEGER,
  ville TEXT NOT NULL,
  
  -- Message optionnel
  message TEXT,
  
  -- Statut inscription
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'contacte', 'accepte', 'refuse')),
  
  -- Tracking
  source TEXT DEFAULT 'landing-vendeurs',
  ip_address TEXT,
  user_agent TEXT,
  
  -- Notes admin
  admin_notes TEXT,
  date_contact TIMESTAMPTZ,
  date_acceptation TIMESTAMPTZ
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_beta_sellers_email ON public.beta_sellers(email);
CREATE INDEX IF NOT EXISTS idx_beta_sellers_statut ON public.beta_sellers(statut);
CREATE INDEX IF NOT EXISTS idx_beta_sellers_created_at ON public.beta_sellers(created_at DESC);

-- Activer RLS
ALTER TABLE public.beta_sellers ENABLE ROW LEVEL SECURITY;

-- Policy: Insertion publique (formulaire)
CREATE POLICY "Anyone can register for beta" ON public.beta_sellers
  FOR INSERT
  WITH CHECK (true);

-- Policy: Admin peut tout voir et modifier
CREATE POLICY "Admins can manage beta sellers" ON public.beta_sellers
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));