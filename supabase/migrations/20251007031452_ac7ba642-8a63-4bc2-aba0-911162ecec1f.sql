-- ==================================================================
-- SECURITY FIX: Prevent Users from Manipulating Points
-- ==================================================================

-- Prevent users from updating group_members records
-- Points should only be updated by the system via triggers
CREATE POLICY "Users cannot update group member records"
  ON public.group_members
  FOR UPDATE
  USING (false);

-- Add comment explaining the security measure
COMMENT ON POLICY "Users cannot update group member records" ON public.group_members IS 'Prevents users from manipulating their own points. Only system triggers can update total_points.';