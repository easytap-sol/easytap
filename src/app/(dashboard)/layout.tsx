import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Check Auth
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch Profile & Config
  const [profileResponse, businessResponse] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).single(),
    supabase.from("business_config").select("company_name").limit(1).single()
  ]);

  const userRole = profileResponse.data?.role || "customer";
  const companyName = businessResponse.data?.company_name || "EasyTap";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* SIDEBAR (Fixed) */}
      <aside className="hidden lg:flex flex-col w-[280px] fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-100">
        <Sidebar role={userRole} companyName={companyName} />
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="lg:ml-[280px] flex flex-col min-h-screen">

        {/* HEADER */}
        <DashboardHeader
          userEmail={user.email || ""}
          role={userRole}
          companyName={companyName}
        />

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 lg:p-10 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </main>
      </div>
    </div>
  );
}