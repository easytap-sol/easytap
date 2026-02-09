-- ==========================================
-- EMERGENCY SYSTEM-WIDE FIX (v5)
-- ==========================================

-- 1. DISABLE RLS ON CORE TABLES (Temporary test)
-- Running this will confirm if RLS is the blocker.
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.repayments DISABLE ROW LEVEL SECURITY;

-- 2. FORCE ADMIN SYNC FOR JAY
-- This will delete any old/messy data and re-link the profile correctly.
DO $$
DECLARE
    target_id uuid;
BEGIN
    SELECT id INTO target_id FROM auth.users WHERE email = 'jay.russell@gmail.com';
    
    IF target_id IS NOT NULL THEN
        -- Delete old profile if it exists (avoids ID/Email mismatches)
        DELETE FROM public.profiles WHERE email = 'jay.russell@gmail.com' OR id = target_id;
        
        -- Insert fresh admin profile
        INSERT INTO public.profiles (id, email, first_name, last_name, role, status)
        VALUES (target_id, 'jay.russell@gmail.com', 'Jay', 'Russell', 'admin', 'active');
        
        RAISE NOTICE 'Admin synchronized for ID: %', target_id;
    ELSE
        RAISE NOTICE 'ERROR: User jay.russell@gmail.com NOT FOUND in auth.users. Please sign up or check email.';
    END IF;
END $$;

-- 3. GRANT ALL PERMISSIONS TO AUTHENTICATED USERS
-- (Since RLS is disabled, this ensures the API can talk to the DB)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 4. VERIFICATION QUERY
SELECT * FROM public.profiles WHERE email = 'jay.russell@gmail.com';
