-- Create trigger to automatically unlock payment when all three parties validate
CREATE TRIGGER trigger_unlock_payment_on_validation
  AFTER UPDATE ON public.validations
  FOR EACH ROW
  EXECUTE FUNCTION public.unlock_payment_on_full_validation();