-- Auto-Confirm Emails for Supabase Auth
-- Run this in your Supabase SQL Editor to bypass email verification for all users.

CREATE OR REPLACE FUNCTION public.handle_auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Set email_confirmed_at to the current time for all new users
  NEW.email_confirmed_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on the auth.users table
-- Note: You might need to drop it first if it already exists
DROP TRIGGER IF EXISTS on_auth_user_created_confirm_email ON auth.users;
CREATE TRIGGER on_auth_user_created_confirm_email
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auto_confirm_email();
