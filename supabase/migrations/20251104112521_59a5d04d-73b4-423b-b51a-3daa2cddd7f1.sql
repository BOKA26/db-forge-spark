-- Fix linter warnings: set stable search_path for trigger functions
ALTER FUNCTION public.ensure_validation_row() SET search_path = public;
ALTER FUNCTION public.unlock_payment_on_full_validation() SET search_path = public;