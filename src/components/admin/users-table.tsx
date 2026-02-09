"use client";

import { useState } from "react";
import { MoreHorizontal, ShieldCheck, User as UserIcon } from "lucide-react";
import { UserManagementModal } from "./user-management-modal";

interface UsersTableProps {
    profiles: any[];
}

export function UsersTable({ profiles }: UsersTableProps) {
    const [selectedUser, setSelectedUser] = useState<any | null>(null);

    return (
        <>
            <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm bg-white">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="text-left py-4 pl-8 pr-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="text-right py-4 px-4 pr-8 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {profiles?.map((profile: any) => (
                            <tr key={profile.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-4 pl-8 pr-4">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black uppercase shadow-sm border ${profile.role === "customer"
                                                ? "bg-white text-slate-600 border-slate-200"
                                                : "bg-secondary text-white border-secondary-deep/20"
                                                }`}
                                        >
                                            {profile.first_name?.[0]}
                                            {profile.last_name?.[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-base">
                                                {profile.first_name} {profile.last_name}
                                            </div>
                                            <div className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                                ID: {profile.national_id || "Not set"}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    {profile.role === "customer" ? (
                                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Borrower
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-900 text-white border border-slate-700">
                                            <ShieldCheck className="w-3 h-3" />
                                            Admin Staff
                                        </span>
                                    )}
                                </td>
                                <td className="py-4 px-4">
                                    {profile.status === 'active' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                            Active
                                        </span>
                                    )}
                                    {(profile.status === 'inactive' || !profile.status) && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                                            Pending
                                        </span>
                                    )}
                                    {profile.status === 'rejected' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                            Rejected
                                        </span>
                                    )}
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700">{profile.email}</span>
                                        <span className="text-xs text-slate-400">
                                            {profile.mobile_number || "No phone"}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-right pr-8">
                                    <button
                                        onClick={() => setSelectedUser(profile)}
                                        className="p-2 rounded-xl hover:bg-primary/10 hover:shadow-md border border-transparent hover:border-primary/20 text-slate-400 hover:text-primary transition-all"
                                        title="Manage user"
                                    >
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {!profiles?.length && (
                <div className="py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <UserIcon className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No users found</h3>
                    <p className="text-slate-500 mt-2">Try adjusting your search terms.</p>
                </div>
            )}

            {selectedUser && (
                <UserManagementModal user={selectedUser} onClose={() => setSelectedUser(null)} />
            )}
        </>
    );
}
