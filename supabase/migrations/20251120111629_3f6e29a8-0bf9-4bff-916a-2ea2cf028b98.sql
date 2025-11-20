-- Ajouter un champ points à la table users pour le système de points des livreurs
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS points integer DEFAULT 0;

-- Ajouter un commentaire pour expliquer l'usage
COMMENT ON COLUMN public.users.points IS 'Points de réputation pour les livreurs (utilisé pour le système de notation)';

-- Créer un index pour optimiser les requêtes sur les points
CREATE INDEX IF NOT EXISTS idx_users_points ON public.users(points) WHERE points IS NOT NULL;