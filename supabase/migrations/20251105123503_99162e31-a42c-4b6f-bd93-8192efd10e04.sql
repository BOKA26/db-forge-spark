-- Ajouter une politique INSERT pour la table validations
-- Permet aux utilisateurs de créer des validations pour leurs commandes
CREATE POLICY "Order parties can insert validations" 
ON public.validations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.id = order_id 
    AND (
      o.acheteur_id = auth.uid() 
      OR o.vendeur_id = auth.uid() 
      OR o.livreur_id = auth.uid() 
      OR has_role(auth.uid(), 'admin'::app_role)
    )
  )
);