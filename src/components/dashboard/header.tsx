"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, Bell, ChevronDown, User, Settings, LogOut, Search, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";

export function DashboardHeader({ userEmail, role, companyName }: { userEmail: string, role: string, companyName: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isMobileNavOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 bg-white/80 backdrop-blur-md px-6 lg:px-10 border-b border-slate-100 transition-all">

      {/* Mobile Menu Trigger */}
      <div className="flex items-center gap-4 lg:hidden">
        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        {/* Mobile Logo Fallback */}
        <span className="font-bold text-lg text-slate-900">{companyName}</span>
      </div>

      {/* Desktop Search (Visual Only) */}
      <div className="hidden lg:flex max-w-md w-full relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search loans, users, or transactions..."
          className="w-full h-10 rounded-full bg-slate-50 border-none pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 text-slate-700"
        />
      </div>

      <div className="flex items-center gap-3 sm:gap-6 ml-auto">
        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-700 leading-none group-hover:text-blue-700 transition-colors">
                {userEmail.split('@')[0]}
              </p>
              <p className="text-[10px] text-slate-400 font-medium capitalize mt-1">
                {role.replace('_', ' ')}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold shadow-sm group-hover:shadow-md transition-all">
              {userEmail[0]?.toUpperCase()}
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 top-full mt-4 w-60 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl shadow-slate-200/50 animate-in fade-in zoom-in-95 origin-top-right">

              <div className="px-3 py-3 border-b border-slate-50 mb-1 sm:hidden">
                <p className="text-sm font-bold text-slate-900">{userEmail}</p>
                <p className="text-xs text-slate-500 capitalize">{role.replace('_', ' ')}</p>
              </div>

              <div className="space-y-1">
                <Link
                  href={`/${role === 'customer' ? 'customer' : 'admin'}/profile`}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="h-4 w-4" />
                  My Profile
                </Link>

                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  System Settings
                </Link>
              </div>

              <div className="my-2 h-px bg-slate-100" />

              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsMobileNavOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 w-full max-w-[280px] bg-white shadow-2xl animate-in slide-in-from-left duration-500 ease-out h-full overflow-hidden">
            <Sidebar
              role={role}
              companyName={companyName}
              onItemClick={() => setIsMobileNavOpen(false)}
              onClose={() => setIsMobileNavOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
}