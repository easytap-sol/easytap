import Link from "next/link";
import { 
  Zap, 
  ShieldCheck, 
  Smartphone, 
  ArrowRight,
  TrendingUp,
  CreditCard,
  Lock,
  Users,
  CheckCircle2,
  ChevronRight,
  LayoutDashboard
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-slate-50/50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* BACKGROUND TEXTURE */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
      </div>

      <main className="relative z-10 w-full overflow-hidden">
        
        {/* --- HERO SECTION --- */}
        <section className="pt-20 pb-16 lg:pt-32 lg:pb-24 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/60 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-blue-700 mb-8 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
               Licensed Digital Credit Provider
            </div>

            {/* Headline */}
            <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl mb-6">
              Financial Infrastructure for <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Modern Lending
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-slate-500 mb-10 leading-relaxed">
              Experience the fastest way to access capital or manage your loan portfolio. 
              Instant M-Pesa disbursements, AI-driven decisions, and bank-grade security.
            </p>

            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/register" 
                className="h-12 px-8 rounded-xl bg-blue-600 text-white font-semibold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 hover:-translate-y-0.5"
              >
                Get Instant Loan
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link 
                href="/login" 
                className="h-12 px-8 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold flex items-center gap-2 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
              >
                Log In
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-slate-200 bg-white/50 backdrop-blur-sm py-8 px-4 rounded-3xl">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-slate-900">2 min</span>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Approval Time</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-slate-900">99.9%</span>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">System Uptime</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-slate-900">256-bit</span>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Bank Security</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-slate-900">24/7</span>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Support</span>
              </div>
            </div>
          </div>
        </section>

        {/* --- COMPACT BENTO GRID (Dual Persona) --- */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
              
              {/* CARD 1: Customer Focused (Large) */}
              <div className="md:col-span-2 rounded-[2rem] bg-white border border-slate-100 p-8 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:border-blue-100 transition-colors">
                <div className="relative z-10 max-w-md">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
                    <Smartphone className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Need cash instantly?</h3>
                  <p className="text-slate-500 mb-6">
                    Download the app or register online. Our automated system approves your limit based on data, not paperwork. Withdraw directly to M-Pesa.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant M-Pesa Dispatch
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Low Interest Rates
                    </li>
                  </ul>
                  <Link href="/register" className="inline-flex items-center text-sm font-bold text-blue-600 hover:underline">
                    Create Customer Account <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                {/* Decorative Visual */}
                <div className="absolute top-1/2 right-[-20px] w-64 h-64 bg-blue-100/50 rounded-full blur-3xl group-hover:bg-blue-200/50 transition-colors" />
                <div className="absolute right-[-40px] bottom-[-40px] opacity-20 rotate-12 group-hover:rotate-6 transition-transform duration-500">
                  <Smartphone className="w-64 h-64 text-blue-900" />
                </div>
              </div>

              {/* CARD 2: Admin/Lender Focused */}
              <div className="md:col-span-1 rounded-[2rem] bg-slate-900 text-white p-8 relative overflow-hidden group">
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                      <LayoutDashboard className="w-6 h-6 text-blue-300" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Admin Portal</h3>
                    <p className="text-slate-400 text-sm">
                      Manage liquidity, approve exceptions, and view real-time portfolio health from a single dashboard.
                    </p>
                  </div>
                  <Link href="/login" className="mt-8 inline-flex items-center justify-center w-full h-10 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-semibold transition-colors border border-white/10">
                    Access Dashboard
                  </Link>
                </div>
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 opacity-50" />
              </div>

              {/* CARD 3: Technology/Speed */}
              <div className="md:col-span-1 rounded-[2rem] bg-white border border-slate-100 p-8 flex flex-col justify-center items-center text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                  <Zap className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Lightning Fast</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Our decision engine processes data points in milliseconds.
                </p>
              </div>

              {/* CARD 4: Security */}
              <div className="md:col-span-1 rounded-[2rem] bg-white border border-slate-100 p-8 flex flex-col justify-center items-center text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Secure & Private</h3>
                <p className="text-sm text-slate-500 mt-2">
                  We use 256-bit encryption to protect your financial data.
                </p>
              </div>

              {/* CARD 5: Growth/Scale */}
              <div className="md:col-span-1 rounded-[2rem] bg-white border border-slate-100 p-8 flex flex-col justify-center items-center text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                  <TrendingUp className="w-7 h-7 text-indigo-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Scalable Tech</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Infrastructure built to handle millions of concurrent requests.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* --- SIMPLE FINAL CTA --- */}
        <section className="py-16 px-4 text-center">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-6">
              Ready to get started?
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/register" 
                className="h-12 px-8 rounded-xl bg-slate-900 text-white font-semibold flex items-center gap-2 hover:bg-slate-800 transition-all"
              >
                Create Account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link 
                href="/login" 
                className="text-slate-600 font-medium hover:text-slate-900"
              >
                Already have an account? <span className="underline decoration-slate-300 underline-offset-4">Log In</span>
              </Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}