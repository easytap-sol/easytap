-- Enforce Unique M-Pesa References to prevent duplicate transaction entries

-- 1. Loans: Unique Disbursement Reference
-- Note: disbursement_ref is nullable for pending loans, 
-- but Postgres UNIQUE constraint allows multiple NULLs while enforcing uniqueness for values.
ALTER TABLE loans 
ADD CONSTRAINT unique_disbursement_ref UNIQUE (disbursement_ref);

-- 2. Repayments: Unique Transaction Reference
ALTER TABLE repayments 
ADD CONSTRAINT unique_transaction_ref UNIQUE (transaction_ref);
