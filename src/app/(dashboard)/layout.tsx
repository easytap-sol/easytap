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
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("business_config").select("company_name").limit(1).single()
  ]);

  const profile = profileResponse.data;
  const companyName = businessResponse.data?.company_name || "EasyTap";

  // 3. Status Check (Admin Approval)
  if (profile && profile.status !== 'active' && profile.role !== 'admin') {
    await supabase.auth.signOut();
    redirect("/login?error=pending_approval");
  }

  // 4. Role-based Route Protection
  const headersList = await (await import('next/headers')).headers();
  const path = headersList.get('x-url') || "";
  // Alternative: Just use the profile role to decide if they belong in the current layout branch
  // Since this layout is shared, we should check if they are in the right section.

  // Actually, since this is (dashboard)/layout.tsx, it wraps both /admin and /customer.
  // We can do specific checks in layout if needed, or just trust the nested layouts.

  const userRole = profile?.role || "customer";

  // 5. URL-based Role Protection (Strict)
  // path is either a full URL or a relative path from the x-url header
  let pathname = "/";
  try {
    if (path.startsWith("/")) {
      pathname = path.split('?')[0];
    } else if (path) {
      pathname = new URL(path).pathname;
    }
  } catch (e) {
    console.error("Layout path parsing error:", e);
  }

  if (pathname.startsWith("/admin") && !["admin", "super_admin", "admin_staff", "staff"].includes(userRole)) {
    console.log(`Unauthorised access attempt by ${userRole} to ${pathname}`);
    redirect("/customer/overview");
  }

  if (pathname.startsWith("/customer") && ["admin", "super_admin", "admin_staff", "staff"].includes(userRole)) {
    // Keep admins in the admin section
    redirect("/admin/overview");
  }

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