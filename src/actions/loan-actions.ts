"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// --- LOAN PRODUCTS ---

export async function createProductAction(formData: FormData) {
    const supabase = await createClient();

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // Role Check
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return { error: "Unauthorized" };

    const name = formData.get("name") as string;
    const interestRate = Number(formData.get("interestRate"));
    const durationDays = Number(formData.get("durationDays"));
    const processingFee = Number(formData.get("processingFee")) || 0;
    const penaltyRate = Number(formData.get("penaltyRate")) || 0;
    const description = formData.get("description") as string;

    if (!name || isNaN(interestRate) || isNaN(durationDays)) {
        return { error: "Invalid input" };
    }

    const { error } = await supabase.from('loan_products').insert({
        name,
        interest_rate: interestRate,
        duration_days: durationDays,
        processing_fee: processingFee,
        penalty_rate: penaltyRate,
        description: description,
        is_active: true
    });

    if (error) return { error: error.message };

    revalidatePath('/admin/products');
    return { success: "Product created successfully." };
}

export async function toggleProductStatusAction(id: string, currentStatus: boolean) {
    const supabase = await createClient();

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return { error: "Unauthorized" };

    const { error } = await supabase.from('loan_products').update({
        is_active: !currentStatus
    }).eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/admin/products');
    return { success: "Status updated." };
}

// --- LOAN APPLICATIONS ---

export async function applyForLoanAction(formData: FormData) {
    const supabase = await createClient();

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const productId = formData.get("productId") as string;
    const amount = Number(formData.get("amount"));

    if (!productId || isNaN(amount) || amount <= 0) {
        return { error: "Invalid input" };
    }

    // Get Product Details
    const { data: product } = await supabase.from('loan_products').select('*').eq('id', productId).single();
    if (!product || !product.is_active) return { error: "Product not available." };

    // Calculate details (simple interest for now or just store basic)
    const processingFee = product.processing_fee || 0;
    const interest = (amount * product.interest_rate) / 100;
    const totalPayable = amount + interest + processingFee;

    const loanRef = `LN-${Date.now().toString().slice(-6)}`; // Simple ref generation

    const { error } = await supabase.from('loans').insert({
        user_id: user.id,
        product_id: productId,
        principal_amount: amount,
        interest_amount: interest,
        processing_fee: processingFee,
        amount_paid: 0,
        status: 'pending',
        loan_ref: loanRef,
        created_at: new Date().toISOString()
    });

    if (error) return { error: error.message };

    revalidatePath('/customer/overview');
    return { success: "Loan application submitted successfully." };
}

export async function approveLoanAction(loanId: string, disbursementRef: string) {
    const supabase = await createClient();

    // Auth & Role Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return { error: "Unauthorized" };

    if (!disbursementRef || disbursementRef.trim() === '') {
        return { error: "M-Pesa Disbursement Reference is required." };
    }

    // Check for duplicate disbursement reference BEFORE updating
    const { data: existingLoan } = await supabase
        .from('loans')
        .select('id')
        .eq('disbursement_ref', disbursementRef.trim())
        .maybeSingle();

    if (existingLoan) {
        return { error: "This M-Pesa Reference has already been used for another loan." };
    }

    // Get loan details BEFORE updating to avoid race conditions
    const { data: loan, error: loanFetchError } = await supabase
        .from('loans')
        .select('principal_amount, loan_ref, status')
        .eq('id', loanId)
        .single();

    if (loanFetchError || !loan) {
        return { error: "Loan not found." };
    }

    if (loan.status !== 'pending') {
        return { error: `Loan is already ${loan.status}. Cannot approve.` };
    }

    // Update Loan Status
    const { error: updateError } = await supabase.from('loans').update({
        status: 'active',
        disbursed_at: new Date().toISOString(),
        disbursed_by: user.id,
        disbursement_ref: disbursementRef.trim(),
        disbursement_method: 'mpesa'
    }).eq('id', loanId);

    if (updateError) {
        console.error("Loan update error:", updateError);
        return { error: updateError.message };
    }

    // --- Financial Ledger Integration (Disbursement) ---
    // Fetch typical accounts (Cash and Loans Receivable)
    const { data: accounts } = await supabase.from('chart_of_accounts').select('id, name');
    const cashAccount = accounts?.find(a => 
        a.name.toLowerCase().includes('cash') || 
        a.name.toLowerCase().includes('bank') || 
        a.name.toLowerCase().includes('mpesa')
    );
    const receivableAccount = accounts?.find(a => 
        a.name.toLowerCase().includes('receivable') || 
        a.name.toLowerCase().includes('portfolio')
    );

    if (cashAccount && receivableAccount) {
        const { error: ledgerError } = await supabase.from('ledger_entries').insert({
            amount: loan.principal_amount,
            debit_account_id: receivableAccount.id, // Increase Receivable
            credit_account_id: cashAccount.id,     // Decrease Cash
            description: `Loan Disbursement: ${loan.loan_ref} - Ref: ${disbursementRef}`,
            recorded_by: user.id,
            related_loan_id: loanId,
            transaction_date: new Date().toISOString()
        });

        if (ledgerError) {
            console.error("Ledger entry error:", ledgerError);
            // Continue even if ledger fails, but log it
        }
    }

    revalidatePath('/admin/loans');
    revalidatePath('/admin/overview');
    return { 
        success: `Loan ${loan.loan_ref} approved and disbursed.`,
        loanRef: loan.loan_ref
    };
}

