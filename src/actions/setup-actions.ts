"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function checkSystemInitialized() {
    const supabase = await createClient();
    const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

    if (error) return { error: error.message };
    return { initialized: (count || 0) > 0 };
}

export async function bootstrapSystemAction(formData: FormData) {
    const supabase = await createClient();

    // 1. Double check if an admin already exists
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin');
    if (count && count > 0) return { error: "System already initialized with an admin." };

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const companyName = formData.get("companyName") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const nationalId = formData.get("nationalId") as string;
    const mobileNumber = formData.get("mobileNumber") as string;

    if (!email || !password || !firstName || !lastName || !companyName) return { error: "Missing required fields." };
    if (password !== confirmPassword) return { error: "Passwords do not match." };

    // 2. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
                national_id: nationalId,
                mobile_number: mobileNumber
            }
        }
    });

    if (authError) return { error: authError.message };
    if (!authData.user) return { error: "Failed to create user." };

    // 3. Create/Update Profile to Admin
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: authData.user.id,
            email: email,
            role: 'admin',
            first_name: firstName,
            last_name: lastName,
            national_id: nationalId,
            mobile_number: mobileNumber,
            status: 'approved',
            is_kyc_verified: true // Auto-verify the super admin
        });

    if (profileError) return { error: profileError.message };

    // 4. Initialize Business Config
    const { error: configError } = await supabase.from('business_config').insert({
        company_name: companyName,
        currency: 'KES',
        allow_manual_repayment: true
    });

    if (configError) return { error: configError.message };

    // 5. Initialize Core Chart of Accounts if empty
    const { count: acctCount } = await supabase.from('chart_of_accounts').select('*', { count: 'exact', head: true });

    if (!acctCount || acctCount === 0) {
        const defaultAccounts = [
            { name: "Cash on Hand", code: "1001", type: "asset" },
            { name: "Loan Portfolio", code: "1002", type: "asset" },
            { name: "Interest Income", code: "4001", type: "revenue" },
            { name: "Fee Income", code: "4002", type: "revenue" },
            { name: "Penalty Income", code: "4003", type: "revenue" }
        ];
        await supabase.from('chart_of_accounts').insert(defaultAccounts);
    }

    revalidatePath('/');
    return { success: `System initialized for ${companyName}. You are now the Super Admin.` };
}
