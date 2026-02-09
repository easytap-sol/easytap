-- 1. Ensure RLS is enabled
ALTER TABLE loan_products ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to be clean
DROP POLICY IF EXISTS "Admins can manage loan products" ON loan_products;
DROP POLICY IF EXISTS "Customers can view active loan products" ON loan_products;

-- 3. Create Simplified Admin Policy
-- We directly check the profile role. This is safe on 'loan_products' table (no recursion).
CREATE POLICY "Admins can manage loan products"
ON loan_products
FOR ALL
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 4. Create Customer Policy
CREATE POLICY "Customers can view active loan products"
ON loan_products
FOR SELECT
USING (
  is_active = true
);
