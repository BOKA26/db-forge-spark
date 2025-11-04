-- Drop the old restrictive INSERT policy
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;

-- Create new policy allowing users to insert their own role during signup
CREATE POLICY "Users can insert own role during signup"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));