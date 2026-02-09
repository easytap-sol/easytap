-- Enable RLS just in case
ALTER TABLE loan_products ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can do ANYTHING with loan_products
DROP POLICY IF EXISTS "Admins can manage loan products" ON loan_products;
CREATE POLICY "Admins can manage loan products"
ON loan_products
FOR ALL
USING (
  public.is_admin()
);

-- Policy: Everyone (Customers) can VIEW active loan products
DROP POLICY IF EXISTS "Customers can view active loan products" ON loan_products;
CREATE POLICY "Customers can view active loan products"
ON loan_products
FOR SELECT
USING (
  is_active = true
);

-- Ensure public.is_admin() is executable
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;
