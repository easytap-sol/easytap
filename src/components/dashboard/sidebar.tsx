"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminNav, customerNav } from "@/config/dashboard-nav";
import { LifeBuoy, X } from "lucide-react";

interface SidebarProps {
  role: string;
  companyName: string;
  onItemClick?: () => void;
  onClose?: () => void;
}

export function Sidebar({ role, companyName, onItemClick, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Determine Nav Items
  const userRole = role.toLowerCase();
  const isAdmin = ["super_admin", "admin", "admin_staff", "staff"].includes(userRole);
  const items = isAdmin ? adminNav : customerNav;

  return (
    <div className="flex h-full flex-col py-6 px-4">
      {/* 1. Brand Logo & Close Button */}
      <div className="px-4 mb-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group" onClick={onItemClick}>
          <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            {(companyName || "E").charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-bold text-slate-900 tracking-tight text-lg">{companyName || "EasyTap"}</h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Workspace</p>
          </div>
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* 2. Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide px-2">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={index}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "bg-primary/10 text-primary-deep"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-primary rounded-r-full" />
              )}
              <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600")} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* 3. Bottom Card (Support) */}
      <div className="mt-auto pt-6">
        <div className="bg-slate-900 rounded-2xl p-4 relative overflow-hidden group cursor-pointer">
          {/* Decorative Circle */}
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full group-hover:scale-110 transition-transform" />

          <div className="relative z-10 flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/10 rounded-lg text-white">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <span className="text-white font-semibold text-sm">Need Help?</span>
          </div>
          <p className="text-slate-400 text-xs relative z-10">Contact support for system issues.</p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[10px] text-slate-300 font-medium">v2.4.0 • Stable</p>
        </div>
      </div>
    </div>
  );
}