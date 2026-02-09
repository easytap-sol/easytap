"use client";

import { Calendar, Percent, Wallet, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  product: any;
  toggleProductStatusAction: (id: string, currentStatus: boolean) => Promise<any>;
}

export function ProductCard({ product, toggleProductStatusAction }: ProductCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const router = useRouter();

  const handleToggleStatus = async () => {
    setIsToggling(true);
    try {
      await toggleProductStatusAction(product.id, product.is_active);
      // Refresh the page to show updated status
      router.refresh();
    } catch (error) {
      console.error("Failed to toggle product status:", error);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div 
      className={cn(
        "group relative rounded-[2rem] border p-6 shadow-sm hover:shadow-lg transition-all duration-300",
        product.is_active 
          ? "border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30" 
          : "border-slate-100 bg-white"
      )}
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <div className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
          product.is_active 
            ? "bg-emerald-100 text-emerald-800" 
            : "bg-slate-100 text-slate-600"
        )}>
          {product.is_active ? (
            <>
              <CheckCircle className="h-3 w-3" />
              Active
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3" />
              Inactive
            </>
          )}
        </div>
      </div>

      {/* Product Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl",
            product.is_active 
              ? "bg-emerald-100 text-emerald-600" 
              : "bg-slate-100 text-slate-600"
          )}>
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
            <p className="text-xs text-slate-500">ID: {product.id.slice(0, 8)}...</p>
          </div>
        </div>
        {product.description && (
          <p className="text-sm text-slate-600 line-clamp-2">{product.description}</p>
        )}
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Duration</p>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="font-bold text-slate-900">{product.duration_days} days</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Interest Rate</p>
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-slate-400" />
            <span className="font-bold text-slate-900">{product.interest_rate}%</span>
          </div>
        </div>
      </div>

      {/* Additional Features */}
      <div className="flex flex-wrap gap-2 mb-6">
        {product.processing_fee > 0 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
            Processing Fee: {product.processing_fee}
          </span>
        )}
        {product.penalty_rate > 0 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium">
            Penalty: {product.penalty_rate}%
          </span>
        )}
        {product.created_at && (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
            Created: {new Date(product.created_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <span className="text-xs text-slate-500">
          {product.updated_at || product.created_at 
            ? `Updated: ${new Date(product.updated_at || product.created_at).toLocaleDateString()}`
            : ''
          }
        </span>
        <button 
          onClick={handleToggleStatus}
          disabled={isToggling}
          className={cn(
            "text-sm font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            product.is_active 
              ? "text-red-600 hover:bg-red-50" 
              : "text-emerald-600 hover:bg-emerald-50"
          )}
        >
          {isToggling ? "..." : product.is_active ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  );
}