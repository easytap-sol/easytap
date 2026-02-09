import { createClient } from "@/utils/supabase/server";
import { AdminCreateLoanForm } from "@/components/admin/admin-create-loan-form";
import { Wallet, UserPlus, TrendingUp, Zap } from "lucide-react";

export default async function AdminCreateLoanPage() {
  const supabase = await createClient();

  // Fetch active products
  const { data: products } = await supabase
    .from("loan_products")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  // Fetch recent customers
  const { data: recentCustomers } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name")
    .eq("role", "customer")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-8">

      {/* 1. Header Hero Card */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-900 to-slate-800 p-8 md:p-12 text-white shadow-2xl shadow-slate-900/10">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Create Customer Loan
            </h1>
            <p className="text-slate-400">
              Create and disburse loans directly to customers without requiring them to login.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 px-6 py-3 backdrop-blur-sm border border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Products</span>
              <span className="text-2xl font-bold mt-1 text-emerald-400">
                {products?.length || 0}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 px-6 py-3 backdrop-blur-sm border border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Customers</span>
              <span className="text-2xl font-bold mt-1 text-white">
                {recentCustomers?.length || 0}
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
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Customer Management</h3>
              <p className="text-sm text-slate-500">Create customers on-the-fly</p>
            </div>
          </div>
          <p className="text-slate-600 text-sm">
            Add new customers by just entering their email. No complex setup required.
          </p>
        </div>

        <div className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Direct Disbursement</h3>
              <p className="text-sm text-slate-500">Create & disburse in one step</p>
            </div>
          </div>
          <p className="text-slate-600 text-sm">
            Loans are created and disbursed immediately. Complete financial recording included.
          </p>
        </div>

        <div className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-600 group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Full Automation</h3>
              <p className="text-sm text-slate-500">Automatic calculations</p>
            </div>
          </div>
          <p className="text-slate-600 text-sm">
            Interest, fees, and totals calculated automatically. Ledger entries created instantly.
          </p>
        </div>
      </div>

      {/* 3. Main Creation Form */}
      <AdminCreateLoanForm
        products={(products as any) || []}
        recentCustomers={(recentCustomers as any) || []}
      />
    </div>
  );
}