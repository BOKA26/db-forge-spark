-- Modifier le statut par défaut des boutiques pour qu'elles soient automatiquement actives
ALTER TABLE public.shops 
ALTER COLUMN statut SET DEFAULT 'actif'::text;

-- Mettre à jour les boutiques existantes en attente pour les activer automatiquement
UPDATE public.shops 
SET statut = 'actif' 
WHERE statut = 'en_attente';