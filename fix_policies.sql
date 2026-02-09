-- 1. Drop policies we plan to create (to avoid conflicts)
DROP POLICY IF EXISTS "Users can see own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Admins can view all profiles" ON "public"."profiles";
DROP POLICY IF EXISTS "Users can update own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Users can insert own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Admins can update any profile" ON "public"."profiles";

-- Also drop other potentially conflicting policies
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."profiles";
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON "public"."profiles";
DROP POLICY IF EXISTS "Users can insert their own profile." ON "public"."profiles";

-- 2. Create a secure function to check admin status (avoids recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Re-create simple, non-recursive policies

-- Allow users to read their own profile
CREATE POLICY "Users can see own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Allow admins to see ALL profiles (using the secure function)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (is_admin());

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Allow users to insert their own profile (for signup)
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow Admins to update any profile (for approval)
CREATE POLICY "Admins can update any profile" 
ON public.profiles FOR UPDATE 
USING (is_admin());
