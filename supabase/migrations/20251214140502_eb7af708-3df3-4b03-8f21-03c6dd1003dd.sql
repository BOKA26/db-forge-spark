-- Supprimer l'ancien check constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_statut_check;

-- Ajouter le nouveau check constraint avec 'en_attente_livreur'
ALTER TABLE public.orders ADD CONSTRAINT orders_statut_check CHECK (
  statut = ANY (ARRAY[
    'en_attente_paiement'::text,
    'fonds_bloques'::text,
    'en_attente_livreur'::text,
    'en_livraison'::text,
    'livré'::text,
    'terminé'::text,
    'annulé'::text,
    'litige'::text
  ])
);