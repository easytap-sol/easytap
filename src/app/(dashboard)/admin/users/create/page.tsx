"use client";

import { useActionState } from "react";
import { createUserAction } from "@/actions/admin-actions";
import { 
    Loader2, 
    ChevronLeft,
    CheckCircle2,
    AlertCircle,
    CreditCard,
    Fingerprint,
    Mail,
    Smartphone,
    Shield,
    Key
} from "lucide-react";
import Link from "next/link";

const initialState: { error?: string; success?: string } = {
    error: undefined,
    success: undefined,
};

export default function CreateUserPage() {
    const [state, formAction, isPending] = useActionState(createUserAction, initialState);

    return (
        <div className="max-w-4xl mx-auto pb-20">
            
            {/* Minimal Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/users" className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">Onboard New User</h1>
                    <p className="text-slate-500 font-medium text-sm">Create a digital profile for a customer or staff member.</p>
                </div>
            </div>

            <form action={formAction} className="space-y-8">
                
                {/* Feedback Alerts */}
                {state?.error && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-600 animate-in zoom-in-95">
                        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                        <div className="text-sm font-bold">{state.error}</div>
                    </div>
                )}
                {state?.success && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3 text-emerald-700 animate-in zoom-in-95">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                        <div className="text-sm font-bold">{state.success}</div>
                    </div>
                )}

                {/* --- CARD 1: IDENTITY (Visual focus on the person) --- */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
                    
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Mock Photo Uploader / Visual */}
                        <div className="shrink-0 flex flex-col items-center gap-3">
                            <div className="w-32 h-32 rounded-[2rem] bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-blue-400 hover:text-blue-500 transition-all cursor-pointer">
                                <Fingerprint className="w-10 h-10 mb-2 opacity-50" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">ID Photo</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium max-w-[120px] text-center">
                                Uploads disabled in manual creation
                            </p>
                        </div>

                        {/* Fields */}
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-bold text-slate-900">Identity Details</h3>
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">First Name</label>
                                    <input 
                                        name="firstName" 
                                        required 
                                        placeholder="e.g. Kennedy"
                                        className="w-full h-14 rounded-2xl bg-slate-50 border-0 px-5 text-slate-900 font-bold placeholder:text-slate-300 placeholder:font-normal focus:bg-white focus:ring-4 focus:ring-blue-100 focus:text-blue-900 transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Last Name</label>
                                    <input 
                                        name="lastName" 
                                        required 
                                        placeholder="e.g. Omondi"
                                        className="w-full h-14 rounded-2xl bg-slate-50 border-0 px-5 text-slate-900 font-bold placeholder:text-slate-300 placeholder:font-normal focus:bg-white focus:ring-4 focus:ring-blue-100 focus:text-blue-900 transition-all" 
                                    />
                                </div>
                            </div>

                            {/* THE ID FIELD - Prominent */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-blue-600 uppercase tracking-wider ml-1 flex items-center gap-1">
                                    National ID / Passport No. <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    <input 
                                        name="nationalId" 
                                        required 
                                        placeholder="e.g. 2488XXXX"
                                        className="w-full h-14 rounded-2xl bg-white border-2 border-slate-100 pl-14 pr-5 text-slate-900 font-bold tracking-wide placeholder:text-slate-300 placeholder:font-normal focus:border-blue-500 focus:ring-0 transition-all shadow-sm group-focus-within:shadow-lg group-focus-within:shadow-blue-500/10" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CARD 2: ACCESS (Visual focus on security) --- */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row gap-8">
                        <div className="shrink-0 hidden md:block">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400">
                                <Key className="w-6 h-6" />
                            </div>
                        </div>
                        
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Shield className="w-5 h-5 text-blue-400 md:hidden" />
                                <h3 className="text-lg font-bold text-white">System Credentials</h3>
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-white transition-colors" />
                                        <input 
                                            name="email" 
                                            type="email" 
                                            required 
                                            placeholder="user@easytap.com"
                                            className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 pl-14 pr-5 text-white font-medium placeholder:text-slate-600 focus:bg-white/10 focus:border-blue-500 focus:ring-0 transition-all" 
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Phone Number</label>
                                    <div className="relative group">
                                        <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-white transition-colors" />
                                        <input 
                                            name="phone" 
                                            type="tel" 
                                            required 
                                            placeholder="+254 7XX XXX XXX"
                                            className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 pl-14 pr-5 text-white font-medium placeholder:text-slate-600 focus:bg-white/10 focus:border-blue-500 focus:ring-0 transition-all" 
                                        />
                                    </div>
                                </div>

                                {/* Role Selector */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Account Type</label>
                                    <div className="relative">
                                        <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <select 
                                            name="role" 
                                            className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 pl-14 pr-5 text-white font-medium focus:bg-white/10 focus:border-blue-500 focus:ring-0 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="customer" className="bg-slate-900">Borrower (Customer)</option>
                                            <option value="admin" className="bg-slate-900">Admin Staff</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Initial Password */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Temporary Password</label>
                                    <div className="relative group">
                                        <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-white transition-colors" />
                                        <input 
                                            name="password" 
                                            type="password"
                                            required 
                                            minLength={6}
                                            placeholder="••••••••"
                                            className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 pl-14 pr-5 text-white font-medium placeholder:text-slate-600 focus:bg-white/10 focus:border-blue-500 focus:ring-0 transition-all" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="flex justify-end pt-4">
                    <button 
                        type="submit" 
                        disabled={isPending} 
                        className="px-10 py-4 rounded-2xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/20 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Complete Registration"}
                    </button>
                </div>

            </form>
        </div>
    );
}