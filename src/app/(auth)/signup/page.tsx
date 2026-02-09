"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
    User,
    Mail,
    Lock,
    Phone,
    ArrowRight,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Sparkles
} from "lucide-react";
import { signupAction } from "@/actions/auth-actions";

const initialState: { error?: string; success?: string } = {
    error: undefined,
    success: undefined,
}

export default function SignupPage() {
    const [state, formAction, isPending] = useActionState(signupAction, initialState);

    return (
        <div className="bg-white">

            {/* Header */}
            <div className="mb-10 text-center sm:text-left">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-4 shadow-sm sm:hidden">
                    <Sparkles className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Create Account</h1>
                <p className="text-slate-500">
                    Join EasyTap to apply for instant loans.
                </p>
            </div>

            {/* Success Message */}
            {state?.success && (
                <div className="mb-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col items-center text-center gap-3 animate-in zoom-in-95">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-1">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-emerald-900">Account Created!</h3>
                    <p className="text-emerald-700 text-sm mb-4">
                        {state.success}
                    </p>
                    <Link
                        href="/login"
                        className="w-full py-3 px-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-deep transition-colors shadow-lg shadow-primary/20"
                    >
                        Proceed to Login
                    </Link>
                </div>
            )}

            {/* Error Message Alert */}
            {state?.error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-600 animate-in zoom-in-95">
                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    <div className="text-sm font-medium">{state.error}</div>
                </div>
            )}

            {/* Signup Form */}
            {!state?.success && (
                <form action={formAction} className="space-y-5">

                    {/* Names Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">
                                First Name
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    name="firstName"
                                    type="text"
                                    placeholder="e.g. John"
                                    className="w-full h-14 rounded-2xl bg-slate-50 border-0 px-4 pl-12 text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary transition-all shadow-sm ring-1 ring-slate-100"
                                    required
                                />
                            </div>
                        </div>

                        {/* Last Name */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">
                                Last Name
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    name="lastName"
                                    type="text"
                                    placeholder="e.g. Doe"
                                    className="w-full h-14 rounded-2xl bg-slate-50 border-0 px-4 pl-12 text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary transition-all shadow-sm ring-1 ring-slate-100"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Email Address
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                name="email"
                                type="email"
                                placeholder="e.g. john@gmail.com"
                                className="w-full h-14 rounded-2xl bg-slate-50 border-0 px-4 pl-12 text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary transition-all shadow-sm ring-1 ring-slate-100"
                                required
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            M-Pesa Number
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                <Phone className="w-5 h-5" />
                            </div>
                            <input
                                name="phone"
                                type="tel"
                                placeholder="e.g. 0712 345 678"
                                className="w-full h-14 rounded-2xl bg-slate-50 border-0 px-4 pl-12 text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary transition-all shadow-sm ring-1 ring-slate-100"
                                required
                            />
                        </div>
                    </div>

                    {/* Passwords Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full h-14 rounded-2xl bg-slate-50 border-0 px-4 pl-12 text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary transition-all shadow-sm ring-1 ring-slate-100"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">
                                Confirm Password
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full h-14 rounded-2xl bg-slate-50 border-0 px-4 pl-12 text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary transition-all shadow-sm ring-1 ring-slate-100"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-14 mt-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-deep hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Create Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            )}

            {/* Footer CTA */}
            <div className="pt-6 text-center">
                <p className="text-slate-500 text-sm">
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        className="font-bold text-primary hover:text-primary-deep hover:underline"
                    >
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}