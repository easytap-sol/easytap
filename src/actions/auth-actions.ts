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
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;

  // 1. Sign Up
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
      }
    }
  });

  // Handle "User already registered" - still try to create profile in case it's missing
  if (error && !error.message.includes("already registered")) {
    return { error: error.message };
  }

  const userId = data?.user?.id || (error?.message.includes("already registered") ? null : null);

  // If we don't have a userId from signUp, we might need to sign in to get it, 
  // but better to just let login fail-safe handle it if the user exists.
  // HOWEVER, we can attempt a profile upsert if we can get the ID.

  if (data?.user) {
    const firstName = fullName.split(' ')[0];
    const lastName = fullName.split(' ').slice(1).join(' ');

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      email: email,
      first_name: firstName,
      last_name: lastName,
      role: 'customer',
      status: 'active',
      mobile_number: phone,
      is_kyc_verified: true
    });

    if (profileError) {
      console.error("Signup profile error:", profileError);
    }

    return { success: "Account created! You can now log in." };
  }

  if (error?.message.includes("already registered")) {
    return { success: "Account already exists. Please log in." };
  }

  return { error: "Signup failed." };
}