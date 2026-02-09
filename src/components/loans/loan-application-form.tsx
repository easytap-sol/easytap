"use client";

import { useState, useMemo } from "react";
import { applyForLoanAction } from "@/actions/loan-actions";
import { useRouter } from "next/navigation";
import { 
  Calendar, Percent, CreditCard, Info, AlertCircle, 
  Loader2, DollarSign, Zap, CheckCircle, ChevronRight,
  Clock, Shield, TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  interest_rate: number;
  duration_days: number;
  processing_fee: number;
  penalty_rate: number;
  description?: string;
}

interface LoanApplicationFormProps {
  products: Product[];
  userId: string; // Add userId prop
}

export function LoanApplicationForm({ products, userId }: LoanApplicationFormProps) {
  const router = useRouter();
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || "");
  const [amount, setAmount] = useState<number | "">("");
  const [isPending, setIsPending] = useState(false);
  const [step, setStep] = useState<"product" | "amount" | "review">("product");
  const [error, setError] = useState<string | null>(null);

  const selectedProduct = useMemo(() =>
    products.find(p => p.id === selectedProductId),
    [selectedProductId, products]);

  const calculations = useMemo(() => {
    if (!selectedProduct || !amount || typeof amount !== 'number') return null;

    const principal = amount;
    const interest = (principal * selectedProduct.interest_rate) / 100;
    const processingFee = selectedProduct.processing_fee || 0;
    const totalPayable = principal + interest + processingFee;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + selectedProduct.duration_days);

    return {
      principal,
      interest,
      processingFee,
      totalPayable,
      dueDate
    };
  }, [amount, selectedProduct]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    
    if (!selectedProduct || !amount || typeof amount !== 'number') {
      setError("Please select a product and enter a valid amount");
      return;
    }

    if (!userId) {
      setError("You must be logged in to apply for a loan");
      return;
    }

    setIsPending(true);
    try {
      const formData = new FormData();
      formData.append("productId", selectedProductId);
      formData.append("amount", amount.toString());
      
      const result = await applyForLoanAction(formData);
      
      if (result?.error) {
        setError(`Error: ${result.error}`);
      } else if (result?.success) {
        // Show success message
        setError(null);
        alert("Success! Your loan application has been submitted for review.");
        // Reset form
        setAmount("");
        setSelectedProductId(products[0]?.id || "");
        setStep("product");
        // Redirect to overview page
        router.push("/customer/overview");
      }
    } catch (error) {
      console.error("Application failed:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  const nextStep = () => {
    setError(null); // Clear errors when moving to next step
    
    if (step === "product" && selectedProduct) {
      setStep("amount");
    } else if (step === "amount" && amount && typeof amount === 'number') {
      setStep("review");
    }
  };

  const prevStep = () => {
    setError(null); // Clear errors when going back
    if (step === "review") {
      setStep("amount");
    } else if (step === "amount") {
      setStep("product");
    }
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
          <CreditCard className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">No Loan Products Available</h3>
        <p className="text-slate-500 mb-6 max-w-md">
          There are no active loan products available at the moment. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Progress Steps */}
      <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className={cn(
              "flex items-center gap-3",
              step === "product" && "text-blue-600"
            )}>
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
                step === "product" 
                  ? "bg-blue-100 text-blue-600" 
                  : "bg-slate-100 text-slate-600"
              )}>
                1
              </div>
              <span className="font-bold">Select Product</span>
            </div>
            
            <ChevronRight className="h-5 w-5 text-slate-300" />
            
            <div className={cn(
              "flex items-center gap-3",
              step === "amount" && "text-blue-600"
            )}>
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
                step === "amount" 
                  ? "bg-blue-100 text-blue-600" 
                  : selectedProduct 
                  ? "bg-emerald-100 text-emerald-600" 
                  : "bg-slate-100 text-slate-600"
              )}>
                {selectedProduct ? <CheckCircle className="h-5 w-5" /> : "2"}
              </div>
              <span className="font-bold">Enter Amount</span>
            </div>
            
            <ChevronRight className="h-5 w-5 text-slate-300" />
            
            <div className={cn(
              "flex items-center gap-3",
              step === "review" && "text-blue-600"
            )}>
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
                step === "review" 
                  ? "bg-blue-100 text-blue-600" 
                  : amount && typeof amount === 'number' 
                  ? "bg-emerald-100 text-emerald-600" 
                  : "bg-slate-100 text-slate-600"
              )}>
                {amount && typeof amount === 'number' ? <CheckCircle className="h-5 w-5" /> : "3"}
              </div>
              <span className="font-bold">Review & Apply</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="font-bold text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
            
            {/* Product Selection Step */}
            {(step === "product") && (
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">Choose a Loan Product</h3>
                </div>
                <p className="text-slate-500 mb-6">
                  Select the loan product that best fits your needs. Each product has different terms and rates.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        setSelectedProductId(product.id);
                        setTimeout(nextStep, 300); // Small delay for better UX
                      }}
                      className={cn(
                        "group relative rounded-2xl border p-6 text-left transition-all duration-300 hover:shadow-lg",
                        selectedProductId === product.id
                          ? "border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20"
                          : "border-slate-100 bg-white hover:border-blue-200"
                      )}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-slate-900 text-lg">{product.name}</h4>
                        <div className={cn(
                          "h-6 w-6 rounded-full border-2 transition-colors",
                          selectedProductId === product.id
                            ? "border-blue-500 bg-blue-500"
                            : "border-slate-300 group-hover:border-blue-300"
                        )}>
                          {selectedProductId === product.id && (
                            <div className="h-full w-full flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-white" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-6 line-clamp-2 min-h-[3em]">
                        {product.description || "Standard loan product with competitive rates."}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                          <Percent className="h-3 w-3" />
                          {product.interest_rate}% interest
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold">
                          <Calendar className="h-3 w-3" />
                          {product.duration_days} days
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Amount Input Step */}
            {(step === "amount" && selectedProduct) && (
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">Enter Loan Amount</h3>
                  </div>
                  <button
                    type="button"
                    onClick={prevStep}
                    className="text-sm font-bold text-slate-600 hover:text-blue-600"
                  >
                    ← Change Product
                  </button>
                </div>
                
                <p className="text-slate-500 mb-6">
                  How much would you like to borrow? Minimum: KES 100
                </p>
                
                <div className="space-y-6">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <span className="text-2xl font-bold text-slate-900">KES</span>
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                      placeholder="Enter amount"
                      min="100"
                      step="100"
                      className="w-full h-16 rounded-2xl border-2 border-slate-200 bg-slate-50 pl-20 pr-4 text-3xl font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none transition-all"
                    />
                  </div>
                  
                  {/* Quick Amount Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {[1000, 5000, 10000, 20000, 50000].map((quickAmount) => (
                      <button
                        key={quickAmount}
                        type="button"
                        onClick={() => setAmount(quickAmount)}
                        className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 hover:border-blue-300 transition-colors"
                      >
                        KES {quickAmount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Info className="h-4 w-4" />
                    The actual amount you qualify for may depend on your credit assessment.
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!amount || typeof amount !== 'number'}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Continue to Review
                  </button>
                </div>
              </div>
            )}

            {/* Review Step */}
            {(step === "review" && selectedProduct && calculations) && (
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">Review Your Application</h3>
                  </div>
                  <button
                    type="button"
                    onClick={prevStep}
                    className="text-sm font-bold text-slate-600 hover:text-blue-600"
                  >
                    ← Change Amount
                  </button>
                </div>
                
                <p className="text-slate-500 mb-6">
                  Please review your loan application details before submitting.
                </p>
                
                <div className="space-y-6">
                  {/* Application Summary */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Loan Details</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Product</span>
                            <span className="font-bold text-slate-900">{selectedProduct.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Interest Rate</span>
                            <span className="font-bold text-emerald-600">{selectedProduct.interest_rate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Duration</span>
                            <span className="font-bold text-slate-900">{selectedProduct.duration_days} days</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Financial Breakdown</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Principal</span>
                            <span className="font-bold text-slate-900">KES {calculations.principal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Interest</span>
                            <span className="font-bold text-red-600">KES {calculations.interest.toLocaleString()}</span>
                          </div>
                          {calculations.processingFee > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Processing Fee</span>
                              <span className="font-bold text-red-600">KES {calculations.processingFee.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-slate-600">Total Repayment</p>
                          <p className="text-xs text-slate-500">Due: {format(calculations.dueDate, 'PPP')}</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                          KES {calculations.totalPayable.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Terms & Conditions */}
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div className="space-y-2">
                        <h4 className="font-bold text-amber-800">Important Information</h4>
                        <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                          <li>Late repayments attract a penalty of {selectedProduct.penalty_rate}%</li>
                          <li>Your application will be reviewed within 24 hours</li>
                          <li>Funds will be disbursed to your M-Pesa upon approval</li>
                          <li>Ensure you have sufficient M-Pesa limit to receive funds</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-100">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="hidden" name="productId" value={selectedProductId} />
                    <input type="hidden" name="amount" value={amount.toString()} />
                    
                    <button
                      type="submit"
                      disabled={isPending || !userId}
                      className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold rounded-2xl hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Submitting Application...
                        </>
                      ) : !userId ? (
                        "Please log in to apply"
                      ) : (
                        <>
                          <Zap className="h-5 w-5" />
                          Submit Loan Application
                        </>
                      )}
                    </button>
                    
                    <p className="text-center text-xs text-slate-500">
                      By clicking submit, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Summary & Help */}
        <div className="space-y-6">
          
          {/* Quick Summary Card */}
          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900">At a Glance</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Quick Approval</p>
                  <p className="text-sm text-slate-500">Decisions within 24 hours</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Secure Process</p>
                  <p className="text-sm text-slate-500">Bank-level encryption</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">M-Pesa Disbursement</p>
                  <p className="text-sm text-slate-500">Funds sent directly to your phone</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Help Card */}
          <div className="rounded-[2.5rem] border border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <Info className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-white">Need Help?</h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-slate-400">
                Have questions about the application process or loan terms?
              </p>
              <div className="pt-4">
                <a 
                  href="tel:+254700000000"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/10 text-sm font-bold text-white hover:bg-white/20 transition-colors"
                >
                  Call Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}