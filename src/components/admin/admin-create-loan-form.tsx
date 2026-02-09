"use client";

import { useState, useMemo } from "react";
import { createCustomerLoanAction } from "@/actions/admin-loan-actions";
import { useRouter } from "next/navigation";
import {
  Mail, CreditCard, DollarSign, FileText, AlertCircle,
  Loader2, User, Percent, Calendar, Calculator,
  ChevronRight, Users, Phone, CheckCircle, XCircle,
  Clock, Receipt, Shield, BadgeCheck
} from "lucide-react";
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

interface Customer {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface AdminCreateLoanFormProps {
  products: Product[];
  recentCustomers: Customer[];
}

export function AdminCreateLoanForm({ products, recentCustomers }: AdminCreateLoanFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<"customer" | "product" | "amount" | "review">("customer");
  const [customerId, setCustomerId] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [productId, setProductId] = useState("");
  const [principalAmount, setPrincipalAmount] = useState<number | "">("");
  const [disbursementRef, setDisbursementRef] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Find selected product
  const selectedProduct = useMemo(() =>
    products.find(p => p.id === productId),
    [productId, products]
  );

  // Find selected customer
  const selectedCustomer = useMemo(() =>
    recentCustomers.find(c => c.id === customerId),
    [customerId, recentCustomers]
  );

  // Calculate loan details
  const calculations = useMemo(() => {
    if (!selectedProduct || !principalAmount || typeof principalAmount !== 'number') return null;

    const principal = principalAmount;
    const interest = (principal * selectedProduct.interest_rate) / 100;
    const processingFee = selectedProduct.processing_fee || 0;
    const totalPayable = principal + interest + processingFee;
    const dailyRate = interest / selectedProduct.duration_days;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + selectedProduct.duration_days);

    return {
      principal,
      interest,
      processingFee,
      totalPayable,
      dailyRate,
      dueDate: dueDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      dueDateObj: dueDate
    };
  }, [principalAmount, selectedProduct]);

  const nextStep = () => {
    setError(null);
    setSuccess(null);

    if (step === "customer" && customerId) {
      setStep("product");
    } else if (step === "product" && productId) {
      setStep("amount");
    } else if (step === "amount" && principalAmount && typeof principalAmount === 'number' && disbursementRef) {
      setStep("review");
    }
  };

  const prevStep = () => {
    setError(null);
    setSuccess(null);
    if (step === "review") setStep("amount");
    else if (step === "amount") setStep("product");
    else if (step === "product") setStep("customer");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!customerId || !productId || !principalAmount || !disbursementRef) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("customerId", customerId);
      formData.append("productId", productId);
      formData.append("principalAmount", principalAmount.toString());
      formData.append("disbursementRef", disbursementRef);
      if (notes) formData.append("notes", notes);

