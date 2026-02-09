import { checkSystemInitialized } from "@/actions/setup-actions";
import { Sparkles, ShieldCheck, ArrowRight, CheckCircle2, Server } from "lucide-react";
import Link from "next/link";
import { SetupForm } from "@/components/setup/setup-form";

export default async function SetupPage() {
    const { initialized } = await checkSystemInitialized();

    // STATE 1: ALREADY INITIALIZED
    if (initialized) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
                
                <div className="relative z-10 max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-3">
                        System Active
                    </h1>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        EasyTap has already been initialized. The Super Admin account is active and the database is locked.
                    </p>
                    
                    <Link 
                        href="/login" 
                        className="flex items-center justify-center w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 group"
                    >
                        Go to Dashboard <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        );
    }

    // STATE 2: INITIAL SETUP FORM
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative">
            
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent pointer-events-none" />
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[100px]" />

            <div className="max-w-xl w-full relative z-10">
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                    
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Server className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                                System Setup
                            </h1>
                            <p className="text-slate-500 text-sm font-medium">
                                Initialize Super Admin Account
                            </p>
                        </div>
                    </div>

                    {/* The Setup Form Component */}
                    <div className="space-y-6">
                        <SetupForm />
                    </div>

                    {/* Footer Warning */}
                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-400 leading-relaxed">
                            <strong>Security Note:</strong> This process can only be performed once. 
                            The account created here will have root access to all system configurations and financial controls.
                        </p>
                    </div>
                </div>
                
                {/* Brand Footer */}
                <div className="mt-8 text-center">
                    <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
                        EasyTap Banking Infrastructure
                    </p>
                </div>
            </div>
        </div>
    );
}