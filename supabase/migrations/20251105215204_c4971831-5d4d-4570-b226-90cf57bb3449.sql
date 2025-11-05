-- Vérifier et créer le trigger pour les validations automatiques
DROP TRIGGER IF EXISTS trigger_ensure_validation ON public.orders;

CREATE TRIGGER trigger_ensure_validation
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_validation_row();

-- S'assurer que toutes les commandes existantes ont une ligne de validation
INSERT INTO public.validations (order_id, vendeur_ok, acheteur_ok, livreur_ok)
SELECT o.id, false, false, false
FROM public.orders o
WHERE NOT EXISTS (
  SELECT 1 FROM public.validations v WHERE v.order_id = o.id
)
ON CONFLICT DO NOTHING;