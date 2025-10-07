-- Drop triggers first
DROP TRIGGER IF EXISTS groups_invite_code_trigger ON public.groups;
DROP TRIGGER IF EXISTS update_points_trigger ON public.user_activities;

-- Drop and recreate functions with proper search_path
DROP FUNCTION IF EXISTS generate_invite_code();
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code text;
BEGIN
  code := upper(substring(md5(random()::text) from 1 for 8));
  RETURN code;
END;
$$;

DROP FUNCTION IF EXISTS set_invite_code();
CREATE OR REPLACE FUNCTION set_invite_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := generate_invite_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS update_member_points();
CREATE OR REPLACE FUNCTION update_member_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.group_id IS NOT NULL THEN
    UPDATE public.group_members
    SET total_points = total_points + NEW.points
    WHERE group_id = NEW.group_id
    AND user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER groups_invite_code_trigger
BEFORE INSERT ON public.groups
FOR EACH ROW
EXECUTE FUNCTION set_invite_code();

CREATE TRIGGER update_points_trigger
AFTER INSERT ON public.user_activities
FOR EACH ROW
EXECUTE FUNCTION update_member_points();