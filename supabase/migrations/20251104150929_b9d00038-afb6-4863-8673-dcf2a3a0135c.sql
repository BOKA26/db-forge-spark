-- Fix notification RLS policy to allow authenticated users to insert notifications
-- This resolves the issue where client-side code fails to create notifications

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admin can insert notifications" ON public.notifications;

-- Create a new policy allowing authenticated users to insert notifications
-- Users can create notifications for any user (needed for order flow notifications)
CREATE POLICY "Authenticated users can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Note: RLS on SELECT already protects who can view notifications
-- The INSERT policy is permissive because the application logic determines
-- valid notification recipients based on order relationships