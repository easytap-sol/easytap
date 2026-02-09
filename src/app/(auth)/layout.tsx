import React from "react";
import Link from "next/link";
import { CheckCircle2, TrendingUp } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      
      {/* LEFT SIDE - Brand Visuals (Bright & Airy) */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-slate-50 border-r border-slate-100 p-16">
        
        {/* Background Decor: Soft Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] mix-blend-multiply" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-[100px] mix-blend-multiply" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        {/* Brand Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/20">
              E
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900">EasyTap</span>
          </Link>
        </div>

        {/* Feature Card (Floating Glass) */}
        <div className="relative z-10 max-w-md mt-12">
          <div className="bg-white/60 backdrop-blur-md border border-white/80 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Instant Liquidity</h3>
                <p className="text-sm text-slate-500">Capital when you need it.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-600">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium">Disbursed to M-Pesa in seconds</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium">Transparent, low interest rates</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium">No hidden paperwork</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="relative z-10 mt-auto pt-12">
          <p className="text-sm text-slate-500 font-medium">
            Licensed Digital Credit Provider (DCP). <br/>
            Regulated by the Central Bank of Kenya.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - Form Container */}
      <div className="flex flex-col items-center justify-center p-6 md:p-12 relative bg-white">
        <div className="w-full max-w-[400px] mx-auto animate-fade-in-up">
          {children}
        </div>
        
        {/* Mobile Footer */}
        <div className="lg:hidden mt-10 text-center text-xs text-slate-400">
           © {new Date().getFullYear()} EasyTap Solutions.
        </div>
      </div>
    </div>
  );
}