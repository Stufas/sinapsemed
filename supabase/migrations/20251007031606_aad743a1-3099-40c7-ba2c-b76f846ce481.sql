-- ==================================================================
-- SECURITY FIX: Complete Phone Number Migration to Private Table
-- ==================================================================

-- Step 1: Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own private data" ON public.user_private_data;
DROP POLICY IF EXISTS "Users can insert their own private data" ON public.user_private_data;
DROP POLICY IF EXISTS "Users can update their own private data" ON public.user_private_data;

-- Step 2: Recreate policies with proper security
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

-- Step 3: Migrate any remaining phone data from profiles if column still exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'phone'
  ) THEN
    -- Migrate existing phone numbers
    INSERT INTO public.user_private_data (id, phone)
    SELECT id, phone 
    FROM public.profiles 
    WHERE phone IS NOT NULL
    ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
    
    -- Drop the phone column from profiles
    ALTER TABLE public.profiles DROP COLUMN phone;
  END IF;
END $$;