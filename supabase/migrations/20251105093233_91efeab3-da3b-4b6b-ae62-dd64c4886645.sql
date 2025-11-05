-- ========================================
-- RLS POLICIES POUR BOKATRADE
-- ========================================

-- NOTIFICATIONS : S'assurer que users peuvent marquer comme lues
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;

CREATE POLICY "Users can update their notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());