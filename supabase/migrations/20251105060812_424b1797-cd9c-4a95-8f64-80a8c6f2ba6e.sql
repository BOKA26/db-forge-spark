-- Supprimer toutes les anciennes policies
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can deactivate their previous roles" ON public.user_roles;

-- 1️⃣ Lecture : voir uniquement ses propres rôles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2️⃣ Insertion : créer des rôles pour soi-même
CREATE POLICY "Users can insert their own roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3️⃣ Mise à jour : modifier ou basculer entre ses rôles (couvre aussi la désactivation)
CREATE POLICY "Users can update their own roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Activer le RLS (si pas encore fait)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;