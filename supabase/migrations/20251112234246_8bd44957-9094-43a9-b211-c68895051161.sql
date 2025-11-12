-- Fix search_path for security - Drop trigger first
DROP TRIGGER IF EXISTS update_live_streams_updated_at_trigger ON public.live_streams;
DROP FUNCTION IF EXISTS update_live_streams_updated_at() CASCADE;

-- Recreate function with proper security settings
CREATE OR REPLACE FUNCTION public.update_live_streams_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_live_streams_updated_at_trigger
  BEFORE UPDATE ON public.live_streams
  FOR EACH ROW
  EXECUTE FUNCTION update_live_streams_updated_at();