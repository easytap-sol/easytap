import { createClient } from "@/utils/supabase/server";
import { LoanApplicationForm } from "@/components/loans/loan-application-form";
import { Wallet, TrendingUp, Shield, Clock } from "lucide-react";
import { redirect } from "next/navigation";

export default async function CustomerApplyPage() {
  const supabase = await createClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch active products
  const { data: products } = await supabase
    .from("loan_products")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  // Get user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .single();

  // Get user's loan stats
  const { count: activeLoans } = await supabase
    .from("loans")
    .select("*", { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'active');

  const { count: paidLoans } = await supabase
    .from("loans")
    .select("*", { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'paid');

  return (
    <div className="space-y-8">

      {/* 1. Header Hero Card */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-900 to-slate-800 p-8 md:p-12 text-white shadow-2xl shadow-slate-900/10">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Apply for a Loan, {profile?.first_name || "Customer"}
            </h1>
            <p className="text-slate-400">
              Select a product and get instant approval. Funds disbursed to M-Pesa within minutes.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 px-6 py-3 backdrop-blur-sm border border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active</span>
              <span className="text-2xl font-bold mt-1 text-emerald-400">
                {activeLoans || 0}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 px-6 py-3 backdrop-blur-sm border border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Repaid</span>
              <span className="text-2xl font-bold mt-1 text-white">
                {paidLoans || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Abstract Background Elements */}
        <Wallet className="absolute -right-10 -bottom-10 h-64 w-64 text-white/5 rotate-12" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
      </div>

      {/* 2. Benefits & Features */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Quick Approval</h3>
              <p className="text-sm text-slate-500">Get approved in minutes</p>
            </div>
          </div>
          <p className="text-slate-600 text-sm">
            Automated review process with instant decision. No lengthy paperwork required.
          </p>
        </div>

        <div className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Flexible Terms</h3>
              <p className="text-sm text-slate-500">Choose what works for you</p>
            </div>
          </div>
          <p className="text-slate-600 text-sm">
            Multiple products with varying interest rates and durations to match your needs.
          </p>
        </div>

        <div className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-600 group-hover:scale-110 transition-transform">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Secure Process</h3>
              <p className="text-sm text-slate-500">Bank-level security</p>
            </div>
          </div>
          <p className="text-slate-600 text-sm">
            Your data is protected with end-to-end encryption and secure payment processing.
          </p>
        </div>
      </div>

      {/* 3. Main Application Form */}
      <LoanApplicationForm products={(products as any) || []} userId={user.id} />
    </div>
  );
}