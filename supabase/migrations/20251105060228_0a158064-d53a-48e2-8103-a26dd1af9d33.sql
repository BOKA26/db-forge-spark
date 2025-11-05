-- Drop the defective policy
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;

-- Recreate with correct syntax (both USING and WITH CHECK)
CREATE POLICY "Users can update their own roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure SELECT policy exists
DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Ensure INSERT policy exists with correct naming
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;
CREATE POLICY "Users can insert their own roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);