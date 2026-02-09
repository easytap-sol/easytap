"use client";

import { useState } from "react";
import { approveLoanAction, rejectLoanAction, recordRepaymentAction } from "@/actions/loan-actions";
import { useRouter } from "next/navigation";
import {
  User, Calendar, Clock, ChevronDown, ChevronUp,
  AlertCircle, DollarSign, CheckCircle, XCircle,
  TrendingUp, FileText, Phone, Mail, CreditCard,
  Percent, Zap, Shield, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminLoanCard({ loan }: { loan: any }) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  // Form visibility states (separate from loading states)
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showRepaymentForm, setShowRepaymentForm] = useState(false);

  // Loading states (only true when actually processing)
  const [isRejecting, setIsRejecting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRecordingRepayment, setIsRecordingRepayment] = useState(false);
  const [disbursementRef, setDisbursementRef] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [repaymentAmount, setRepaymentAmount] = useState("");
  const [repaymentRef, setRepaymentRef] = useState("");
  const [repaymentNotes, setRepaymentNotes] = useState("");
  const [approveError, setApproveError] = useState<string | null>(null);
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [repaymentError, setRepaymentError] = useState<string | null>(null);

  const handleApprove = async () => {
    console.log("Starting approval...");
    if (!disbursementRef.trim()) {
      setApproveError("Please enter M-Pesa Transaction ID");
      return;
    }

    if (!confirm(`Confirm disbursement of KES ${loan.principal_amount?.toLocaleString()}?`)) return;

    setApproveError(null);
    setIsApproving(true);

    try {
      console.log("Calling approveLoanAction...");
      const result = await approveLoanAction(loan.id, disbursementRef);
      console.log("Approval result:", result);

      if (result?.error) {
        setApproveError(result.error);
        setIsApproving(false);
      } else if (result?.success) {
        alert(result.success);
        setDisbursementRef("");
        setIsExpanded(false);
        setShowApproveForm(false);
        setIsApproving(false);
        router.refresh();
      }
    } catch (error: any) {
      console.error("Approval failed:", error);
      setApproveError(error.message || "Failed to approve loan");
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setRejectError("Please provide a rejection reason");
      return;
    }

    setRejectError(null);
    setIsRejecting(true);

    try {
      const result = await rejectLoanAction(loan.id, rejectionReason);
      if (result?.error) {
        setRejectError(result.error);
        setIsRejecting(false);
      } else {
        alert(result?.success || "Loan rejected successfully");
        setRejectionReason("");
        setIsExpanded(false);
        setShowRejectForm(false);
        setIsRejecting(false);
        router.refresh();
      }
    } catch (error: any) {
      console.error("Rejection failed:", error);
      setRejectError(error.message || "Failed to reject loan");
      setIsRejecting(false);
    }
  };

  const handleRecordRepayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repaymentAmount || !repaymentRef) {
      setRepaymentError("Please fill in both amount and transaction reference");
      return;
    }

    const amount = parseFloat(repaymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setRepaymentError("Please enter a valid amount");
      return;
    }

    setRepaymentError(null);
    setIsRecordingRepayment(true);

    const formData = new FormData();
    formData.append("loanId", loan.id);
    formData.append("amount", repaymentAmount);
    formData.append("transactionRef", repaymentRef);
    formData.append("notes", repaymentNotes);

    try {
      const result = await recordRepaymentAction(formData);
      if (result?.error) {
        setRepaymentError(result.error);
        setIsRecordingRepayment(false);
      } else {
        alert(result?.success || "Repayment recorded successfully");
        setRepaymentAmount("");
        setRepaymentRef("");
        setRepaymentNotes("");
        setShowRepaymentForm(false);
        setIsRecordingRepayment(false);
        router.refresh();
      }
    } catch (error: any) {
      console.error("Repayment recording failed:", error);
      setRepaymentError(error.message || "Failed to record repayment");
      setIsRecordingRepayment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      case 'active': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      case 'paid': return { bg: 'bg-primary/10', text: 'text-primary-deep', border: 'border-primary/20' };
      case 'rejected': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'active': return <TrendingUp className="h-4 w-4" />;
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const statusColors = getStatusColor(loan.status);
  const progressPercentage = loan.total_payable
    ? Math.round(((loan.amount_paid || 0) / loan.total_payable) * 100)
    : 0;

  return (
    <div className={cn(
      "group relative rounded-[2rem] border p-0 overflow-hidden transition-all duration-300 hover:shadow-lg",
      isExpanded ? "shadow-md border-slate-200" : "border-slate-100",
      statusColors.border
    )}>
      {/* Summary Row */}
      <div
        className="p-6 cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-start lg:items-center gap-4 flex-1">
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl shrink-0",
              statusColors.bg,
              statusColors.text
            )}>
              {getStatusIcon(loan.status)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-slate-900 truncate">
                  {loan.profiles?.first_name} {loan.profiles?.last_name}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  <FileText className="h-3 w-3" />
                  {loan.loan_ref}
                </span>
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                  statusColors.bg,
                  statusColors.text
                )}>
                  {loan.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Applied {new Date(loan.created_at).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  {loan.loan_products?.interest_rate}% interest
                </span>
                {loan.due_date && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Due {new Date(loan.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Principal</p>
              <p className="text-xl font-bold text-slate-900">
                KES {loan.principal_amount?.toLocaleString()}
              </p>
              {loan.status === 'active' && (
                <p className="text-sm text-slate-500 mt-1">
                  Balance: KES {loan.balance_due?.toLocaleString()}
                </p>
              )}
            </div>

            <div className={cn(
              "p-2 rounded-xl transition-colors",
              isExpanded ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
            )}>
              <ChevronDown className={cn(
                "h-5 w-5 transition-transform duration-300",
                isExpanded && "rotate-180"
              )} />
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t animate-in slide-in-from-top-2 duration-300">
          <div className="p-8 grid md:grid-cols-3 gap-8 bg-gradient-to-b from-slate-50/50 to-white">

            {/* Left Column: Customer & Financial Details */}
            <div className="space-y-8">
              {/* Customer Profile Card */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <h4 className="font-bold text-slate-900">Customer Profile</h4>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-sm">
                      {loan.profiles?.first_name?.[0]}{loan.profiles?.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        {loan.profiles?.first_name} {loan.profiles?.last_name}
                      </p>
                      <p className="text-sm text-slate-500">Customer</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-700">{loan.profiles?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-700">{loan.profiles?.mobile_number}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-700">ID: {loan.profiles?.national_id || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loan Terms Card */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <h4 className="font-bold text-slate-900">Loan Terms</h4>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
                    <span className="text-sm text-slate-600">Product</span>
                    <span className="font-bold text-slate-900">{loan.loan_products?.name}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
                    <span className="text-sm text-slate-600">Duration</span>
                    <span className="font-bold text-slate-900">{loan.loan_products?.duration_days} days</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
                    <span className="text-sm text-slate-600">Interest Rate</span>
                    <span className="font-bold text-emerald-600">{loan.loan_products?.interest_rate}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
                    <span className="text-sm text-slate-600">Total Payable</span>
                    <span className="font-bold text-slate-900">KES {loan.total_payable?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column: Repayment Progress & Actions */}
            <div className="space-y-8">
              {/* Repayment Progress Card */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <h4 className="font-bold text-slate-900">Repayment Progress</h4>
                  </div>
                  <span className="text-lg font-bold text-primary">{progressPercentage}%</span>
                </div>

                <div className="space-y-4">
                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary-deep transition-all duration-1000"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-xl bg-emerald-50">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Paid</p>
                      <p className="text-xl font-bold text-emerald-700">
                        KES {loan.amount_paid?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-red-50">
                      <p className="text-xs font-bold uppercase tracking-wider text-red-600 mb-1">Balance</p>
                      <p className="text-xl font-bold text-red-700">
                        KES {loan.balance_due?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Card */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Zap className="h-4 w-4" />
                  </div>
                  <h4 className="font-bold text-slate-900">Quick Actions</h4>
                </div>

                <div className="space-y-3">
                  {/* Pending Loan Actions */}
                  {loan.status === 'pending' && (
                    <>
                      {!showRejectForm && !showApproveForm && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setShowRejectForm(true);
                              setShowApproveForm(false);
                              setApproveError(null);
                              setRejectError(null);
                            }}
                            className="flex-1 h-12 px-4 border border-red-200 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => {
                              setShowApproveForm(true);
                              setShowRejectForm(false);
                              setApproveError(null);
                              setRejectError(null);
                            }}
                            className="flex-1 h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-deep transition-all"
                          >
                            Approve
                          </button>
                        </div>
                      )}

                      {showApproveForm && (
                        <div className="space-y-4 animate-in zoom-in-95">
                          {approveError && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                              <p className="text-sm font-bold text-red-700">{approveError}</p>
                            </div>
                          )}

                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">
                              M-Pesa Transaction ID *
                            </label>
                            <input
                              autoFocus
                              type="text"
                              placeholder="e.g. RJH82D9K3L"
                              value={disbursementRef}
                              onChange={(e) => setDisbursementRef(e.target.value.toUpperCase())}
                              className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                            <p className="text-xs text-slate-500">
                              Enter the M-Pesa transaction reference for disbursement
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleApprove}
                              disabled={isApproving || !disbursementRef.trim()}
                              className="flex-1 h-12 bg-primary text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {isApproving ? (
                                <>
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                'Confirm Disbursement'
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setShowApproveForm(false);
                                setDisbursementRef("");
                                setApproveError(null);
                              }}
                              className="h-12 px-4 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {showRejectForm && (
                        <div className="space-y-4 animate-in zoom-in-95">
                          {rejectError && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                              <p className="text-sm font-bold text-red-700">{rejectError}</p>
                            </div>
                          )}

                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">
                              Reason for Rejection *
                            </label>
                            <textarea
                              autoFocus
                              placeholder="Please provide a reason for rejecting this application..."
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              rows={3}
                              className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none resize-none"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleReject}
                              disabled={isRejecting || !rejectionReason.trim()}
                              className="flex-1 h-12 bg-red-600 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {isRejecting ? (
                                <>
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                'Reject Application'
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setShowRejectForm(false);
                                setRejectionReason("");
                                setRejectError(null);
                              }}
                              className="h-12 px-4 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Active Loan Actions */}
                  {loan.status === 'active' && (
                    <>
                      {!showRepaymentForm ? (
                        <button
                          onClick={() => {
                            setShowRepaymentForm(true);
                            setRepaymentError(null);
                          }}
                          className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-deep transition-all"
                        >
                          Record Repayment
                        </button>
                      ) : (
                        <form onSubmit={handleRecordRepayment} className="space-y-4 animate-in zoom-in-95">
                          {repaymentError && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                              <p className="text-sm font-bold text-red-700">{repaymentError}</p>
                            </div>
                          )}

                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Amount (KES) *</label>
                            <input
                              autoFocus
                              type="number"
                              placeholder="Enter amount"
                              value={repaymentAmount}
                              onChange={(e) => setRepaymentAmount(e.target.value)}
                              min="1"
                              step="0.01"
                              className="w-full h-12 rounded-xl border border-primary/20 bg-white px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">M-Pesa Reference *</label>
                            <input
                              type="text"
                              placeholder="M-Pesa transaction ID"
                              value={repaymentRef}
                              onChange={(e) => setRepaymentRef(e.target.value.toUpperCase())}
                              className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Notes (Optional)</label>
                            <textarea
                              placeholder="Any additional notes..."
                              value={repaymentNotes}
                              onChange={(e) => setRepaymentNotes(e.target.value)}
                              rows={2}
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={isRecordingRepayment || !repaymentAmount || !repaymentRef}
                              className="flex-1 h-12 bg-primary text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                            >
                              {isRecordingRepayment ? (
                                <>
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                'Record Payment'
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsRecordingRepayment(false);
                                setRepaymentAmount("");
                                setRepaymentRef("");
                                setRepaymentNotes("");
                                setRepaymentError(null);
                              }}
                              className="h-12 px-4 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  )}

                  {/* Paid Loan Status */}
                  {loan.status === 'paid' && (
                    <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-primary/10 border border-primary/20">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span className="font-bold text-primary-deep">Loan Fully Repaid & Closed</span>
                    </div>
                  )}

                  {/* Rejected Loan Status */}
                  {loan.status === 'rejected' && (
                    <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-100">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="font-bold text-red-700">Application Rejected</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Activity Timeline */}
            <div className="space-y-8">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <Clock className="h-4 w-4" />
                  </div>
                  <h4 className="font-bold text-slate-900">Activity Timeline</h4>
                </div>

                <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-slate-200">
                  {/* Application Received */}
                  <div className="relative flex gap-4 items-start">
                    <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border-4 border-white">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-sm">Application Received</p>
                      <p className="text-xs text-slate-500">{new Date(loan.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Disbursement */}
                  {loan.disbursed_at && (
                    <div className="relative flex gap-4 items-start">
                      <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 border-4 border-white">
                        <CreditCard className="h-3 w-3 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-emerald-700 text-sm">Disbursed via M-Pesa</p>
                        <p className="text-xs text-slate-500">
                          Ref: {loan.disbursement_ref} • {new Date(loan.disbursed_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Rejection */}
                  {loan.status === 'rejected' && loan.rejection_reason && (
                    <div className="relative flex gap-4 items-start">
                      <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-100 border-4 border-white">
                        <XCircle className="h-3 w-3 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-red-700 text-sm">Application Rejected</p>
                        <p className="text-xs text-slate-500">{loan.rejection_reason}</p>
                        <p className="text-xs text-slate-500">{new Date(loan.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}

                  {/* Repayments */}
                  {loan.repayments?.map((rep: any, index: number) => (
                    <div key={rep.id} className="relative flex gap-4 items-start">
                      <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 border-4 border-white">
                        <DollarSign className="h-3 w-3 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-green-700 text-sm">
                          Repayment #{index + 1}: KES {rep.amount?.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          Ref: {rep.transaction_ref} • {new Date(rep.payment_date).toLocaleString()}
                        </p>
                        {rep.notes && (
                          <p className="text-xs text-slate-500 mt-1">Note: {rep.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Loan Closed */}
                  {loan.status === 'paid' && (
                    <div className="relative flex gap-4 items-start">
                      <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border-4 border-white">
                        <CheckCircle className="h-3 w-3 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-primary-deep text-sm">Loan Fully Repaid</p>
                        <p className="text-xs text-slate-500">All payments completed</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}