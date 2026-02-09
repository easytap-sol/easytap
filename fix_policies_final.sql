-- 1. Disable RLS temporarily to ensure we can drop everything clean
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop all policies we know might exist
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."profiles";
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON "public"."profiles";
DROP POLICY IF EXISTS "Users can insert their own profile." ON "public"."profiles";
DROP POLICY IF EXISTS "Users can update own profile." ON "public"."profiles";
DROP POLICY IF EXISTS "Users can see own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Admins can view all profiles" ON "public"."profiles";
DROP POLICY IF EXISTS "Users can insert own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Admins can update any profile" ON "public"."profiles";
DROP POLICY IF EXISTS "read_own_profile" ON "public"."profiles";

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

-- 4. Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies

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
