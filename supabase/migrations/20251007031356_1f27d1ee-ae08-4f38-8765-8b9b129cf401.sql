-- ==================================================================
-- SECURITY FIX: Move Phone Numbers to Private Table
-- ==================================================================

-- Step 1: Create a private table for sensitive user data
CREATE TABLE IF NOT EXISTS public.user_private_data (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  phone text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Step 2: Enable RLS on the new table
ALTER TABLE public.user_private_data ENABLE ROW LEVEL SECURITY;

-- Step 3: Create strict owner-only policies
CREATE POLICY "Users can view their own private data"
  ON public.user_private_data
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own private data"
  ON public.user_private_data
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own private data"
  ON public.user_private_data
  FOR UPDATE
  USING (auth.uid() = id);

-- Step 4: Migrate existing phone numbers to the private table
INSERT INTO public.user_private_data (id, phone)
SELECT id, phone 
FROM public.profiles 
WHERE phone IS NOT NULL
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;

-- Step 5: Remove phone column from profiles table
-- This makes phone numbers inaccessible to group members
ALTER TABLE public.profiles DROP COLUMN IF EXISTS phone;

-- Step 6: Update the handle_new_user function to also create private data entry
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  
  -- Insert into private data table if phone exists
  IF NEW.raw_user_meta_data->>'phone' IS NOT NULL THEN
    INSERT INTO public.user_private_data (id, phone)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'phone');
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Add helpful comments
COMMENT ON TABLE public.user_private_data IS 'Stores sensitive user information that should never be shared, even with group members. Only the owner can access their own data.';
COMMENT ON POLICY "Users can view their own private data" ON public.user_private_data IS 'Ensures phone numbers and other sensitive data remain completely private.';