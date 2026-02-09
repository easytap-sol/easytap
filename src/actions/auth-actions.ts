"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  const supabase = await createClient();

  const loginMethod = formData.get("loginMethod") as string;
  const password = formData.get("password") as string;
  const email = formData.get("email") as string;

  let error = null;

  if (loginMethod === "email") {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (signInError) {
      return { error: signInError.message };
    }
  } else {
    return { error: "Only email login is supported for now." };
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("LoginAction: User not found after sign in.");
    return { error: "Authentication failed." };
  }

  console.log("LoginAction: Fetching profile for user:", user.id);

  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("LoginAction: Profile fetch error or empty, attempting fail-safe profile creation:", profileError);
    // FAIL-SAFE: Create profile from Auth metadata if missing (happens after manual DB resets)
    const { data: { user: freshUser } } = await supabase.auth.getUser();
    if (freshUser) {
      const fullName = freshUser.user_metadata?.full_name || freshUser.user_metadata?.first_name || "New";
      const firstName = fullName.split(' ')[0];
      const lastName = fullName.split(' ').slice(1).join(' ') || "User";

      const { data: newProfile, error: createError } = await supabase.from('profiles').insert({
        id: freshUser.id,
        email: freshUser.email,
        first_name: firstName,
        last_name: lastName,
        role: 'customer',
        status: 'active',
        mobile_number: freshUser.user_metadata?.phone || freshUser.user_metadata?.mobile_number,
        is_kyc_verified: true
      }).select().single();

      if (!createError && newProfile) {
        profile = newProfile;
      } else {
        console.error("LoginAction: Fail-safe profile creation failed:", createError);
        await supabase.auth.signOut();
        return { error: "Profile not found and could not be restored." };
      }
    }
  }

  // Check Status
  if (profile && profile.status !== 'active' && profile.role !== 'admin') {
    await supabase.auth.signOut();
    return { error: "Your account is pending approval. Please contact support." };
  }

  // Role Redirect
  if (profile && profile.role === 'admin') {
    redirect("/admin/overview");
  } else if (profile && profile.role === 'customer') {
    redirect("/customer/overview");
  }

  redirect("/");
}

export async function signupAction(prevState: any, formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;

  // 1. Validate Passwords Match
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  // 2. Check for Unique Phone Number
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, status")
    .eq("mobile_number", phone)
    .single();

  if (existingProfile) {
    if (existingProfile.status === 'rejected') {
      return { error: "Your account application has been rejected. Please contact support for assistance." };
    }
    return { error: "This phone number is already registered." };
  }

  // 3. Sign Up
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
      }
    }
  });

  // Handle "User already registered"
  if (error && !error.message.includes("already registered")) {
    return { error: error.message };
  }

  if (data?.user) {
    // 4. Create Profile with 'inactive' status
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      email: email,
      first_name: firstName,
      last_name: lastName,
      role: 'customer',
      status: 'inactive', // Default to inactive for admin approval
      mobile_number: phone,
      is_kyc_verified: false // Set to false for new users
    });

    if (profileError) {
      console.error("Signup profile error:", profileError);
      return { error: "Failed to create user profile." };
    }

    return { success: "Account created! Please wait for admin approval before logging in." };
  }

  if (error?.message.includes("already registered")) {
    return { error: "An account with this email already exists." };
  }

  return { error: "Signup failed." };
}