# Multi-Tenant Replication Guide

This document explains how to set up EasyTap for a new client (tenant) using a fresh Supabase project.

## Step 1: Export & Apply Schema
To replicate the database structure:
1. Go to your **existing** project's Supabase SQL Editor.
2. We have provided several SQL files in the root that contain the schema and fixes. You should consolidate these or use a tools like `supabase db pull` if you are using the CLI.
3. **Essential Scripts**: Apply these in order to your **new** project:
    - `phase2_schema.sql` (Base tables)
    - `fix_rls_final_v4.sql` (Core Security & RBAC)
    - `production_guardrails.sql` (Uniqueness constraints)
    - `auto_confirm_emails.sql` (Optional: Bypasses email verification)

## Step 2: Configure Environment
1. Create a new project on **Vercel** (or your hosting provider).
2. Connect your repository.
3. Set the following **Environment Variables** in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your new Supabase project URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your new Supabase anon key.

## Step 3: Initialization (The Onboarding)
Once the code is deployed and connected to the new database:
1. Visit `https://your-client-app.com/setup`.
2. Enter the **Client's Company Name**.
3. Create the **Super Admin** account for the client's representative.
4. The system will automatically initialize their:
   - Company Profile
   - Default Chart of Accounts
   - Super Admin Access

## 🔄 Repeat for Every Client
Because EasyTap is designed for sovereignty, each client gets their own dedicated database instance. This ensures maximum security and performance isolation.

---

### 🚀 Pro Tip: Supabase CLI
For a more professional workflow, use the **Supabase CLI**:
1. `supabase init`
2. `supabase login`
3. `supabase link --project-ref your-existing-project`
4. `supabase db pull`
5. Then for a new project: `supabase db push`
