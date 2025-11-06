-- Ajouter le rôle admin pour l'utilisateur orso.boka@uvci.edu.ci
INSERT INTO public.user_roles (user_id, role, is_active)
VALUES ('86f84d17-fc9a-4ab8-9c67-1c07af5f3129', 'admin'::app_role, true)
ON CONFLICT (user_id, role) DO UPDATE SET is_active = true;

-- Désactiver les autres rôles
UPDATE public.user_roles
SET is_active = false
WHERE user_id = '86f84d17-fc9a-4ab8-9c67-1c07af5f3129'
  AND role != 'admin'::app_role;