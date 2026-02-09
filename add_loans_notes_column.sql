-- Add notes column to loans table
-- This allows admins to add notes when creating loans for customers

ALTER TABLE loans 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN loans.notes IS 'Optional notes added by admin when creating or managing the loan';
