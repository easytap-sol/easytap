-- 1. FIX LOAN PRODUCTS VISIBILITY
ALTER TABLE public.loan_products ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on loan_products to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage loan products" ON public.loan_products;
DROP POLICY IF EXISTS "Customers can view active loan products" ON public.loan_products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.loan_products;

-- Admin Policy: Direct role check (No recursion on loan_products)
CREATE POLICY "Admins can manage loan products"
ON public.loan_products
FOR ALL
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Customer Policy: View active only
CREATE POLICY "Customers can view active loan products"
ON public.loan_products
FOR SELECT
TO authenticated
USING (
  is_active = true
);

-- 2. FIX LOANS VISIBILITY (Ensure Admin can see applications)
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see own loans" ON public.loans;
DROP POLICY IF EXISTS "Admins can see all loans" ON public.loans;

CREATE POLICY "Users can see own loans"
ON public.loans
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can see all loans"
ON public.loans
FOR ALL
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 3. ENSURE PROFILES ACCESSIBLE FOR CHECKS
-- (Already handled by fix_policies_final.sql but good to reinforce)
-- Secure function check
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;
