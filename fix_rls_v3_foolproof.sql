-- ==========================================
-- FOOLPROOF RLS FIX (v3)
-- ==========================================

-- 1. RE-ESTABLISH SECURE ADMIN CHECK
-- This function bypasses RLS to check roles safely.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN 
LANGUAGE sql
SECURITY DEFINER 
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

-- 2. LOAN PRODUCTS POLICIES
ALTER TABLE public.loan_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage loan products" ON public.loan_products;
DROP POLICY IF EXISTS "Customers can view active loan products" ON public.loan_products;
DROP POLICY IF EXISTS "Everyone can select active products" ON public.loan_products;

-- Admin: Full Access
CREATE POLICY "Admins full access to products"
ON public.loan_products FOR ALL
TO authenticated
USING (public.is_admin());

-- Customer: Read Only (Active)
CREATE POLICY "Customers view active products"
ON public.loan_products FOR SELECT
TO authenticated
USING (is_active = true);


-- 3. LOANS POLICIES
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see own loans" ON public.loans;
DROP POLICY IF EXISTS "Admins can see all loans" ON public.loans;
DROP POLICY IF EXISTS "Users can insert own loans" ON public.loans;

-- Admin: Full Access
CREATE POLICY "Admins full access to loans"
ON public.loans FOR ALL
TO authenticated
USING (public.is_admin());

-- Customer: View Own
CREATE POLICY "Customers view own loans"
ON public.loans FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Customer: INSERT Own (CRITICAL FIX)
CREATE POLICY "Customers can apply for loans"
ON public.loans FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. REPAYMENTS POLICIES
ALTER TABLE public.repayments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage repayments" ON public.repayments;
DROP POLICY IF EXISTS "Users can see own repayments" ON public.repayments;

CREATE POLICY "Admins full access to repayments"
ON public.repayments FOR ALL
TO authenticated
USING (public.is_admin());

CREATE POLICY "Users view own repayments"
ON public.repayments FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 5. FINAL CHECK: Ensure Admin exists
-- Run this if your admin user still can't see things:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';
