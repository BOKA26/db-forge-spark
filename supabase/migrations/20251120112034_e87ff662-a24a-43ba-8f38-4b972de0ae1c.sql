-- Corriger la fonction update_courier_ratings_updated_at avec search_path
CREATE OR REPLACE FUNCTION public.update_courier_ratings_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;