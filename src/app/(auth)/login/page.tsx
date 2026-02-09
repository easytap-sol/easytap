"use client";

import { useState, useActionState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Smartphone,
  Mail
} from "lucide-react";
import { loginAction } from "@/actions/auth-actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  
  // Logic state
  const [inputValue, setInputValue] = useState("");
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("email");

  // Auto-detect Phone vs Email
  useEffect(() => {
    // Regex: If starts with +, 0, or 1-9, treat as phone
    const isPhone = /^(\+|0|[1-9])/.test(inputValue);
    setLoginMethod(isPhone ? "phone" : "email");
  }, [inputValue]);

  return (
    <div className="bg-white">
      
      {/* Clean Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
          Welcome back
        </h1>
        <p className="text-slate-500">
          Please enter your details to sign in.
        </p>
      </div>

      {/* Error Alert (Soft Red) */}
      {state?.error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 flex items-start gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{state.error}</div>
        </div>
      )}

      {/* Form */}
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="loginMethod" value={loginMethod} />

        {/* SMART INPUT FIELD */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 ml-1">
            Email or Phone Number
          </label>
          
          <div className="relative group">
            {/* Icon (Left) */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
              {loginMethod === "phone" ? <Smartphone className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
            </div>

            <input
              name={loginMethod === "phone" ? "phone" : "email"}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. 0712 345 678 or admin@easytap.com"
              className="w-full h-14 rounded-2xl bg-slate-50 border-0 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all shadow-sm ring-1 ring-slate-100"
              required
              autoComplete="username"
            />
            
            {/* Badge (Right) - Shows user what mode they are in */}
            {inputValue.length > 0 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  loginMethod === 'phone' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-blue-50 text-blue-600 border-blue-100'
                } transition-all duration-300`}>
                  {loginMethod === "phone" ? "CUSTOMER" : "ADMIN"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* PASSWORD FIELD */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <input
            name="password"
            type="password"
            placeholder="••••••••••••"
            className="w-full h-14 rounded-2xl bg-slate-50 border-0 px-4 text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all shadow-sm ring-1 ring-slate-100"
            required
            autoComplete="current-password"
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full h-14 bg-blue-600 text-white text-base font-bold rounded-2xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Sign In <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* SIGN UP LINK */}
        <p className="text-center text-slate-500 text-sm pt-2">
          Don't have an account?{' '}
          <Link href="/signup" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
            Register Now
          </Link>
        </p>

      </form>
    </div>
  );
}