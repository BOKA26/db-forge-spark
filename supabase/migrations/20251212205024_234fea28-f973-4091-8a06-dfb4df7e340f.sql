-- Allow admins to view all shops regardless of status
CREATE POLICY "Admins can view all shops" 
ON public.shops 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));