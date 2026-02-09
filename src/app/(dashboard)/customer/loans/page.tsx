import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Calendar,
  BadgeInfo,
  History as HistoryIcon,
  AlertCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
  Eye,
  FileText,
  RefreshCw,
  PieChart,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function CustomerLoansPage() {
  const supabase = await createClient();

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Fetch all loans for this user with repayments
  const { data: loans, error } = await supabase
    .from('loans')
    .select(`
      *,
      loan_products (
        name,
        interest_rate,
        duration_days
      ),
      repayments (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-red-200 bg-red-50/50 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-bold text-red-900 mb-2">Failed to load loan history</h3>
        <p className="text-red-700 mb-6 max-w-sm">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  const safeLoans = loans || [];

  // Categorize loans
  const activeLoans = safeLoans.filter(l => l.status === 'active');
  const pendingLoans = safeLoans.filter(l => l.status === 'pending');
  const paidLoans = safeLoans.filter(l => l.status === 'paid');
  const rejectedLoans = safeLoans.filter(l => l.status === 'rejected');

  // Calculate totals
  const totalBorrowed = safeLoans
    .filter(l => l.status !== 'pending' && l.status !== 'rejected')
    .reduce((sum, l) => sum + (l.principal_amount || 0), 0);

  const totalRepaid = safeLoans
    .filter(l => l.status !== 'pending' && l.status !== 'rejected')
    .reduce((sum, l) => sum + (l.amount_paid || 0), 0);

  const outstandingBalance = activeLoans.reduce((sum, l) => sum + (l.balance_due || 0), 0);

  // Format date safely
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-8">

      {/* 1. Header Hero Card */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-900 to-slate-800 p-8 md:p-12 text-white shadow-2xl shadow-slate-900/10">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              My Loan Portfolio
            </h1>
            <p className="text-slate-400">
              Track all your loan applications, payments, and repayment history.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 px-6 py-3 backdrop-blur-sm border border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active</span>
              <span className="text-2xl font-bold mt-1 text-emerald-400">
                {activeLoans.length}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 px-6 py-3 backdrop-blur-sm border border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Repaid</span>
              <span className="text-2xl font-bold mt-1 text-white">
                {paidLoans.length}
              </span>
            </div>
          </div>
        </div>

        {/* Abstract Background Elements */}
        <CreditCard className="absolute -right-10 -bottom-10 h-64 w-64 text-white/5 rotate-12" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
      </div>

      {/* 2. Portfolio Overview */}
      <div className="grid gap-6 md:grid-cols-3">

        {/* Total Borrowed */}
        <div className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Borrowed</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">KES {totalBorrowed.toLocaleString()}</p>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-500">
            <span>Across {safeLoans.length} loans</span>
          </div>
        </div>

        {/* Total Repaid */}
        <div className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Repaid</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">KES {totalRepaid.toLocaleString()}</p>
          <div className="mt-2 text-xs font-medium text-slate-500">
            {totalBorrowed > 0 ? (
              <span>{(totalRepaid / totalBorrowed * 100).toFixed(1)}% repayment rate</span>
            ) : (
              <span>No loans borrowed</span>
            )}
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full group-hover:scale-110 transition-transform",
              outstandingBalance > 0 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
            )}>
              <TrendingDown className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Balance</span>
          </div>
          <p className={cn(
            "text-2xl font-bold",
            outstandingBalance > 0 ? "text-amber-600" : "text-emerald-600"
          )}>
            KES {outstandingBalance.toLocaleString()}
          </p>
          <div className="mt-2 text-xs font-medium text-slate-500">
            <span>{activeLoans.length} active loan(s)</span>
          </div>
        </div>
      </div>

      {/* 3. Loan Status Summary */}
      <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <PieChart className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900">Loan Status Breakdown</h3>
            </div>
            <span className="text-sm font-bold text-slate-500">
              Total: {safeLoans.length} loans
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={cn(
              "p-6 rounded-2xl border text-center transition-all duration-300 hover:scale-[1.02]",
              activeLoans.length > 0
                ? "bg-primary/10 border-primary/20"
                : "bg-slate-50 border-slate-100"
            )}>
              <p className="text-3xl font-bold text-primary">{activeLoans.length}</p>
              <p className="text-sm font-bold text-primary uppercase tracking-wider mt-2">Active</p>
              {activeLoans.length > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  KES {outstandingBalance.toLocaleString()} due
                </p>
              )}
            </div>

            <div className={cn(
              "p-6 rounded-2xl border text-center transition-all duration-300 hover:scale-[1.02]",
              paidLoans.length > 0
                ? "bg-emerald-50 border-emerald-100"
                : "bg-slate-50 border-slate-100"
            )}>
              <p className="text-3xl font-bold text-emerald-600">{paidLoans.length}</p>
              <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mt-2">Repaid</p>
              {paidLoans.length > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  Fully settled
                </p>
              )}
            </div>

            <div className={cn(
              "p-6 rounded-2xl border text-center transition-all duration-300 hover:scale-[1.02]",
              pendingLoans.length > 0
                ? "bg-amber-50 border-amber-100"
                : "bg-slate-50 border-slate-100"
            )}>
              <p className="text-3xl font-bold text-amber-600">{pendingLoans.length}</p>
              <p className="text-sm font-bold text-amber-600 uppercase tracking-wider mt-2">Pending</p>
              {pendingLoans.length > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  Under review
                </p>
              )}
            </div>

            <div className={cn(
              "p-6 rounded-2xl border text-center transition-all duration-300 hover:scale-[1.02]",
              rejectedLoans.length > 0
                ? "bg-red-50 border-red-100"
                : "bg-slate-50 border-slate-100"
            )}>
              <p className="text-3xl font-bold text-red-600">{rejectedLoans.length}</p>
              <p className="text-sm font-bold text-red-600 uppercase tracking-wider mt-2">Rejected</p>
              {rejectedLoans.length > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  Not approved
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Loan Applications List */}
      <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <FileText className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900">All Loan Applications</h3>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                {safeLoans.length} total
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                <Filter className="h-4 w-4" />
                Filter
              </button>
              <Link
                href="/customer/apply"
                className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-deep shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              >
                Apply New
              </Link>
            </div>
          </div>
        </div>

        <div className="p-4">
          {safeLoans.length > 0 ? (
            <div className="space-y-4">
              {safeLoans.map((loan) => {
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'active': return { bg: 'bg-primary/10', text: 'text-primary-deep', border: 'border-primary/20' };
                    case 'paid': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' };
                    case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' };
                    case 'rejected': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' };
                    default: return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-100' };
                  }
                };

                const getStatusIcon = (status: string) => {
                  switch (status) {
                    case 'active': return <Clock className="h-4 w-4" />;
                    case 'paid': return <CheckCircle2 className="h-4 w-4" />;
                    case 'pending': return <Clock className="h-4 w-4" />;
                    case 'rejected': return <XCircle className="h-4 w-4" />;
                    default: return <Clock className="h-4 w-4" />;
                  }
                };

                const statusColors = getStatusColor(loan.status || '');
                const loanProgress = loan.total_payable
                  ? Math.round(((loan.amount_paid || 0) / loan.total_payable) * 100)
                  : 0;

                return (
                  <div key={loan.id} className="group rounded-[2rem] border border-slate-100 p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Left Section */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold",
                            statusColors.bg,
                            statusColors.text,
                            statusColors.border
                          )}>
                            {getStatusIcon(loan.status || '')}
                            {loan.status?.toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-slate-500 font-mono">
                            Ref: {loan.loan_ref}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-xl font-bold text-slate-900">
                            {loan.loan_products?.name || "Loan Product"}
                          </h4>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Applied {formatDate(loan.created_at)}
                            </div>
                            {loan.due_date && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Due {formatDate(loan.due_date)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Middle Section */}
                      <div className="lg:w-48">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Principal</span>
                            <span className="font-bold text-slate-900">
                              KES {loan.principal_amount?.toLocaleString()}
                            </span>
                          </div>

                          {loan.status === 'active' && (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Progress</span>
                                <span className="font-bold text-primary">{loanProgress}%</span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary-deep transition-all duration-1000"
                                  style={{ width: `${loanProgress}%` }}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right Section */}
                      <div className="text-right">
                        <div className="mb-4">
                          <p className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">
                            {loan.status === 'paid' ? 'Total Paid' : 'Balance Due'}
                          </p>
                          <p className={cn(
                            "text-2xl font-bold",
                            loan.status === 'paid' ? 'text-emerald-600' : 'text-slate-900'
                          )}>
                            KES {(loan.status === 'paid' ? loan.amount_paid : loan.balance_due)?.toLocaleString()}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            href={`/customer/loans/${loan.id}`}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Details
                          </Link>
                          {loan.status === 'active' && (
                            <Link
                              href="/customer/overview"
                              className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-deep shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                            >
                              <ChevronRight className="h-4 w-4" />
                              Pay
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Duration</p>
                          <p className="font-bold text-slate-900">{loan.loan_products?.duration_days} days</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Interest Rate</p>
                          <p className="font-bold text-emerald-600">{loan.loan_products?.interest_rate}%</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Payable</p>
                          <p className="font-bold text-slate-900">KES {loan.total_payable?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Processing Fee</p>
                          <p className="font-bold text-slate-900">KES {loan.processing_fee?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Rejection Reason */}
                    {loan.status === 'rejected' && loan.rejection_reason && (
                      <div className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-100">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-bold text-red-900 mb-1">Application Rejected</p>
                            <p className="text-sm text-red-700">{loan.rejection_reason}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
                <CreditCard className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No Loan History Yet</h3>
              <p className="text-slate-500 mb-6 max-w-sm">
                You haven't applied for any loans yet. Start your journey by applying today!
              </p>
              <Link
                href="/customer/apply"
                className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-deep shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              >
                Apply for Your First Loan
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}