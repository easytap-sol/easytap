-- 1. AGGRESSIVE CLEANUP: Remove ALL policies on the profiles table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON "public"."profiles"';
    END LOOP;
END $$;

-- 2. Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.is_admin();

-- 3. Create a secure function to check admin status (avoids recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Crucial: Runs with owner privileges, bypassing RLS recursion
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 4. Create Policies

-- Enable RLS just in case
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- READ: Users can read their own profile
CREATE POLICY "Users can see own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- READ: Admins can read ALL profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (is_admin());

-- UPDATE: Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- INSERT: Users can insert their own profile (for signup)
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- UPDATE: Admins can update any profile (for approvals, etc)
CREATE POLICY "Admins can update any profile" 
ON public.profiles FOR UPDATE 
USING (is_admin());
