"use client";

import { useState } from "react";
import { approveUserAction, rejectUserAction } from "@/actions/admin-actions"; // Need to create reject/makeAdmin actions
import { User, Shield, Check, X, MoreVertical, Phone, Mail, Calendar } from "lucide-react";

export function UserCard({ profile }: { profile: any }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Placeholder actions (we need to implement these in admin-actions.ts)
    async function handleApprove() {
        if (!confirm("Approve this user?")) return;
        await approveUserAction(profile.id);
    }

    async function handleReject() {
        if (!confirm("Reject this user? They will not be able to login.")) return;
        await rejectUserAction(profile.id);
    }

    return (
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>

                {/* Avatar / Initials */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${profile.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-primary/10 text-primary'
                    }`}>
                    {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
                </div>

                {/* Name & Role */}
                <div className="flex-1">
                    <h3 className="font-semibold flex items-center gap-2">
                        {profile.first_name} {profile.last_name}
                        {profile.role === 'admin' && <Shield className="w-3 h-3 text-purple-600 fill-purple-100" />}
                    </h3>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>

                {/* Status Badge */}
                <div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${profile.status === 'active' ? 'bg-green-100 text-green-700' :
                        profile.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            profile.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100'
                        }`}>
                        {profile.status}
                    </span>
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="px-4 pb-4 pt-0 bg-muted/5 border-t">
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="w-4 h-4" /> {profile.mobile_number}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" /> Joined {new Date(profile.created_at).toLocaleDateString()}
                            </div>
                            {profile.id_number && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <span className="font-semibold">ID:</span> {profile.id_number}
                                </div>
                            )}
                        </div>

                        {/* Actions Toolbar */}
                        <div className="flex items-center justify-end gap-2">
                            {profile.status === 'pending' && (
                                <>
                                    <button onClick={handleApprove} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition shadow-sm">
                                        <Check className="w-4 h-4" /> Approve
                                    </button>
                                    {/* Reject Button would go here */}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