      const result = await createCustomerLoanAction(formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.success);
        // Reset form after successful submission
        setTimeout(() => {
          setCustomerId("");
          setCustomerEmail("");
          setCustomerName("");
          setProductId("");
          setPrincipalAmount("");
          setDisbursementRef("");
          setNotes("");
          setStep("customer");
          setSuccess(null);
          router.refresh();
        }, 3000);
      }
    } catch (error) {
      console.error("Loan creation failed:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* Progress Steps */}
      <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {["customer", "product", "amount", "review"].map((stepName, index) => (
              <div key={stepName} className="flex items-center gap-3">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
                  step === stepName
                    ? "bg-primary/10 text-primary"
                    : index < ["customer", "product", "amount", "review"].indexOf(step)
                      ? "bg-primary/20 text-primary-deep"
                      : "bg-slate-100 text-slate-600"
                )}>
                  {index < ["customer", "product", "amount", "review"].indexOf(step) ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={cn(
                  "font-bold",
                  step === stepName ? "text-primary" : "text-slate-600"
                )}>
                  {stepName === "customer" && "Customer"}
                  {stepName === "product" && "Product"}
                  {stepName === "amount" && "Amount"}
                  {stepName === "review" && "Review"}
                </span>
                {index < 3 && <ChevronRight className="h-5 w-5 text-slate-300 ml-8" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <div className="space-y-1">
              <p className="font-bold text-emerald-700">Loan Created Successfully!</p>
              <p className="text-emerald-600 text-sm">{success}</p>
              <p className="text-emerald-500 text-xs mt-2">Redirecting in 3 seconds...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && !success && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-600" />
            <p className="font-bold text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden">

        {/* Customer Selection Step */}
        {step === "customer" && (
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Select Customer</h3>
            </div>

            <p className="text-slate-500 mb-6">
              Choose an existing customer to create a loan for.
            </p>

            <div className="space-y-6">
              {/* Customer Selection */}
              {recentCustomers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => {
                        setCustomerId(customer.id);
                        setCustomerEmail(customer.email);
                        if (customer.first_name && customer.last_name) {
                          setCustomerName(`${customer.first_name} ${customer.last_name}`);
                        } else {
                          setCustomerName(customer.email);
                        }
                      }}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all",
                        customerId === customer.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-slate-200 hover:border-primary/40 hover:bg-primary/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-lg">
                          {customer.email[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 text-sm">
                            {customer.first_name && customer.last_name
                              ? `${customer.first_name} ${customer.last_name}`
                              : customer.email
                            }
                          </p>
                          <p className="text-xs text-slate-500 truncate">{customer.email}</p>
                        </div>
                        {customerId === customer.id && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl">
                  <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No customers found.</p>
                  <p className="text-sm text-slate-400 mt-1">Create customers first before creating loans.</p>
                </div>
              )}

              {/* Selected Customer Info */}
              {selectedCustomer && (
                <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-bold text-primary-deep">Selected Customer:</p>
                      <p className="text-primary text-sm">
                        {customerName} ({customerEmail})
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={nextStep}
                disabled={!customerId}
                className="w-full h-12 bg-primary text-white font-bold rounded-2xl hover:bg-primary-deep shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {selectedCustomer ? `Continue for ${selectedCustomer.first_name || selectedCustomer.email}` : "Continue to Product Selection"}
              </button>
            </div>
          </div>
        )}

        {/* Product Selection Step */}
        {step === "product" && selectedCustomer && (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CreditCard className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Select Loan Product</h3>
              </div>
              <button
                type="button"
                onClick={prevStep}
                className="text-sm font-bold text-slate-600 hover:text-primary"
              >
                ← Change Customer
              </button>
            </div>

            <p className="text-slate-500 mb-6">
              Choose the loan product for {selectedCustomer.first_name || selectedCustomer.email}.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    setProductId(product.id);
                    nextStep();
                  }}
                  className={cn(
                    "group relative rounded-2xl border p-6 text-left transition-all duration-300 hover:shadow-lg",
                    productId === product.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-slate-100 bg-white hover:border-primary/20"
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-900 text-lg">{product.name}</h4>
                    <div className={cn(
                      "h-6 w-6 rounded-full border-2 transition-colors",
                      productId === product.id
                        ? "border-primary bg-primary"
                        : "border-slate-300 group-hover:border-primary/40"
                    )}>
                      {productId === product.id && (
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
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold">
                      <Calendar className="h-3 w-3" />
                      {product.duration_days} days
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Amount & Disbursement Step */}
        {step === "amount" && selectedProduct && selectedCustomer && (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <DollarSign className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Loan Amount & Disbursement</h3>
              </div>
              <button
                type="button"
                onClick={prevStep}
                className="text-sm font-bold text-slate-600 hover:text-primary"
              >
                ← Change Product
              </button>
            </div>

            <div className="space-y-6">
              {/* Customer Info Summary */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Customer</p>
                    <p className="font-bold text-slate-900">{customerName}</p>
                    <p className="text-sm text-slate-600">{customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Product</p>
                    <p className="font-bold text-slate-900">{selectedProduct.name}</p>
                    <p className="text-sm text-slate-600">{selectedProduct.interest_rate}% for {selectedProduct.duration_days} days</p>
                  </div>
                </div>
              </div>

              {/* Principal Amount */}
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">
                  Principal Amount (KES) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="number"
                    value={principalAmount}
                    onChange={(e) => setPrincipalAmount(e.target.value ? Number(e.target.value) : "")}
                    placeholder="Enter loan amount"
                    min="100"
                    step="100"
                    className="w-full h-12 rounded-2xl border-2 border-slate-200 bg-slate-50 pl-12 pr-4 text-2xl font-bold text-slate-900 placeholder:text-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Minimum amount: KES 100
                </p>
              </div>

              {/* Disbursement Reference */}
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">
                  M-Pesa Disbursement Reference *
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={disbursementRef}
                    onChange={(e) => setDisbursementRef(e.target.value.toUpperCase())}
                    placeholder="e.g. RJH82D9K3L"
                    className="w-full h-12 rounded-2xl border-2 border-slate-200 bg-slate-50 pl-12 pr-4 text-slate-900 placeholder:text-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Enter the M-Pesa transaction reference for disbursement
                </p>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information about this loan..."
                  rows={3}
                  className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none resize-none transition-all"
                />
              </div>

              {/* Quick Calculations Preview */}
              {calculations && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calculator className="h-5 w-5 text-primary" />
                    <h4 className="font-bold text-slate-900">Quick Preview</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Interest ({selectedProduct.interest_rate}%)</span>
                      <span className="font-bold text-red-600">KES {calculations.interest.toLocaleString()}</span>
                    </div>
                    {calculations.processingFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Processing Fee</span>
                        <span className="font-bold text-red-600">KES {calculations.processingFee.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700">Total Payable</span>
                        <span className="text-lg font-bold text-primary">
                          KES {calculations.totalPayable.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={nextStep}
                disabled={!principalAmount || !disbursementRef}
                className="w-full h-12 bg-primary text-white font-bold rounded-2xl hover:bg-primary-deep shadow-lg shadow-primary/20 transition-all duration-300"
              >
                Review & Create Loan
              </button>
            </div>
          </div>
        )}

        {/* Review Step */}
        {step === "review" && selectedProduct && selectedCustomer && calculations && (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Review & Confirm</h3>
              </div>
              <button
                type="button"
                onClick={prevStep}
                className="text-sm font-bold text-slate-600 hover:text-primary"
              >
                ← Edit Details
              </button>
            </div>

            <p className="text-slate-500 mb-6">
              Please review all details before creating the loan.
            </p>

            <div className="space-y-6">
              {/* Summary Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Customer Details */}
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Customer Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="font-bold text-slate-900">{customerEmail}</span>
                      </div>
                      {customerName && customerName !== customerEmail && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-700">{customerName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Loan Details */}
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Loan Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Product</span>
                        <span className="font-bold text-slate-900">{selectedProduct.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Duration</span>
                        <span className="font-bold text-slate-900">{selectedProduct.duration_days} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Disbursement Ref</span>
                        <span className="font-bold text-slate-900">{disbursementRef}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Breakdown */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Financial Breakdown</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-primary" />
                        <span className="text-slate-700">Principal Amount</span>
                      </div>
                      <span className="text-xl font-bold text-slate-900">KES {calculations.principal.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-emerald-500" />
                        <span className="text-slate-600">Interest ({selectedProduct.interest_rate}%)</span>
                      </div>
                      <span className="font-bold text-red-600">+ KES {calculations.interest.toLocaleString()}</span>
                    </div>

                    {calculations.processingFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Processing Fee</span>
                        <span className="font-bold text-red-600">+ KES {calculations.processingFee.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-200">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Calculator className="h-4 w-4 text-primary" />
                          <span className="font-bold text-slate-900">Total Payable</span>
                        </div>
                        <span className="text-2xl font-bold text-primary">KES {calculations.totalPayable.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <h5 className="text-sm font-bold text-slate-700">Repayment Schedule</h5>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-600">Daily Rate: <span className="font-bold">KES {calculations.dailyRate.toFixed(2)}</span></p>
                    <p className="text-xs text-slate-600">Due Date: <span className="font-bold">{calculations.dueDate}</span></p>
                  </div>

                  {notes && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <h5 className="text-sm font-bold text-slate-700">Additional Notes</h5>
                      </div>
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">{notes}</p>
                    </div>
                  )}
                </div>

                {/* Security & Compliance Notice */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs font-bold text-primary-deep">Security Notice</p>
                      <p className="text-xs text-primary">
                        This action will create a permanent ledger entry. Please verify all details before proceeding.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 h-12 border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:border-slate-300 hover:bg-slate-50 transition-all duration-300"
              >
                Back to Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 h-12 bg-primary text-white font-bold rounded-2xl hover:bg-primary-deep shadow-lg shadow-primary/20 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Loan...
                  </>
                ) : (
                  <>
                    <BadgeCheck className="h-5 w-5" />
                    Create & Disburse Loan
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}