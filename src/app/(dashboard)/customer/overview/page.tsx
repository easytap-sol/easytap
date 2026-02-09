import { createClient } from "@/utils/supabase/server";
import {
  CreditCard, Calendar, ArrowUpRight, Clock, CheckCircle,
  AlertCircle, DollarSign, TrendingUp, PieChart, Users,
  Wallet, Zap, History, ChevronRight, MoreHorizontal,
  Eye, FileText, TrendingDown, Repeat, BadgePercent
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function CustomerOverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Please log in.</div>;

  // Fetch customer profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch all loans with repayments and products
  const { data: loans } = await supabase
    .from("loans")
    .select(`
      *,
      loan_products(name, interest_rate, duration_days),
      repayments(*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const safeLoans = loans || [];

  // Categorize loans
  const activeLoans = safeLoans.filter((l: any) => l.status === 'active');
  const pendingLoans = safeLoans.filter((l: any) => l.status === 'pending');
  const paidLoans = safeLoans.filter((l: any) => l.status === 'paid');
  const rejectedLoans = safeLoans.filter((l: any) => l.status === 'rejected');

  // Calculate financial metrics
  const totalBorrowed = safeLoans
    .filter((l: any) => l.status !== 'pending' && l.status !== 'rejected')
    .reduce((sum, l) => sum + (l.principal_amount || 0), 0);

  const totalRepaid = safeLoans
    .filter((l: any) => l.status !== 'pending' && l.status !== 'rejected')
    .reduce((sum, l) => sum + (l.amount_paid || 0), 0);

  const currentBalance = activeLoans.reduce((sum, l) => sum + (l.balance_due || 0), 0);
  const totalPayable = activeLoans.reduce((sum, l) => sum + (l.total_payable || 0), 0);
  const amountPaid = activeLoans.reduce((sum, l) => sum + (l.amount_paid || 0), 0);

  const repaymentRate = totalPayable > 0 ? Math.round((amountPaid / totalPayable) * 100) : 0;

  // Calculate credit health score based on loan history
  const calculateCreditHealth = () => {
    if (safeLoans.length === 0) return { score: 0, level: 'No data' };

    let score = 500; // Base score

    // Positive factors
    if (paidLoans.length > 0) score += 200;
    if (totalRepaid > totalBorrowed * 0.8) score += 100;
    if (overdueLoans.length === 0) score += 100;
    if (activeLoans.length === 0 && paidLoans.length > 0) score += 100;

    // Negative factors
    if (overdueLoans.length > 0) score -= 150;
    if (rejectedLoans.length > 0) score -= 50;
    if (activeLoans.length > 2) score -= 50; // Too many active loans

    // Cap score between 0-1000
    score = Math.max(0, Math.min(1000, score));

    // Determine level
    let level = 'Poor';
    if (score >= 700) level = 'Excellent';
    else if (score >= 500) level = 'Good';
    else if (score >= 300) level = 'Fair';

    return { score, level };
  };

  // Check for overdue loans with null checks
  const now = new Date();
  const overdueLoans = activeLoans.filter((l: any) => {
    if (!l.due_date) return false;
    const dueDate = new Date(l.due_date);
    return dueDate < now && (l.balance_due || 0) > 0;
  });

  // Calculate next payment date with null checks
  let nextPaymentDate = null;
  let nextPaymentAmount = 0;

  if (activeLoans.length > 0) {
    const upcomingLoans = activeLoans
      .filter(l => l.due_date)
      .sort((a, b) => {
        const dateA = new Date(a.due_date!);
        const dateB = new Date(b.due_date!);
        return dateA.getTime() - dateB.getTime();
      });

    if (upcomingLoans.length > 0 && upcomingLoans[0].due_date) {
      nextPaymentDate = new Date(upcomingLoans[0].due_date);
      nextPaymentAmount = upcomingLoans[0].balance_due || 0;
    }
  }

  // Format date safely
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  // Format date time safely
  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  const creditHealth = calculateCreditHealth();

  return (
    <div className="space-y-8">

      {/* 1. Header Hero Card */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-900 to-slate-800 p-8 md:p-12 text-white shadow-2xl shadow-slate-900/10">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Welcome back, {profile?.first_name || "Customer"}!
            </h1>
            <p className="text-slate-400">
              Track your loans, payments, and credit health in one place.
            </p>
          </div>

          <div className="flex gap-4">
            {activeLoans.length > 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 px-6 py-3 backdrop-blur-sm border border-white/5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active</span>
                <span className="text-2xl font-bold mt-1 text-emerald-400">
                  {activeLoans.length}
                </span>
              </div>
            )}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 px-6 py-3 backdrop-blur-sm border border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Repaid</span>
              <span className="text-2xl font-bold mt-1 text-white">
                {paidLoans.length}
              </span>
            </div>
          </div>
        </div>

        {/* Abstract Background Elements */}
        <Wallet className="absolute -right-10 -bottom-10 h-64 w-64 text-white/5 rotate-12" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        {/* Card 1: Current Balance */}
        <div className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Balance</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">KES {currentBalance.toLocaleString()}</p>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-500">
            <span>Total Payable:</span>
            <span className="text-slate-900 font-bold">KES {totalPayable.toLocaleString()}</span>
          </div>
        </div>

        {/* Card 2: Next Payment */}
        <div className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              nextPaymentDate && nextPaymentDate < now
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-emerald-600"
            )}>
              <Calendar className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next Due</span>
          </div>
          {nextPaymentDate ? (
            <>
              <p className={cn(
                "text-2xl font-bold",
                nextPaymentDate < now ? "text-red-600" : "text-slate-900"
              )}>
                {nextPaymentDate.toLocaleDateString()}
              </p>
              <div className="mt-2 text-xs font-medium text-slate-500">
                {nextPaymentDate < now ? (
                  <span className="text-red-600 font-bold">OVERDUE: KES {nextPaymentAmount.toLocaleString()}</span>
                ) : (
                  <span>KES {nextPaymentAmount.toLocaleString()}</span>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-slate-900">No due date</p>
              <div className="mt-2 text-xs text-slate-500">No active loans</div>
            </>
          )}
        </div>

        {/* Card 3: Repayment Progress */}
        <div className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-50 text-violet-600 group-hover:scale-110 transition-transform">
              <PieChart className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-slate-900">{repaymentRate}%</p>
            <span className="text-xs text-slate-400 mb-1 font-medium">Paid</span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-600 transition-all duration-1000"
              style={{ width: `${repaymentRate}%` }}
            />
          </div>
        </div>

        {/* Card 4: Quick Action */}
        <div className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-center items-center text-center">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg mb-3 group-hover:-translate-y-1 transition-transform",
            pendingLoans.length > 0 ? "bg-amber-100 text-amber-600" : "bg-slate-900 text-white"
          )}>
            {pendingLoans.length > 0 ? <Clock className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
          </div>
          {pendingLoans.length > 0 ? (
            <Link href="/customer/loans" className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
              View Pending <ArrowUpRight className="h-3 w-3" />
            </Link>
          ) : (
            <Link href="/customer/apply" className="text-sm font-bold text-slate-900 hover:text-primary flex items-center gap-1">
              Apply Now <ArrowUpRight className="h-3 w-3" />
            </Link>
          )}
          <p className="text-xs text-slate-400 mt-1">
            {pendingLoans.length > 0 ? `${pendingLoans.length} application(s) pending` : "Get a new loan"}
          </p>
        </div>
      </div>

      {/* 3. Active Loans Section */}
      <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-slate-900">Active Loans</h3>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
              {activeLoans.length} active
            </span>
          </div>
          <Link href="/customer/loans" className="text-xs font-bold text-primary hover:underline">
            View All Loans
          </Link>
        </div>

        <div className="p-4">
          {activeLoans.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeLoans.map((loan: any) => {
                const loanProgress = loan.total_payable ? Math.round(((loan.amount_paid || 0) / loan.total_payable) * 100) : 0;
                const isOverdue = loan.due_date && new Date(loan.due_date) < now && (loan.balance_due || 0) > 0;

                return (
                  <div key={loan.id} className="group rounded-[2rem] border border-slate-100 p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-slate-900">{loan.loan_products?.name || "Loan"}</h4>
                        <p className="text-xs text-slate-500">Ref: {loan.loan_ref}</p>
                      </div>
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                        isOverdue ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                      )}>
                        {isOverdue ? <AlertCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                        {isOverdue ? "Overdue" : "Active"}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">Progress</span>
                          <span className="font-bold text-slate-900">{loanProgress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-1000"
                            style={{ width: `${loanProgress}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Balance</p>
                          <p className="font-bold text-slate-900">KES {loan.balance_due?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Due Date</p>
                          <p className={cn(
                            "font-bold",
                            isOverdue ? "text-red-600" : "text-slate-900"
                          )}>
                            {formatDate(loan.due_date)}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <Link
                          href={`/customer/loans/${loan.id}`}
                          className="flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
                <Wallet className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No active loans</h3>
              <p className="text-slate-500 mb-6 max-w-sm">
                You don't have any active loans at the moment.
              </p>
              <Link
                href="/customer/apply"
                className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-deep shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              >
                Apply for a Loan
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 4. Split Section: Recent Activity & Credit Health */}
      <div className="grid gap-8 lg:grid-cols-3">

        {/* LEFT: Recent Transactions (2 cols wide) */}
        <div className="lg:col-span-2 rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <History className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900">Recent Activity</h3>
            </div>
            <Link href="/customer/transactions" className="text-xs font-bold text-primary hover:underline">
              View All
            </Link>
          </div>

          <div className="p-4">
            {/* Combine repayments from all loans */}
            {(() => {
              const allRepayments = safeLoans.flatMap((loan: any) =>
                (loan.repayments || []).map((rep: any) => ({ ...rep, loan_ref: loan.loan_ref }))
              ).sort((a, b) => {
                const dateA = a.payment_date || a.created_at;
                const dateB = b.payment_date || b.created_at;
                if (!dateA || !dateB) return 0;
                return new Date(dateB).getTime() - new Date(dateA).getTime();
              })
                .slice(0, 6);

              return allRepayments.length > 0 ? (
                <div className="space-y-2">
                  {allRepayments.map((rep: any) => (
                    <div key={rep.id} className="group flex items-center justify-between rounded-2xl px-6 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">Loan Repayment</p>
                          <p className="text-xs font-medium text-slate-500">
                            {rep.loan_ref} • {formatDate(rep.payment_date || rep.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600 text-sm">- KES {rep.amount.toLocaleString()}</p>
                        <p className="text-xs font-medium text-slate-400">Ref: {rep.transaction_ref || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <CreditCard className="h-10 w-10 mb-2 opacity-20" />
                  <p>No recent transactions</p>
                </div>
              );
            })()}
          </div>
        </div>

        {/* RIGHT: Credit Health & Stats (1 col wide) */}
        <div className="rounded-[2.5rem] border border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-sm overflow-hidden">
          <div className="border-b border-white/10 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <BadgePercent className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-white">Credit Health</h3>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Credit Score (calculated, not from database) */}
            <div className="text-center">
              <div className="mb-2">
                <p className="text-sm text-slate-400">Credit Health Score</p>
                <p className="text-3xl font-bold text-white">
                  {creditHealth.score}
                  <span className="text-sm text-slate-400 ml-2">/1000</span>
                </p>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                  style={{ width: `${(creditHealth.score / 1000) * 100}%` }}
                />
              </div>
              <p className="text-xs font-bold text-emerald-400 mt-2">
                {creditHealth.level}
              </p>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Total Borrowed</span>
                <span className="font-bold">KES {totalBorrowed.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Total Repaid</span>
                <span className="font-bold text-emerald-400">KES {totalRepaid.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">On-time Loans</span>
                <span className="font-bold">
                  {paidLoans.length} of {safeLoans.filter(l => l.status !== 'pending' && l.status !== 'rejected').length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Overdue</span>
                <span className={cn(
                  "font-bold",
                  overdueLoans.length > 0 ? "text-red-400" : "text-emerald-400"
                )}>
                  {overdueLoans.length} loans
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-white/10">
              <Link
                href="/customer/loans"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/10 text-sm font-bold text-white hover:bg-white/20 transition-colors"
              >
                <FileText className="h-4 w-4" />
                View Loan History
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Loan History Summary */}
      <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <Repeat className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-slate-900">Loan History</h3>
          </div>
          <div className="flex gap-2">
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {safeLoans.length} total
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100">
              <p className="text-2xl font-bold text-emerald-700">{activeLoans.length}</p>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mt-1">Active</p>
            </div>
            <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20">
              <p className="text-2xl font-bold text-primary-deep">{paidLoans.length}</p>
              <p className="text-xs font-bold text-primary uppercase tracking-wider mt-1">Paid</p>
            </div>
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100">
              <p className="text-2xl font-bold text-amber-700">{pendingLoans.length}</p>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mt-1">Pending</p>
            </div>
            <div className="p-6 rounded-2xl bg-red-50 border border-red-100">
              <p className="text-2xl font-bold text-red-700">{rejectedLoans.length}</p>
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider mt-1">Rejected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}