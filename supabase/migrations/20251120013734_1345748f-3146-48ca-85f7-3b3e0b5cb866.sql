-- Fonction pour créer automatiquement le rôle acheteur
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Créer le rôle acheteur par défaut, actif
  INSERT INTO public.user_roles (user_id, role, is_active)
  VALUES (NEW.id, 'acheteur'::app_role, true)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger qui s'exécute après l'insertion dans la table users
DROP TRIGGER IF EXISTS on_user_created_role ON public.users;

CREATE TRIGGER on_user_created_role
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();