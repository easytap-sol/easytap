"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// --- ADMIN LOAN CREATION (FOR EXISTING CUSTOMERS) ---

export async function createCustomerLoanAction(formData: FormData) {
  const supabase = await createClient();

  // Auth & Role Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: "Unauthorized" };

  // Get form data
  const customerId = formData.get("customerId") as string;
  const productId = formData.get("productId") as string;
  const principalAmount = Number(formData.get("principalAmount"));
  const disbursementRef = formData.get("disbursementRef") as string;
  const notes = formData.get("notes") as string;

  // Validation
  if (!customerId || !productId || !principalAmount || !disbursementRef) {
    return { error: "All required fields are required" };
  }

  if (isNaN(principalAmount) || principalAmount <= 0) {
    return { error: "Invalid principal amount" };
  }

  if (disbursementRef.length < 5) {
    return { error: "Disbursement reference must be at least 5 characters" };
  }

  try {
    // 1. Verify customer exists and is a customer
    const { data: customerProfile, error: customerError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role')
      .eq('id', customerId)
      .single();

    if (customerError || !customerProfile) {
      return { error: "Customer not found" };
    }

    if (customerProfile.role !== 'customer') {
      return { error: "Selected user is not a customer" };
    }

    // 2. Get product details
    const { data: product } = await supabase
      .from('loan_products')
      .select('*')
      .eq('id', productId)
      .single();

    if (!product) {
      return { error: "Selected loan product not found" };
    }

    if (!product.is_active) {
      return { error: "Selected loan product is not active" };
    }

    // 3. Check for duplicate disbursement reference
    const { data: existingLoan } = await supabase
      .from('loans')
      .select('id')
      .eq('disbursement_ref', disbursementRef)
      .maybeSingle();

    if (existingLoan) {
      return { error: "This disbursement reference has already been used for another loan." };
    }

    // 4. Calculate loan details
    const processingFee = product.processing_fee || 0;
    const interest = (principalAmount * product.interest_rate) / 100;
    const totalPayable = principalAmount + interest + processingFee;
    const loanRef = `LN-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // 5. Create loan (immediately active with disbursement)
    const { error: loanError, data: newLoan } = await supabase
      .from('loans')
      .insert({
        user_id: customerProfile.id,
        product_id: productId,
        principal_amount: principalAmount,
        interest_amount: interest,
        processing_fee: processingFee,
        // total_payable and balance_due are generated columns - don't insert them
        amount_paid: 0,
        status: 'active',
        loan_ref: loanRef,
        disbursement_ref: disbursementRef,
        disbursed_at: new Date().toISOString(),
        disbursed_by: user.id,
        disbursement_method: 'mpesa',
        notes: notes || null,
        created_at: new Date().toISOString()
      })
      .select('id, loan_ref')
      .single();

    if (loanError) {
      console.error("Loan creation error:", loanError);
      return { error: `Failed to create loan: ${loanError.message}` };
    }

    // 6. Ledger Entry (Financial Recording) - Disbursement
    // First, try to find appropriate accounts
    const { data: accounts } = await supabase
      .from('chart_of_accounts')
      .select('id, name');

    if (accounts) {
      // Find cash/bank account
      const cashAccount = accounts.find(a =>
        a.name.toLowerCase().includes('cash') ||
        a.name.toLowerCase().includes('bank') ||
        a.name.toLowerCase().includes('mpesa')
      );

      // Find receivable account
      const receivableAccount = accounts.find(a =>
        a.name.toLowerCase().includes('receivable') ||
        a.name.toLowerCase().includes('portfolio') ||
        a.name.toLowerCase().includes('loan')
      );

      // Use first two accounts if specific ones not found
      const account1 = cashAccount || accounts[0];
      const account2 = receivableAccount || (accounts[1] || accounts[0]);

      if (account1 && account2) {
        await supabase.from('ledger_entries').insert({
          amount: principalAmount,
          debit_account_id: account2.id, // Receivable account (increase)
          credit_account_id: account1.id, // Cash account (decrease)
          description: `Loan Disbursement: ${loanRef} for ${customerProfile.email} - Ref: ${disbursementRef}`,
          recorded_by: user.id,
          related_loan_id: newLoan.id,
          transaction_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
      }
    }

    revalidatePath("/admin/loans");
    revalidatePath("/admin/overview");
    revalidatePath("/admin/customers");

    return {
      success: `Loan ${loanRef} created successfully for ${customerProfile.email}.`,
      loanRef: loanRef,
      customerEmail: customerProfile.email
    };
  } catch (error: any) {
    console.error("Error creating customer loan:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

// --- ADMIN DIRECT REPAYMENT RECORDING (For customer loans) ---

export async function recordCustomerRepaymentAction(formData: FormData) {
  const supabase = await createClient();

  // Auth & Role Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: "Unauthorized" };

  const loanId = formData.get("loanId") as string;
  const amount = Number(formData.get("amount"));
  const transactionRef = formData.get("transactionRef") as string;
  const notes = formData.get("notes") as string;

  if (!loanId || isNaN(amount) || amount <= 0) return { error: "Invalid input" };
  if (!transactionRef) return { error: "Transaction Reference (e.g. M-Pesa ID) is required." };

  // Get Loan with customer details
  const { data: loan } = await supabase
    .from('loans')
    .select(`
      *,
      profiles:user_id (
        email,
        first_name,
        last_name
      )
    `)
    .eq('id', loanId)
    .single();

  if (!loan) return { error: "Loan not found" };

  // Validation: Prevent repayment on already paid loans
  if (loan.status === 'paid' || (loan.balance_due || 0) <= 0) {
    return { error: "This loan is already fully repaid and closed." };
  }

  // Validation: Block overpayment
  if (amount > (loan.balance_due || 0)) {
    return { error: `Repayment amount (KES ${amount}) exceeds the balance due (KES ${loan.balance_due}).` };
  }

  // Check for duplicate transaction reference
  const { data: existingRepayment } = await supabase
    .from('repayments')
    .select('id')
    .eq('transaction_ref', transactionRef)
    .maybeSingle();

  if (existingRepayment) {
    return { error: "This transaction reference has already been used for another repayment." };
  }

  // Create Repayment Record
  const { data: repayment, error: repError } = await supabase
    .from('repayments')
    .insert({
      loan_id: loanId,
      user_id: loan.user_id,
      amount: amount,
      payment_date: new Date().toISOString(),
      recorded_by: user.id,
      transaction_ref: transactionRef,
      notes: notes || `Recorded by Admin on behalf of customer`,
      payment_method: 'mpesa'
    })
    .select()
    .single();

  if (repError) {
    return { error: repError.message };
  }

  // Update Loan Balance
  const newAmountPaid = (loan.amount_paid || 0) + amount;
  const newStatus = newAmountPaid >= (loan.total_payable || 0) ? 'paid' : loan.status;

  const { error: updateError } = await supabase.from('loans').update({
    amount_paid: newAmountPaid,
    status: newStatus,
    updated_at: new Date().toISOString()
  }).eq('id', loanId);

  if (updateError) return { error: updateError.message };

  // Financial Ledger Integration
  const { data: accounts } = await supabase.from('chart_of_accounts').select('id, name');

  if (accounts && accounts.length >= 2) {
    // Find cash/bank account
    const cashAccount = accounts.find(a =>
      a.name.toLowerCase().includes('cash') ||
      a.name.toLowerCase().includes('bank') ||
      a.name.toLowerCase().includes('mpesa')
    );

    // Find receivable account
    const receivableAccount = accounts.find(a =>
      a.name.toLowerCase().includes('receivable') ||
      a.name.toLowerCase().includes('portfolio') ||
      a.name.toLowerCase().includes('loan')
    );

    // Find income account
    const incomeAccount = accounts.find(a =>
      a.name.toLowerCase().includes('interest') ||
      a.name.toLowerCase().includes('income') ||
      a.name.toLowerCase().includes('revenue')
    );

    const account1 = cashAccount || accounts[0];
    const account2 = receivableAccount || (accounts[1] || accounts[0]);
    const account3 = incomeAccount || account2; // Fallback to receivable if no income account

    // Calculate split: interest vs principal
    const totalPayable = loan.total_payable || 1;
    const interestRatio = (loan.interest_amount || 0) / totalPayable;
    const interestPortion = Math.round(amount * interestRatio * 100) / 100;
    const principalPortion = amount - interestPortion;

    // Entry 1: Principal Portion
    if (principalPortion > 0) {
      await supabase.from('ledger_entries').insert({
        amount: principalPortion,
        debit_account_id: account1.id, // Increase Cash
        credit_account_id: account2.id, // Decrease Receivable
        description: `Loan Repayment (Principal): ${loan.loan_ref} - Ref: ${transactionRef}`,
        recorded_by: user.id,
        related_loan_id: loanId,
        related_repayment_id: repayment.id,
        transaction_date: new Date().toISOString()
      });
    }

    // Entry 2: Interest Portion
    if (interestPortion > 0) {
      await supabase.from('ledger_entries').insert({
        amount: interestPortion,
        debit_account_id: account1.id, // Increase Cash
        credit_account_id: account3.id, // Recognize Income (or decrease receivable if no income account)
        description: `Loan Repayment (Interest Earned): ${loan.loan_ref} - Ref: ${transactionRef}`,
        recorded_by: user.id,
        related_loan_id: loanId,
        related_repayment_id: repayment.id,
        transaction_date: new Date().toISOString()
      });
    }
  }

  revalidatePath('/admin/loans');
  revalidatePath('/admin/overview');
  revalidatePath(`/admin/customers/${loan.user_id}/loans`);

  const customerEmail = (loan as any).profiles?.email || 'Customer';
  return {
    success: `Repayment of KES ${amount.toLocaleString()} recorded for ${customerEmail}'s loan ${loan.loan_ref}.`,
    newBalance: (loan.balance_due || 0) - amount
  };
}