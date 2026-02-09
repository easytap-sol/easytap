"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveUserAction(userId: string) {
    const supabase = await createClient();

    // Authorization check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (adminProfile?.role !== 'admin') {
        return { error: "Unauthorized" };
    }

    const { error } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', userId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin/users');
    return { success: "User approved successfully." };
}

export async function rejectUserAction(userId: string) {
    const supabase = await createClient();

    // Authorization check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (adminProfile?.role !== 'admin') return { error: "Unauthorized" };

    const { error } = await supabase
        .from('profiles')
        .update({ status: 'rejected' })
        .eq('id', userId);

    if (error) return { error: error.message };

    revalidatePath('/admin/users');
    return { success: "User rejected." };
}

// Use service role if available for admin privileges
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function createUserAction(prevState: any, formData: FormData) {
    const supabase = await createClient();

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (adminProfile?.role !== 'admin') return { error: "Unauthorized" };

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phone = formData.get("phone") as string;
    const nationalId = formData.get("nationalId") as string;
    const role = formData.get("role") as string;

    let signUpData, signUpError;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        // Use Admin API to create user without confirmation
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        const result = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                first_name: firstName,
                last_name: lastName,
                mobile_number: phone,
                national_id: nationalId,
                role: role
            }
        });
        signUpData = result.data;
        signUpError = result.error;

    } else {
        // Fallback: Use a fresh client (anon) to sign up
        // This will require email confirmation unless disabled in project settings
        const tempSupabase = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const result = await tempSupabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    mobile_number: phone,
                    national_id: nationalId,
                    role: role
                }
            }
        });
        signUpData = result.data;
        signUpError = result.error;
    }

    if (signUpError) return { error: signUpError.message };
    if (!signUpData?.user) return { error: "Failed to create user." };

    // Ensure Profile is Active & Role Set
    // CRITICAL: Use the ADMIN client (Service Role) for this upsert to bypass RLS "Own Profile Only" policies.
    // If we rely on the user-scoped 'supabase' client, it will fail because we are inserting another user's profile.

    let adminClient = supabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        adminClient = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );
    }

    const { error: profileError } = await adminClient.from('profiles').upsert({
        id: signUpData.user.id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        mobile_number: phone,
        national_id: nationalId,
        status: 'active', // Admin created users are active by default
        role: role
    });

    if (profileError) {
        return { error: "User created but profile update failed: " + profileError.message };
    }

    revalidatePath('/admin/users');
    return { success: "User created successfully!" };
}
