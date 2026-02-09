import { createClient } from "@/utils/supabase/server";
import {
  Users,
  Wallet,
  CreditCard,
  Activity,
  ArrowUpRight,
  TrendingUp,
  History,
  PieChart,
  ChevronRight,
  Briefcase,
  Zap,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  // 1. Fetch Core Data
  const [
    { count: customersCount },
    { data: loans },
    { data: recentUsers },
    { data: latestRepayments },
    { data: accounts }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from("loans").select("*, profiles!user_id(first_name, last_name)"),
    supabase.from("profiles").select("*").eq('role', 'customer').order('created_at', { ascending: false }).limit(5),
    supabase.from("repayments").select("*, profiles!user_id(first_name, last_name), loans(loan_ref)").order('created_at', { ascending: false }).limit(6),
    supabase.from("chart_of_accounts").select("id, name")
  ]);

  const safeLoans = loans || [];
  const interestAccountId = accounts?.find(a => a.name.toLowerCase().includes('interest income'))?.id;
  const feeAccountId = accounts?.find(a => a.name.toLowerCase().includes('processing fees'))?.id;

  // 2. Financial Analysis Logic (Same as before)
  let realizedInterest = 0;
  let realizedFees = 0;

  if (interestAccountId || feeAccountId) {
    const { data: ledgerEntries } = await supabase
      .from('ledger_entries')
      .select('amount, credit_account_id');

    ledgerEntries?.forEach(entry => {
      if (entry.credit_account_id === interestAccountId) realizedInterest += entry.amount;
      if (entry.credit_account_id === feeAccountId) realizedFees += entry.amount;
    });
  }

  const allTimeDisbursed = safeLoans
    .filter(l => l.status !== 'pending' && l.status !== 'rejected')
    .reduce((sum, l) => sum + (l.principal_amount || 0), 0);

  const activeLoans = safeLoans.filter(l => l.status === 'active');
  const pendingLoansCount = safeLoans.filter(l => l.status === 'pending').length;

  const outstandingPrincipal = activeLoans.reduce((sum, l) => {
    const ratio = (l.principal_amount || 0) / (l.total_payable || 1);
    return sum + ((l.balance_due || 0) * ratio);
  }, 0);

  const unrealizedInterest = activeLoans.reduce((sum, l) => {
    const ratio = (l.interest_amount || 0) / (l.total_payable || 1);
    return sum + ((l.balance_due || 0) * ratio);
  }, 0);

  const totalRevenue = realizedInterest + realizedFees;

  const totalExpected = safeLoans
    .filter(l => l.status !== 'pending' && l.status !== 'rejected')
    .reduce((sum, l) => sum + (l.total_payable || 0), 0);
  const totalCollected = safeLoans
    .filter(l => l.status !== 'pending' && l.status !== 'rejected')
    .reduce((sum, l) => sum + (l.amount_paid || 0), 0);
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  const now = new Date();
  const overdueLoans = activeLoans.filter(l =>
    l.due_date && new Date(l.due_date) < now && (l.balance_due || 0) > 0
  );

  // --- UI RENDER ---
  return (
    <div className="space-y-8">
      
      {/* 1. Header Hero Card */}
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 p-8 md:p-12 text-white shadow-2xl shadow-slate-900/10">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Executive Overview
            </h1>
            <p className="text-slate-400">
              Live financial portfolio analysis & performance metrics.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 px-6 py-3 backdrop-blur-sm border border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending</span>
              <span className={cn("text-2xl font-bold mt-1", pendingLoansCount > 0 ? "text-amber-400" : "text-white")}>
                {pendingLoansCount}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 px-6 py-3 backdrop-blur-sm border border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">At Risk</span>
              <span className={cn("text-2xl font-bold mt-1", overdueLoans.length > 0 ? "text-red-400" : "text-white")}>
                {overdueLoans.length}
              </span>
            </div>
          </div>
        </div>
        
        {/* Abstract Chart Background */}
        <Activity className="absolute -right-10 -bottom-10 h-64 w-64 text-white/5 rotate-12" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px]" />
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Disbursed */}
        <div className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Portfolio</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">KES {allTimeDisbursed.toLocaleString()}</p>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-500">
             <span>Outstanding:</span>
             <span className="text-slate-900 font-bold">KES {Math.round(outstandingPrincipal).toLocaleString()}</span>
          </div>
        </div>

        {/* Card 2: Revenue */}
        <div className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Revenue</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">KES {totalRevenue.toLocaleString()}</p>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-500">
             <span>Unrealized Interest:</span>
             <span className="text-slate-900 font-bold">KES {Math.round(unrealizedInterest).toLocaleString()}</span>
          </div>
        </div>

        {/* Card 3: Efficiency */}
        <div className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-50 text-violet-600 group-hover:scale-110 transition-transform">
              <PieChart className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recovery</span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-slate-900">{collectionRate}%</p>
            <span className="text-xs text-slate-400 mb-1 font-medium">Collection Rate</span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-violet-600 transition-all duration-1000" style={{ width: `${collectionRate}%` }} />
          </div>
        </div>

        {/* Card 4: Action */}
        <div className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-center items-center text-center">
           <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg mb-3 group-hover:-translate-y-1 transition-transform">
             <Zap className="h-6 w-6" />
           </div>
           <Link href="/admin/products" className="text-sm font-bold text-slate-900 hover:text-blue-600 flex items-center gap-1">
             Manage Products <ArrowUpRight className="h-3 w-3" />
           </Link>
           <p className="text-xs text-slate-400 mt-1">Configure interest & terms</p>
        </div>
      </div>

      {/* 3. Split Section: Transactions & Users */}
      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* LEFT: Recent Repayments (2 cols wide) */}
        <div className="lg:col-span-2 rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <History className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900">Recent Cash Inflow</h3>
            </div>
            <Link href="/admin/loans" className="text-xs font-bold text-blue-600 hover:underline">
              View Ledger
            </Link>
          </div>
          
          <div className="p-2">
            {!latestRepayments?.length ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Wallet className="h-10 w-10 mb-2 opacity-20" />
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {latestRepayments.map((rep: any) => (
                  <div key={rep.id} className="group flex items-center justify-between rounded-2xl px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{rep.profiles?.first_name} {rep.profiles?.last_name}</p>
                        <p className="text-xs font-medium text-slate-500">{rep.transaction_ref} • {new Date(rep.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 text-sm">+ KES {rep.amount.toLocaleString()}</p>
                      <p className="text-xs font-medium text-slate-400">{rep.loans?.loan_ref}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: New Users (1 col wide) */}
        <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
             <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <Users className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900">New Customers</h3>
            </div>
            <Link href="/admin/users" className="rounded-full bg-slate-100 p-1 hover:bg-slate-200 transition-colors">
              <MoreHorizontal className="h-4 w-4 text-slate-600" />
            </Link>
          </div>
          
          <div className="p-4 space-y-2">
            {recentUsers?.map((user: any) => (
              <Link href={`/admin/users/${user.id}`} key={user.id} className="flex items-center justify-between rounded-2xl p-3 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs uppercase border border-indigo-100 group-hover:scale-105 transition-transform">
                     {user.first_name?.[0]}{user.last_name?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{user.first_name} {user.last_name}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600" />
              </Link>
            ))}
            
            <Link href="/admin/users" className="mt-4 flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-colors">
              View All Customers
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}