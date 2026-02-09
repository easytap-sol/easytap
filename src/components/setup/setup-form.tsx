"use client";

import { useState } from "react";
import { bootstrapSystemAction } from "@/actions/setup-actions";
import { ShieldCheck, Mail, Lock, User, Smartphone, CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function SetupForm() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setError(null);
        setLoading(true);

        const result = await bootstrapSystemAction(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setSuccess(result.success || "Setup complete!");
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-50 border border-green-100 text-green-600 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2">
                    {success}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Company Name</label>
                <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input required name="companyName" placeholder="EasyTap Financial Services" className="w-full h-14 pl-12 pr-6 rounded-2xl border bg-muted/30 focus:bg-white focus:ring-4 ring-primary/10 transition-all outline-none" />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">First Name</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input required name="firstName" placeholder="John" className="w-full h-14 pl-12 pr-6 rounded-2xl border bg-muted/30 focus:bg-white focus:ring-4 ring-primary/10 transition-all outline-none" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input required name="lastName" placeholder="Doe" className="w-full h-14 pl-12 pr-6 rounded-2xl border bg-muted/30 focus:bg-white focus:ring-4 ring-primary/10 transition-all outline-none" />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">E-mail Address</label>
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input required type="email" name="email" placeholder="admin@easytap.com" className="w-full h-14 pl-12 pr-6 rounded-2xl border bg-muted/30 focus:bg-white focus:ring-4 ring-primary/10 transition-all outline-none" />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input required type="password" name="password" placeholder="••••••••" className="w-full h-14 pl-12 pr-6 rounded-2xl border bg-muted/30 focus:bg-white focus:ring-4 ring-primary/10 transition-all outline-none" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input required type="password" name="confirmPassword" placeholder="••••••••" className="w-full h-14 pl-12 pr-6 rounded-2xl border bg-muted/30 focus:bg-white focus:ring-4 ring-primary/10 transition-all outline-none" />
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Mobile Number</label>
                    <div className="relative group">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input required name="mobileNumber" placeholder="254..." className="w-full h-14 pl-12 pr-6 rounded-2xl border bg-muted/30 focus:bg-white focus:ring-4 ring-primary/10 transition-all outline-none" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">National ID</label>
                    <div className="relative group">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input required name="nationalId" placeholder="..." className="w-full h-14 pl-12 pr-6 rounded-2xl border bg-muted/30 focus:bg-white focus:ring-4 ring-primary/10 transition-all outline-none" />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all hover:bg-primary/90 flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Initializing Sovereignty...
                    </>
                ) : (
                    "Bestow Admin Sovereignty"
                )}
            </button>
        </form>
    );
}
