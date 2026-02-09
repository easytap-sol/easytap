// /home/mandela/projects/mesh/easytap/src/components/marketing/site-header.tsx
"use client";

import Link from "next/link";
import { ArrowRight, Smartphone, Menu, X } from "lucide-react";
import { useState } from "react";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            E
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-primary">EasyTap</span>
            <span className="text-[10px] text-muted-foreground -mt-1">DIGITAL LENDER</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group">
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group">
            How it Works
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group">
            Rates & Fees
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="#testimonials" className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group">
            Success Stories
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
          </Link>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-muted/50"
          >
            <Smartphone className="h-4 w-4" />
            Customer Login
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Instant Loan
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-b shadow-2xl md:hidden animate-in slide-in-from-top duration-300">
            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col gap-2">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-4 px-4 rounded-xl hover:bg-muted transition-colors font-bold text-slate-900 flex items-center gap-3 border border-transparent hover:border-slate-100"
                >
                  Home
                </Link>
                <Link
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-4 px-4 rounded-xl hover:bg-muted transition-colors font-bold text-slate-900 border border-transparent hover:border-slate-100"
                >
                  Features
                </Link>
                <Link
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-4 px-4 rounded-xl hover:bg-muted transition-colors font-bold text-slate-900 border border-transparent hover:border-slate-100"
                >
                  How it Works
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-4 px-4 rounded-xl hover:bg-muted transition-colors font-bold text-slate-900 flex items-center gap-3 border border-transparent hover:border-slate-100"
                >
                  <Smartphone className="h-5 w-5 text-primary" />
                  Customer Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 font-bold text-white shadow-lg shadow-primary/25"
                >
                  Get Instant Loan
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}