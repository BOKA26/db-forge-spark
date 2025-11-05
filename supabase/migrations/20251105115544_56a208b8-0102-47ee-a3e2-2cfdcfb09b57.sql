-- Insérer tous les utilisateurs auth existants dans la table users
INSERT INTO public.users (id, email, nom, telephone, statut)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'nom', ''),
  COALESCE(raw_user_meta_data->>'telephone', ''),
  'actif'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;