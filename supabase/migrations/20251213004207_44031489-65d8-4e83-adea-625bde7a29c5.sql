-- Modifier le trigger pour débloquer les fonds quand l'acheteur confirme après livraison
CREATE OR REPLACE FUNCTION public.unlock_payment_on_full_validation()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Débloquer les fonds quand l'acheteur confirme la réception (après que le livreur ait terminé)
  IF new.acheteur_ok = TRUE THEN
    -- Vérifier que la livraison est bien terminée (livreur_ok = true)
    IF new.livreur_ok = TRUE OR EXISTS (
      SELECT 1 FROM public.deliveries d 
      WHERE d.order_id = new.order_id 
      AND d.statut = 'livré'
    ) THEN
      -- Débloquer le paiement
      UPDATE public.payments
         SET statut = 'débloqué', debloque_at = now()
       WHERE order_id = new.order_id AND statut = 'bloqué';
      
      -- Marquer la commande comme terminée
      UPDATE public.orders
         SET statut = 'terminé'
       WHERE id = new.order_id AND statut IN ('livré', 'en_livraison', 'fonds_bloques');
      
      -- Notifier le vendeur que les fonds sont libérés
      INSERT INTO public.notifications(user_id, message, canal)
        SELECT o.vendeur_id, '💰 Paiement libéré ! Les fonds de votre commande ont été débloqués.', 'app'
        FROM public.orders o WHERE o.id = new.order_id;
    END IF;
  END IF;
  
  new.updated_at := now();
  RETURN new;
END;
$function$;

-- Créer un trigger pour notifier l'acheteur quand la livraison est terminée
CREATE OR REPLACE FUNCTION public.notify_buyer_on_delivery_complete()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Quand le livreur marque la livraison comme terminée
  IF new.statut = 'livré' AND (old.statut IS NULL OR old.statut != 'livré') THEN
    -- Mettre à jour la validation du livreur
    UPDATE public.validations
       SET livreur_ok = TRUE, updated_at = now()
     WHERE order_id = new.order_id;
    
    -- Notifier l'acheteur pour confirmer la réception
    INSERT INTO public.notifications(user_id, message, canal)
    VALUES (new.acheteur_id, '📦 Votre commande a été livrée ! Veuillez confirmer la réception pour finaliser la transaction.', 'app');
    
    -- Mettre à jour le statut de la commande
    UPDATE public.orders
       SET statut = 'livré'
     WHERE id = new.order_id AND statut IN ('en_livraison', 'fonds_bloques');
  END IF;
  
  RETURN new;
END;
$function$;

-- Créer le trigger sur la table deliveries
DROP TRIGGER IF EXISTS on_delivery_complete ON public.deliveries;
CREATE TRIGGER on_delivery_complete
  AFTER UPDATE ON public.deliveries
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_buyer_on_delivery_complete();