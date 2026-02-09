-- ==========================================
-- FINAL ADMIN RLS & ROLE FIX (CONSOLIDATED)
-- ==========================================

-- 1. FORCE ADMIN ROLE (Replace with your email)
-- This ensures your account is actually an admin in the database.
DO $$
DECLARE
    target_user_id uuid;
    admin_email text := 'YOUR_EMAIL@EXAMPLE.COM'; -- REPLACE THIS
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = admin_email;
    
    IF target_user_id IS NOT NULL THEN
        -- Force Profile to be Admin and Active
        INSERT INTO public.profiles (id, email, role, status)
        VALUES (target_user_id, admin_email, 'admin', 'active')
        ON CONFLICT (id) DO UPDATE SET role = 'admin', status = 'active';
        
        RAISE NOTICE 'Success: User % is now an Admin.', target_user_id;
    ELSE
        RAISE NOTICE 'Warning: User with email % not found in auth.users. Please log in first.', admin_email;
    END IF;
END $$;


-- 2. ROBUST NON-RECURSIVE ADMIN CHECK
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN 
LANGUAGE sql
SECURITY DEFINER 
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;


-- 3. APPLY POLICIES (Simple & Robust)

-- PROFILES: Admin can see everything, users see own.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own profile" ON profiles;
DROP POLICY IF EXISTS "Admins see all profiles" ON profiles;
CREATE POLICY "Profiles readable for role checks" ON profiles FOR SELECT USING (true); -- Essential for RLS subqueries
CREATE POLICY "Admins manage all profiles" ON profiles FOR ALL USING (is_admin());
CREATE POLICY "Users view own" ON profiles FOR SELECT USING (auth.uid() = id);

-- LOAN PRODUCTS: Admin manage, customers see active.
ALTER TABLE public.loan_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage products" ON loan_products;
DROP POLICY IF EXISTS "Customers see active products" ON loan_products;
CREATE POLICY "Admin full access products" ON loan_products FOR ALL USING (is_admin());
CREATE POLICY "Customers view active" ON loan_products FOR SELECT USING (is_active = true);

-- LOANS: Admin manage all, customers see/apply own.
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage loans" ON loans;
DROP POLICY IF EXISTS "Users see/apply own" ON loans;
CREATE POLICY "Admin full access loans" ON loans FOR ALL USING (is_admin());
CREATE POLICY "Users view own loans" ON loans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users apply own loans" ON loans FOR INSERT WITH CHECK (auth.uid() = user_id);

-- REPAYMENTS
ALTER TABLE public.repayments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage repayments" ON repayments;
DROP POLICY IF EXISTS "Users see repayments" ON repayments;
CREATE POLICY "Admin full access repayments" ON repayments FOR ALL USING (is_admin());
CREATE POLICY "Users view own repayments" ON repayments FOR SELECT USING (auth.uid() = user_id);
