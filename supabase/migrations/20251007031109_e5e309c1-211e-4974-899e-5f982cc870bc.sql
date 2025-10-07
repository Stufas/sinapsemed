-- ==================================================================
-- SECURITY FIX: Restrict Profile Access & Prevent Phone Exposure
-- ==================================================================

-- Step 1: Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Step 2: Add restrictive policy - users can only view their own full profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Step 3: Create security definer function to check if users share a group
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.is_group_member_with(check_user_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members gm1
    INNER JOIN public.group_members gm2 
      ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = check_user_id
      AND gm2.user_id = target_user_id
  );
$$;

-- Step 4: Add policy allowing group members to see each other's profiles
-- This only exposes profiles to users who share a group
CREATE POLICY "Group members can view each other profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_group_member_with(auth.uid(), id));

-- Step 5: Fix infinite recursion in group_members policy
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;

-- Create new non-recursive policy
CREATE POLICY "Users can view members of their groups"
  ON public.group_members
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR 
    public.is_group_member_with(auth.uid(), user_id)
  );

-- Add helpful comments
COMMENT ON FUNCTION public.is_group_member_with IS 'Checks if two users share at least one group. Used to prevent infinite recursion in RLS policies.';
COMMENT ON POLICY "Group members can view each other profiles" ON public.profiles IS 'Allows users to view profiles of other users they share a group with. Note: Consider if phone numbers should be visible to group members.';