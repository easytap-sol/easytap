"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Update user profile details (email, phone, national ID, name)
 */
export async function updateUserProfileAction(prevState: any, formData: FormData) {
    const supabase = await createClient();

    // Authorization check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!['admin', 'super_admin'].includes(adminProfile?.role || '')) {
        return { error: "Unauthorized. Admin access required." };
    }

    const userId = formData.get("userId") as string;
    const email = formData.get("email") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phone = formData.get("phone") as string;
    const nationalId = formData.get("nationalId") as string;

    if (!userId) {
        return { error: "User ID is required" };
    }

    try {
        const adminClient = createServiceClient(supabaseUrl, supabaseServiceKey);

        // Update profile
        const { error: profileError } = await adminClient
            .from('profiles')
            .update({
                first_name: firstName,
                last_name: lastName,
                mobile_number: phone,
                national_id: nationalId,
                email: email,
            })
            .eq('id', userId);

        if (profileError) {
            console.error("Profile update error:", profileError);
            return { error: profileError.message };
        }

        // Update auth email if changed
        const { data: currentProfile } = await adminClient
            .from('profiles')
            .select('email')
            .eq('id', userId)
            .single();

        if (currentProfile && currentProfile.email !== email) {
            const { error: authError } = await adminClient.auth.admin.updateUserById(
                userId,
                { email: email }
            );

            if (authError) {
                console.error("Auth email update error:", authError);
                // Don't fail the whole operation if just email update fails
            }
        }

        revalidatePath('/admin/users');
        return { success: "User profile updated successfully" };
    } catch (error: any) {
        console.error("Update user error:", error);
        return { error: error.message || "Failed to update user profile" };
    }
}

/**
 * Reset user password
 */
export async function resetUserPasswordAction(userId: string, newPassword: string) {
    const supabase = await createClient();

    // Authorization check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!['admin', 'super_admin'].includes(adminProfile?.role || '')) {
        return { error: "Unauthorized. Admin access required." };
    }

    if (!newPassword || newPassword.length < 6) {
        return { error: "Password must be at least 6 characters long" };
    }

    try {
        const adminClient = createServiceClient(supabaseUrl, supabaseServiceKey);

        const { error } = await adminClient.auth.admin.updateUserById(
            userId,
            { password: newPassword }
        );

        if (error) {
            console.error("Password reset error:", error);
            return { error: error.message };
        }

        return { success: "Password reset successfully" };
    } catch (error: any) {
        console.error("Reset password error:", error);
        return { error: error.message || "Failed to reset password" };
    }
}

/**
 * Update user status (approve/reject/deactivate)
 */
export async function updateUserStatusAction(userId: string, status: 'active' | 'inactive' | 'rejected') {
    const supabase = await createClient();

    // Authorization check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!['admin', 'super_admin'].includes(adminProfile?.role || '')) {
        return { error: "Unauthorized. Admin access required." };
    }

    try {
        const adminClient = createServiceClient(supabaseUrl, supabaseServiceKey);

        const { error } = await adminClient
            .from('profiles')
            .update({ status })
            .eq('id', userId);

        if (error) {
            console.error("Status update error:", error);
            return { error: error.message };
        }

        revalidatePath('/admin/users');
        return { success: `User status updated to ${status}` };
    } catch (error: any) {
        console.error("Update status error:", error);
        return { error: error.message || "Failed to update user status" };
    }
}
