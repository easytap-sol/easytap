import { createClient } from "@/utils/supabase/server";
import { AdminLoanCard } from "@/components/admin/admin-loan-card";
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

export default async function AdminLoansPage() {
  const supabase = await createClient();

  // Fetch loans with related data
  const { data: loans } = await supabase
    .from("loans")
    .select(`
      *,
      profiles:user_id (first_name, last_name, email, mobile_number, national_id),
      loan_products:product_id (name, interest_rate, duration_days),
      repayments (*)
    `)
    .order("created_at", { ascending: false });

  // Calculate stats
  const totalLoans = loans?.length || 0;
  const pendingLoans = loans?.filter(l => l.status === 'pending').length || 0;
  const activeLoans = loans?.filter(l => l.status === 'active').length || 0;
  const totalDisbursed = loans
    ?.filter(l => l.status === 'active' || l.status === 'paid')
    .reduce((sum, l) => sum + (l.principal_amount || 0), 0) || 0;

  return (
    <div className="space-y-8">

      {/* 1. Header Hero Card */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-900 to-slate-800 p-8 md:p-12 text-white shadow-2xl shadow-slate-900/10">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Loan Portfolio
            </h1>
            <p className="text-slate-400">
              Manage loan applications, disbursements, and repayment tracking.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 px-6 py-3 backdrop-blur-sm border border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active</span>
              <span className="text-2xl font-bold mt-1 text-emerald-400">{activeLoans}</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 px-6 py-3 backdrop-blur-sm border border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending</span>
              <span className={cn(
                "text-2xl font-bold mt-1",
                pendingLoans > 0 ? "text-amber-400" : "text-white"
              )}>
                {pendingLoans}
              </span>
            </div>
          </div>
        </div>

        {/* Abstract Background Elements */}
        <DollarSign className="absolute -right-10 -bottom-10 h-64 w-64 text-white/5 rotate-12" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
      </div>

      {/* 2. Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalLoans}</p>
          <p className="text-sm text-slate-500 mt-1">Loan Applications</p>
        </div>

        <div className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Disbursed</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">KES {totalDisbursed.toLocaleString()}</p>
          <p className="text-sm text-slate-500 mt-1">Total Portfolio</p>
        </div>

        <div className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <AlertCircle className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Review</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">{pendingLoans}</p>
          <p className="text-sm text-slate-500 mt-1">Awaiting Approval</p>
        </div>

        <div className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <CheckCircle className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Closed</span>
          </div>
          <p className="text-2xl font-bold text-primary">
            {loans?.filter(l => l.status === 'paid').length || 0}
          </p>
          <p className="text-sm text-slate-500 mt-1">Fully Repaid</p>
        </div>
      </div>

      {/* 3. Loan Applications List */}
      <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <DollarSign className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900">All Loan Applications</h3>
            </div>
            <div className="text-sm font-bold text-slate-500">
              Showing {totalLoans} loans • Sorted by Newest
            </div>
          </div>
        </div>

        <div className="p-2">
          {loans?.length ? (
            <div className="space-y-4">
              {loans.map((loan: any) => (
                <AdminLoanCard key={loan.id} loan={loan} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <DollarSign className="h-16 w-16 mb-4 opacity-20" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">No loan applications</h3>
              <p className="text-slate-500">When customers apply for loans, they'll appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";