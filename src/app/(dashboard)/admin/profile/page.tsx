import { createClient } from "@/utils/supabase/server";
import { User, Phone, Mail, Shield, Key, Settings, LogOut, Bell, Globe, CreditCard, Activity, Database } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return <div>Profile not found.</div>;

  // Get some stats for the admin
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: 'exact', head: true })
    .eq('role', 'customer');

  const { count: activeLoans } = await supabase
    .from("loans")
    .select("*", { count: 'exact', head: true })
    .eq('status', 'active');

  const { data: businessConfig } = await supabase
    .from("business_config")
    .select("*")
    .single();

  return (
    <div className="space-y-8">

      {/* 1. Header Hero Card */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-900 to-slate-800 p-8 md:p-12 text-white shadow-2xl shadow-slate-900/10">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Admin Profile
            </h1>
            <p className="text-slate-400">
              Manage your account settings and system preferences.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 px-6 py-3 backdrop-blur-sm border border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Customers</span>
              <span className="text-2xl font-bold mt-1 text-white">
                {totalUsers || 0}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 px-6 py-3 backdrop-blur-sm border border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Loans</span>
              <span className="text-2xl font-bold mt-1 text-emerald-400">
                {activeLoans || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Abstract Background Elements */}
        <User className="absolute -right-10 -bottom-10 h-64 w-64 text-white/5 rotate-12" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">

        {/* LEFT COLUMN: Profile Card & Quick Stats */}
        <div className="lg:col-span-1 space-y-6">

          {/* Profile Card */}
          <div className="relative rounded-[2.5rem] border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/10 to-primary-deep/10" />

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="mb-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-primary p-1">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-4xl font-bold text-slate-900">
                      {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 border-4 border-white">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Name & Role */}
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                {profile.first_name} {profile.last_name}
              </h2>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 mb-4">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700 uppercase tracking-wider">
                  {profile.role}
                </span>
              </div>

              {/* Contact Info */}
              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <div className="text-left">
                    <p className="text-sm text-slate-600">Email</p>
                    <p className="font-bold text-slate-900 truncate">{profile.email}</p>
                  </div>
                </div>

                {profile.mobile_number && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50">
                    <Phone className="h-5 w-5 text-slate-400" />
                    <div className="text-left">
                      <p className="text-sm text-slate-600">Phone</p>
                      <p className="font-bold text-slate-900">{profile.mobile_number}</p>
                    </div>
                  </div>
                )}

                {profile.national_id && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50">
                    <CreditCard className="h-5 w-5 text-slate-400" />
                    <div className="text-left">
                      <p className="text-sm text-slate-600">National ID</p>
                      <p className="font-bold text-slate-900">{profile.national_id}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="rounded-[2.5rem] border border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg">System Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Database</span>
                <span className="font-bold text-emerald-400">Online</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">KYC Status</span>
                <span className="font-bold text-emerald-400">
                  {profile.is_kyc_verified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Member Since</span>
                <span className="font-bold">
                  {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Settings & Details */}
        <div className="lg:col-span-2 space-y-6">

          {/* Account Settings */}
          <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Settings className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-slate-900">Account Settings</h3>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Personal Information</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">First Name</label>
                    <div className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 flex items-center">
                      <span className="font-medium text-slate-900">{profile.first_name || 'Not set'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Last Name</label>
                    <div className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 flex items-center">
                      <span className="font-medium text-slate-900">{profile.last_name || 'Not set'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Contact Information</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Email Address</label>
                    <div className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 flex items-center gap-3">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-slate-900">{profile.email}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Phone Number</label>
                    <div className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 flex items-center gap-3">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-slate-900">
                        {profile.mobile_number || 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Role & Permissions</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">User Role</label>
                    <div className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 flex items-center gap-3">
                      <Shield className="h-4 w-4 text-emerald-600" />
                      <span className="font-medium text-slate-900 capitalize">{profile.role}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Account Status</label>
                    <div className="h-12 rounded-2xl border border-slate-200 bg-emerald-50 px-4 flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="font-medium text-emerald-700">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Preferences */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Security Settings */}
            <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <Key className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-slate-900">Security</h3>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="group p-4 rounded-2xl border border-slate-100 hover:border-red-200 hover:bg-red-50/30 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">Password</p>
                      <p className="text-sm text-slate-500">Update your account password</p>
                    </div>
                    <button className="text-sm font-bold text-red-600 hover:text-red-700 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors">
                      Change
                    </button>
                  </div>
                </div>

                <div className="group p-4 rounded-2xl border border-slate-100 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">Two-Factor Authentication</p>
                      <p className="text-sm text-slate-500">Add an extra layer of security</p>
                    </div>
                    <button className="text-sm font-bold text-primary hover:text-primary-deep px-4 py-2 rounded-xl hover:bg-primary/10 transition-colors">
                      Enable
                    </button>
                  </div>
                </div>

                <div className="group p-4 rounded-2xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">KYC Verification</p>
                      <p className="text-sm text-slate-500">
                        Status: {profile.is_kyc_verified ? 'Verified' : 'Pending'}
                      </p>
                    </div>
                    <button className="text-sm font-bold text-amber-600 hover:text-amber-700 px-4 py-2 rounded-xl hover:bg-amber-50 transition-colors">
                      {profile.is_kyc_verified ? 'View' : 'Verify'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Settings */}
            <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Database className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-slate-900">Business</h3>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="group p-4 rounded-2xl border border-slate-100 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">Company Settings</p>
                      <p className="text-sm text-slate-500">
                        {businessConfig?.company_name || 'EasyTap'}
                      </p>
                    </div>
                    <Link
                      href="/admin/settings"
                      className="text-sm font-bold text-primary hover:text-primary-deep px-4 py-2 rounded-xl hover:bg-primary/10 transition-colors"
                    >
                      Configure
                    </Link>
                  </div>
                </div>

                <div className="group p-4 rounded-2xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">Notifications</p>
                      <p className="text-sm text-slate-500">Manage alerts and emails</p>
                    </div>
                    <button className="text-sm font-bold text-violet-600 hover:text-violet-700 px-4 py-2 rounded-xl hover:bg-violet-50 transition-colors">
                      <Bell className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="group p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">Logout</p>
                      <p className="text-sm text-slate-500">Sign out from all devices</p>
                    </div>
                    <form action="/auth/signout" method="post">
                      <button
                        type="submit"
                        className="text-sm font-bold text-slate-600 hover:text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}