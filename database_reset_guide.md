# EasyTap Database Reset Guide

Before deploying to production, you may want to clear all "test" data (loans, repayments, test users) to start with a clean slate.

## ⚠️ WARNING
This process will **DELETE ALL DATA** in your database but will keep your table structures (schema) intact. This cannot be undone.

---

## Step 1: Run the Reset Script
Copy and paste the following SQL into your **Supabase SQL Editor**:

```sql
-- Disable triggers temporarily to avoid FK constraints issues during truncation
SET session_replication_role = 'replica';

-- Truncate all data tables
-- Note: ledger_entries must be cleared before the items they reference
TRUNCATE TABLE 
    ledger_entries,
    repayments,
    loans,
    loan_products,
    profiles,
    business_config
RESTART IDENTITY CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';
```

## Step 2: Clear Auth Users
If you are unable to delete users via the UI, run this SQL in the **SQL Editor** to wipe all Auth data:

```sql
-- This wipes all users from Supabase Auth
DELETE FROM auth.users;
```

## Step 3: Run Setup again
Once the database is empty:
1. Visit your app at `/setup`.
2. The system will detect it's uninitialized.
3. **Onboard Tenant**: Enter your **Company Name** (e.g., "Apex Finance") and your **Super Admin** details.
4. The system will automatically:
    - Create the Company record.
    - Initialize the default Chart of Accounts.
    - Create your Super Admin account.
5. You are now ready for market!

---

## 🔒 Production Security Tip
After your first admin is created, the `/setup` route will automatically lock itself. No one else will be able to use it to hijack your system.
