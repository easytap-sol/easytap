"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface RefreshButtonProps {
  className?: string;
}

export function RefreshButton({ className = "" }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refresh the router to get fresh data
      router.refresh();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      // Keep spinner for a bit
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ${className}`}
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      {isRefreshing ? "Refreshing..." : "Refresh"}
    </button>
  );
}