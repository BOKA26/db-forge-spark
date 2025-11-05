-- Vérifier et créer le trigger pour assigner automatiquement le rôle acheteur
-- lors de l'inscription d'un nouvel utilisateur

-- Supprimer le trigger existant s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_role();