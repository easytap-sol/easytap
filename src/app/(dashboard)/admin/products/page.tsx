import { createClient } from "@/utils/supabase/server";
import { toggleProductStatusAction } from "@/actions/loan-actions";
import { CreateProductForm } from "@/components/products/create-product-form";
import { ProductCard } from "@/components/products/product-card";
import { RefreshButton } from "@/components/ui/refresh-button";
import { Wallet, Zap } from "lucide-react";

export default async function AdminProductsPage() {
  const supabase = await createClient();

  // Fetch products
  const { data: products, error } = await supabase
    .from("loan_products")
    .select("*")
    .order("created_at", { ascending: false });

  console.log("Products fetched:", products?.length, "Error:", error);

  return (
    <div className="space-y-8">

      {/* 1. Header Hero Card */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-900 to-slate-800 p-8 md:p-12 text-white shadow-2xl shadow-slate-900/10">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Loan Products
            </h1>
            <p className="text-slate-400">
              Define and manage loan terms, interest rates, and product configurations.
              <span className="block text-sm mt-1">Showing {products?.length || 0} products</span>
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 px-6 py-3 backdrop-blur-sm border border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active</span>
              <span className="text-2xl font-bold mt-1 text-emerald-400">
                {products?.filter(p => p.is_active).length || 0}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 px-6 py-3 backdrop-blur-sm border border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total</span>
              <span className="text-2xl font-bold mt-1 text-white">
                {products?.length || 0}
              </span>
            </div>
          </div>
        </div>

        <Wallet className="absolute -right-10 -bottom-10 h-64 w-64 text-white/5 rotate-12" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">

        {/* LEFT COLUMN: Create Product Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Client Component Form - no props needed now */}
            <CreateProductForm />

            {/* Quick Stats Card */}
            <div className="rounded-[2.5rem] border border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg">Quick Insights</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Product count</span>
                  <span className="font-bold">{products?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Avg. interest rate</span>
                  <span className="font-bold">
                    {products?.length ?
                      (products.reduce((sum: number, p: any) => sum + p.interest_rate, 0) / products.length).toFixed(1) + '%'
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Active products</span>
                  <span className="font-bold text-emerald-400">
                    {products?.filter((p: any) => p.is_active).length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Product List */}
        <div className="lg:col-span-2 space-y-6">

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900">All Products</h2>
              <p className="text-slate-500">Manage existing loan products</p>
            </div>
            <RefreshButton className="rounded-xl" />
          </div>

          {products?.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {products.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  toggleProductStatusAction={toggleProductStatusAction}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
                <Wallet className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {error ? "Error loading products" : "No products yet"}
              </h3>
              <p className="text-slate-500 mb-6 max-w-md">
                {error
                  ? `Database error: ${error.message}`
                  : "Create your first loan product to start offering loans to customers."
                }
              </p>
              {error && <RefreshButton />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}