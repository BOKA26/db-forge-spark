-- Fix admin privilege escalation vulnerability
-- Restrict user_roles INSERT policy to prevent self-assignment of admin role

-- Drop the current permissive policy
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;

-- Create restricted policy: users can only insert non-admin roles for themselves
CREATE POLICY "Users can insert non-admin roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND role != 'admin'::app_role
);

-- Allow admins to insert any role (including admin)
CREATE POLICY "Admins can insert any role"
ON public.user_roles
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Note: The secure-admin-register edge function uses SERVICE_ROLE_KEY
-- which bypasses RLS, allowing it to securely assign admin roles after
-- validating the admin access code