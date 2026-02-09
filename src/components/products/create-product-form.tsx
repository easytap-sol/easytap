"use client";

import { Plus, Calendar, Percent, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateProductForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/products/create", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Refresh the page data
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to create product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      router.refresh();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Plus className="h-4 w-4" />
          </div>
          <h3 className="font-bold text-slate-900">New Product</h3>
        </div>
      </div>

      <div className="p-8">
        <form
          action={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 block">Product Name *</label>
            <input
              name="name"
              type="text"
              placeholder="e.g. Business Booster"
              required
              className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Duration (Days) *</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                <input
                  name="durationDays"
                  type="number"
                  placeholder="30"
                  required
                  min="1"
                  className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Interest Rate (%) *</label>
              <div className="relative">
                <Percent className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                <input
                  name="interestRate"
                  type="number"
                  placeholder="10"
                  required
                  step="0.1"
                  className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Processing Fee</label>
              <input
                name="processingFee"
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                defaultValue="0"
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Penalty Rate (%)</label>
              <input
                name="penaltyRate"
                type="number"
                placeholder="0"
                min="0"
                step="0.1"
                defaultValue="0"
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 block">Description</label>
            <textarea
              name="description"
              placeholder="Short description of this loan product..."
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none transition-all"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 bg-primary text-white font-bold rounded-2xl hover:bg-primary-deep shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isSubmitting ? "Creating..." : "Create Product"}
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-12 px-4 border border-slate-200 bg-white text-slate-700 font-bold rounded-2xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}