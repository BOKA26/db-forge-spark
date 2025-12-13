-- Supprimer les anciens triggers s'ils existent
DROP TRIGGER IF EXISTS on_user_created_assign_role ON public.users;
DROP TRIGGER IF EXISTS assign_buyer_role_trigger ON public.users;

-- Créer le trigger pour assigner automatiquement le rôle acheteur actif
CREATE TRIGGER on_user_created_assign_role
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();