export async function rejectLoanAction(loanId: string, reason: string) {
    const supabase = await createClient();

    // Auth & Role Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return { error: "Unauthorized" };

    if (!reason || reason.trim() === '') {
        return { error: "Rejection reason is required." };
    }

    const { error } = await supabase.from('loans').update({
        status: 'rejected',
        rejection_reason: reason.trim(),
        updated_at: new Date().toISOString()
    }).eq('id', loanId);

    if (error) return { error: error.message };

    revalidatePath('/admin/loans');
    return { success: "Loan rejected." };
}

export async function recordRepaymentAction(formData: FormData) {
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
    if (!transactionRef || transactionRef.trim() === '') {
        return { error: "Transaction Reference (e.g. M-Pesa ID) is required." };
    }

    // Get Loan
    const { data: loan } = await supabase.from('loans').select('*').eq('id', loanId).single();
    if (!loan) return { error: "Loan not found" };

    // 1. Validation: Prevent repayment on already paid loans
    if (loan.status === 'paid' || (loan.balance_due || 0) <= 0) {
        return { error: "This loan is already fully repaid and closed." };
    }

    // 2. Validation: Block overpayment
    if (amount > (loan.balance_due || 0)) {
        return { error: `Repayment amount (KES ${amount}) exceeds the balance due (KES ${loan.balance_due}).` };
    }

    // 3. Check for duplicate transaction reference
    const { data: existingRepayment } = await supabase
        .from('repayments')
        .select('id')
        .eq('transaction_ref', transactionRef.trim())
        .maybeSingle();

    if (existingRepayment) {
        return { error: "This Transaction Reference has already been used for another repayment." };
    }

    // Create Repayment Record
    const { data: repayment, error: repError } = await supabase.from('repayments').insert({
        loan_id: loanId,
        user_id: loan.user_id,
        amount: amount,
        payment_date: new Date().toISOString(),
        recorded_by: user.id,
        transaction_ref: transactionRef.trim(),
        notes: notes || '',
        payment_method: 'mpesa'
    }).select().single();

    if (repError) {
        return { error: repError.message };
    }

    // Update Loan Balance
    const newAmountPaid = (loan.amount_paid || 0) + amount;
    // Closure Logic: Status becomes 'paid' when amount_paid >= total_payable
    const newStatus = newAmountPaid >= (loan.total_payable || 0) ? 'paid' : loan.status;

    const { error: updateError } = await supabase.from('loans').update({
        amount_paid: newAmountPaid,
        status: newStatus,
        updated_at: new Date().toISOString()
    }).eq('id', loanId);

    if (updateError) return { error: updateError.message };

    // --- Financial Ledger Integration (Interest Split) ---
    // Calculate split: interest vs principal
    const totalPayable = loan.total_payable || 1; // avoid div by zero
    const interestRatio = (loan.interest_amount || 0) / totalPayable;
    const interestPortion = Math.round(amount * interestRatio * 100) / 100;
    const principalPortion = amount - interestPortion;

    // Fetch typical accounts (Cash, Loans Receivable, Interest Income)
    const { data: accounts } = await supabase.from('chart_of_accounts').select('id, name');
    const cashAccount = accounts?.find(a => a.name.toLowerCase().includes('cash') || a.name.toLowerCase().includes('bank') || a.name.toLowerCase().includes('mpesa'));
    const receivableAccount = accounts?.find(a => a.name.toLowerCase().includes('receivable') || a.name.toLowerCase().includes('portfolio'));
    const incomeAccount = accounts?.find(a => a.name.toLowerCase().includes('interest income') || a.name.toLowerCase().includes('interest earned'));

    if (cashAccount && receivableAccount) {
        // Entry 1: Principal Portion (Reduces Receivable)
        await supabase.from('ledger_entries').insert({
            amount: principalPortion,
            debit_account_id: cashAccount.id, // Increase Cash
            credit_account_id: receivableAccount.id, // Decrease Receivable
            description: `Loan Repayment (Principal): ${loan.loan_ref} - Ref: ${transactionRef}`,
            recorded_by: user.id,
            related_loan_id: loanId,
            related_repayment_id: repayment.id,
            transaction_date: new Date().toISOString()
        });

        // Entry 2: Interest Portion (Recognizes Earnings)
        if (interestPortion > 0) {
            const targetAccount = incomeAccount || receivableAccount; // Fallback to receivable if no income account
            await supabase.from('ledger_entries').insert({
                amount: interestPortion,
                debit_account_id: cashAccount.id, // Increase Cash
                credit_account_id: targetAccount.id, // Recognize Income or reduce receivable
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
    return { success: "Repayment recorded successfully." };
}