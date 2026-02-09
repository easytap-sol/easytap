
import { createClient } from "@/utils/supabase/server";

export default async function AdminDebugPage() {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    // Exact queries from Overview page
    const [
        profilesCountRes,
        loansRes,
        recentUsersRes,
        latestRepaymentsRes,
        accountsRes
    ] = await Promise.all([
        supabase.from("profiles").select("*", { count: 'exact', head: true }).eq('role', 'customer'),
        supabase.from("loans").select("*, profiles!user_id(first_name, last_name)"),
        supabase.from("profiles").select("*").eq('role', 'customer').order('created_at', { ascending: false }).limit(5),
        supabase.from("repayments").select("*, profiles!user_id(first_name, last_name), loans(loan_ref)").order('created_at', { ascending: false }).limit(6),
        supabase.from("chart_of_accounts").select("id, name")
    ]);

    // Also fetch all profiles to see who exists
    const allProfiles = await supabase.from('profiles').select('*');

    return (
        <div className="p-8 space-y-8 font-mono text-[10px]">
            <h1 className="text-2xl font-bold">Admin Diagnostics v2</h1>

            <section className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <h2 className="text-lg font-bold border-b">Auth Session</h2>
                    <pre className="bg-slate-100 p-2 rounded overflow-auto max-h-40">
                        {JSON.stringify(user, null, 2)}
                    </pre>
                </div>
                <div className="space-y-2">
                    <h2 className="text-lg font-bold border-b">My Profile</h2>
                    <pre className="bg-slate-100 p-2 rounded overflow-auto max-h-40">
                        {JSON.stringify(allProfiles.data?.find(p => p.id === user?.id), null, 2)}
                    </pre>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-bold border-b">Overview Query Results</h2>

                <div className="space-y-2">
                    <h3 className="font-bold">Loans Query Result (Length: {loansRes.data?.length || 0})</h3>
                    {loansRes.error && <p className="text-red-600 font-bold">ERROR: {loansRes.error.message} ({loansRes.error.code})</p>}
                    <pre className="bg-slate-50 p-2 overflow-auto max-h-60 border">{JSON.stringify(loansRes.data?.slice(0, 2), null, 2)}</pre>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold">Repayments Query Result (Length: {latestRepaymentsRes.data?.length || 0})</h3>
                    {latestRepaymentsRes.error && <p className="text-red-600 font-bold">ERROR: {latestRepaymentsRes.error.message} ({latestRepaymentsRes.error.code})</p>}
                    <pre className="bg-slate-50 p-2 overflow-auto max-h-60 border">{JSON.stringify(latestRepaymentsRes.data?.slice(0, 2), null, 2)}</pre>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-bold">Accounts</h3>
                        <pre className="bg-slate-50 p-2 overflow-auto max-h-40 border">{JSON.stringify(accountsRes.data, null, 2)}</pre>
                    </div>
                    <div>
                        <h3 className="font-bold">All Profiles IDs</h3>
                        <pre className="bg-slate-50 p-2 overflow-auto max-h-40 border">
                            {JSON.stringify(allProfiles.data?.map(p => ({ id: p.id, role: p.role, email: p.email })), null, 2)}
                        </pre>
                    </div>
                </div>
            </section>
        </div>
    );
}
