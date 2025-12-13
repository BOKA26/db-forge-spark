-- 1. Fix overpermissive order update policy
DROP POLICY IF EXISTS "Order parties can update orders" ON orders;

-- Buyers can only update delivery info on pending orders
CREATE POLICY "Buyers can update delivery info on pending orders"
ON orders FOR UPDATE
USING (acheteur_id = auth.uid() AND statut = 'en_attente_paiement')
WITH CHECK (acheteur_id = auth.uid() AND statut = 'en_attente_paiement');

-- Vendors can update vendor-specific fields
CREATE POLICY "Vendors can update their orders"
ON orders FOR UPDATE
USING (vendeur_id = auth.uid())
WITH CHECK (vendeur_id = auth.uid());

-- Couriers can update courier-specific fields
CREATE POLICY "Couriers can update assigned orders"
ON orders FOR UPDATE
USING (livreur_id = auth.uid())
WITH CHECK (livreur_id = auth.uid());

-- Admins can update all orders
CREATE POLICY "Admins can update all orders"
ON orders FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2. Fix Security Definer View - recreate courier_stats with SECURITY INVOKER
DROP VIEW IF EXISTS public.courier_stats;

CREATE VIEW public.courier_stats
WITH (security_invoker = on)
AS
SELECT 
  u.id AS courier_id,
  u.nom AS courier_name,
  COUNT(DISTINCT d.id) AS total_deliveries,
  COUNT(DISTINCT CASE WHEN d.statut IN ('livré', 'livrée') THEN d.id END) AS completed_deliveries,
  COUNT(DISTINCT cr.id) AS total_ratings,
  COALESCE(AVG(cr.rating), 0) AS average_rating
FROM users u
LEFT JOIN deliveries d ON d.livreur_id = u.id
LEFT JOIN courier_ratings cr ON cr.livreur_id = u.id
WHERE EXISTS (
  SELECT 1 FROM user_roles ur 
  WHERE ur.user_id = u.id AND ur.role = 'livreur'::app_role
)
GROUP BY u.id, u.nom;

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.courier_stats TO authenticated;