-- ==========================================
-- FINAL DIAGNOSTIC & RLS REPAIR SCRIPT (v4)
-- ==========================================

-- 1. DIAGNOSTICS: Run this first to see your current status
-- (You can see these results in the 'Results' tab after running)
SELECT 'CURRENT_USER_ID' as label, auth.uid()::text as value
UNION ALL
SELECT 'CURRENT_USER_ROLE' as label, (SELECT role FROM profiles WHERE id = auth.uid()) as value;

-- 2. RESET PROFILES RLS (Solve recursion)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Create a robust non-recursive admin check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN 
LANGUAGE sql
SECURITY DEFINER -- Runs as owner, bypassing RLS
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SIMPLE POLICIES FOR PROFILES
CREATE POLICY "Users see own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins see all profiles" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins update all profiles" ON profiles FOR UPDATE USING (is_admin());
CREATE POLICY "Public insert" ON profiles FOR INSERT WITH CHECK (true); -- Allow signup

-- 3. FIX LOAN PRODUCTS
ALTER TABLE public.loan_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access to products" ON public.loan_products;
DROP POLICY IF EXISTS "Customers view active products" ON public.loan_products;
DROP POLICY IF EXISTS "Admins can manage loan products" ON public.loan_products;
DROP POLICY IF EXISTS "Customers can view active loan products" ON public.loan_products;

CREATE POLICY "Admins manage everything" ON public.loan_products FOR ALL USING (is_admin());
CREATE POLICY "Customers see active" ON public.loan_products FOR SELECT USING (is_active = true);

-- 4. FIX LOANS
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access to loans" ON public.loans;
DROP POLICY IF EXISTS "Customers view own loans" ON public.loans;
DROP POLICY IF EXISTS "Customers can apply for loans" ON public.loans;

CREATE POLICY "Admins manage loans" ON public.loans FOR ALL USING (is_admin());
CREATE POLICY "Users see own loans" ON public.loans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users apply for loans" ON public.loans FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. FIX REPAYMENTS
ALTER TABLE public.repayments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access to repayments" ON public.repayments;
DROP POLICY IF EXISTS "Users view own repayments" ON public.repayments;

CREATE POLICY "Admins manage repayments" ON public.repayments FOR ALL USING (is_admin());
CREATE POLICY "Users see own repayments" ON public.repayments FOR SELECT USING (auth.uid() = user_id);

-- 6. GRANT PERMISSIONS
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- 7. FORCE ADMIN (Optional: Run this if you are not an admin)
-- UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID_FROM_DIAGNOSTICS';
