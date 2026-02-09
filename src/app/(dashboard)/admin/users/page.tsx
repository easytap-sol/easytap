import { createClient } from "@/utils/supabase/server";
import { Plus, Download } from "lucide-react";
import Link from "next/link";
import { UsersTable } from "@/components/admin/users-table";

// Accept searchParams for server-side filtering
export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams?: { q?: string };
}) {
    const supabase = await createClient();
    const params = await searchParams;
    const query = params?.q || "";

    // Dynamic Query Construction
    let dbQuery = supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    // Apply Search Filter if query exists
    if (query) {
        dbQuery = dbQuery.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,mobile_number.ilike.%${query}%`);
    }

    const { data: profiles } = await dbQuery;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">User Directory</h1>
                    <p className="text-slate-500 font-medium">
                        {profiles?.length || 0} active accounts found
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="hidden md:flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <Link
                        href="/admin/users/create"
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 text-sm font-bold active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Create New
                    </Link>
                </div>
            </div>

            {/* Users Table */}
            <UsersTable profiles={profiles || []} />
        </div>
    );
}