-- Créer une table pour les évaluations des livreurs
CREATE TABLE IF NOT EXISTS public.courier_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid REFERENCES public.deliveries(id) ON DELETE CASCADE NOT NULL,
  livreur_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  acheteur_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(delivery_id, acheteur_id)
);

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_courier_ratings_livreur ON public.courier_ratings(livreur_id);
CREATE INDEX IF NOT EXISTS idx_courier_ratings_delivery ON public.courier_ratings(delivery_id);

-- Activer RLS
ALTER TABLE public.courier_ratings ENABLE ROW LEVEL SECURITY;

-- Politique : Les acheteurs peuvent créer des évaluations pour leurs livraisons
CREATE POLICY "Buyers can rate their deliveries"
ON public.courier_ratings
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.deliveries d
    WHERE d.id = delivery_id 
    AND d.acheteur_id = auth.uid()
    AND d.statut = 'livré'
  )
);

-- Politique : Les acheteurs peuvent voir leurs propres évaluations
CREATE POLICY "Buyers can view their own ratings"
ON public.courier_ratings
FOR SELECT
TO authenticated
USING (acheteur_id = auth.uid());

-- Politique : Les livreurs peuvent voir leurs évaluations
CREATE POLICY "Couriers can view their ratings"
ON public.courier_ratings
FOR SELECT
TO authenticated
USING (livreur_id = auth.uid());

-- Politique : Les admins peuvent tout voir
CREATE POLICY "Admins can view all ratings"
ON public.courier_ratings
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Politique : Les acheteurs peuvent modifier leurs évaluations
CREATE POLICY "Buyers can update their ratings"
ON public.courier_ratings
FOR UPDATE
TO authenticated
USING (acheteur_id = auth.uid())
WITH CHECK (acheteur_id = auth.uid());

-- Créer une vue pour calculer la note moyenne des livreurs
CREATE OR REPLACE VIEW public.courier_stats AS
SELECT 
  u.id as courier_id,
  u.nom as courier_name,
  COUNT(cr.id) as total_ratings,
  ROUND(AVG(cr.rating)::numeric, 2) as average_rating,
  COUNT(DISTINCT d.id) as total_deliveries,
  COUNT(CASE WHEN d.statut = 'livré' THEN 1 END) as completed_deliveries
FROM public.users u
LEFT JOIN public.courier_ratings cr ON cr.livreur_id = u.id
LEFT JOIN public.deliveries d ON d.livreur_id = u.id
WHERE EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = u.id AND ur.role = 'livreur'::app_role
)
GROUP BY u.id, u.nom;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_courier_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_courier_ratings_updated_at
BEFORE UPDATE ON public.courier_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_courier_ratings_updated_at();