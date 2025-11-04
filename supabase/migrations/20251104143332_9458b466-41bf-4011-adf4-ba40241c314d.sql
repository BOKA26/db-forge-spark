-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Recreate admin policies using the security definer function
CREATE POLICY "Admins can select all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  (auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));