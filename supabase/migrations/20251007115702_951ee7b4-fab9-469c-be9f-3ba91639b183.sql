-- Add onboarding_completed column to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Update existing handle_new_user function to include onboarding status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $function$
BEGIN
  -- Insert into profiles table with onboarding status
  INSERT INTO public.profiles (id, display_name, onboarding_completed)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), FALSE);
  
  -- Insert into private data table if phone exists
  IF NEW.raw_user_meta_data->>'phone' IS NOT NULL THEN
    INSERT INTO public.user_private_data (id, phone)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'phone');
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Set onboarding_completed to FALSE for all existing users
UPDATE public.profiles SET onboarding_completed = FALSE WHERE onboarding_completed IS NULL;