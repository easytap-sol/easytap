-- 1. Enforce Unique Phone Number
ALTER TABLE public.profiles ADD CONSTRAINT unique_mobile_number UNIQUE (mobile_number);

-- 2. Add Fee and Penalty fields to Loan Products
ALTER TABLE public.loan_products ADD COLUMN IF NOT EXISTS processing_fee NUMERIC DEFAULT 0;
ALTER TABLE public.loan_products ADD COLUMN IF NOT EXISTS penalty_rate NUMERIC DEFAULT 0;
ALTER TABLE public.loan_products ADD COLUMN IF NOT EXISTS description TEXT;

-- 3. Add Rejection Reason to Loans
ALTER TABLE public.loans ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
