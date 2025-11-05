-- Vérifier que l'enum app_role contient tous les rôles nécessaires
-- Si l'enum n'a pas tous les rôles, les ajouter
DO $$ 
BEGIN
    -- Ajouter 'acheteur' s'il n'existe pas
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'acheteur' AND enumtypid = 'app_role'::regtype) THEN
        ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'acheteur';
    END IF;
END $$;

-- Créer un trigger pour assigner automatiquement le rôle 'acheteur' à chaque nouvel utilisateur
CREATE OR REPLACE FUNCTION public.assign_default_buyer_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insérer automatiquement le rôle acheteur actif pour tout nouvel utilisateur
  INSERT INTO public.user_roles (user_id, role, is_active)
  VALUES (NEW.id, 'acheteur'::app_role, true)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_assign_buyer ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_buyer
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_buyer_role();