-- Add is_active column to user_roles table
ALTER TABLE public.user_roles
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;