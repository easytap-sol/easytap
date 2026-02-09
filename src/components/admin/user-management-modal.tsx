"use client";

import { useState, useActionState } from "react";
import { updateUserProfileAction, resetUserPasswordAction } from "@/actions/user-management-actions";
import { X, Loader2, Key, User, Mail, Phone, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserManagementModalProps {
    user: any;
    onClose: () => void;
}

export function UserManagementModal({ user, onClose }: UserManagementModalProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [isResettingPassword, setIsResettingPassword] = useState(false);

    const [formState, formAction, isPending] = useActionState(updateUserProfileAction, null);

    const handlePasswordReset = async () => {
        setPasswordError(null);

        if (!newPassword || newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters long");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }

        setIsResettingPassword(true);

        try {
            const result = await resetUserPasswordAction(user.id, newPassword);

            if (result?.error) {
                setPasswordError(result.error);
            } else {
                alert(result?.success || "Password reset successfully");
                setNewPassword("");
                setConfirmPassword("");
                onClose();
                router.refresh();
            }
        } catch (error: any) {
            setPasswordError(error.message || "Failed to reset password");
        } finally {
            setIsResettingPassword(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Manage User</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {user.first_name} {user.last_name} • {user.email}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`flex-1 px-6 py-3 font-semibold text-sm transition-colors ${activeTab === "profile"
                            ? "text-primary border-b-2 border-primary bg-primary/5"
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        <User className="h-4 w-4 inline mr-2" />
                        Profile Details
                    </button>
                    <button
                        onClick={() => setActiveTab("password")}
                        className={`flex-1 px-6 py-3 font-semibold text-sm transition-colors ${activeTab === "password"
                            ? "text-primary border-b-2 border-primary bg-primary/5"
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        <Key className="h-4 w-4 inline mr-2" />
                        Reset Password
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {activeTab === "profile" ? (
                        <form action={formAction} className="space-y-6">
                            <input type="hidden" name="userId" value={user.id} />

                            {formState?.error && (
                                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                                    <p className="text-sm font-bold text-red-700">{formState.error}</p>
                                </div>
                            )}

                            {formState?.success && (
                                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                                    <p className="text-sm font-bold text-green-700">{formState.success}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">
                                        First Name *
                                    </label>
                                    <input
                                        name="firstName"
                                        defaultValue={user.first_name || ""}
                                        required
                                        className="w-full h-12 rounded-xl border border-slate-200 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">
                                        Last Name *
                                    </label>
                                    <input
                                        name="lastName"
                                        defaultValue={user.last_name || ""}
                                        required
                                        className="w-full h-12 rounded-xl border border-slate-200 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email Address *
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    defaultValue={user.email || ""}
                                    required
                                    className="w-full h-12 rounded-xl border border-slate-200 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Mobile Number *
                                </label>
                                <input
                                    name="phone"
                                    type="tel"
                                    defaultValue={user.mobile_number || ""}
                                    required
                                    className="w-full h-12 rounded-xl border border-slate-200 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    National ID / Passport
                                </label>
                                <input
                                    name="nationalId"
                                    defaultValue={user.national_id || ""}
                                    className="w-full h-12 rounded-xl border border-slate-200 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>

                            {/* Status Management */}
                            <div className="pt-4 border-t border-slate-100">
                                <label className="text-sm font-bold text-slate-700 block mb-3">
                                    Account Status
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {user.status === 'inactive' && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    const { updateUserStatusAction } = await import("@/actions/user-management-actions");
                                                    const res = await updateUserStatusAction(user.id, 'active');
                                                    if (res.success) {
                                                        alert("User approved successfully");
                                                        onClose();
                                                        router.refresh();
                                                    } else {
                                                        alert(res.error);
                                                    }
                                                }}
                                                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                                            >
                                                Approve User
                                            </button>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    const { updateUserStatusAction } = await import("@/actions/user-management-actions");
                                                    const res = await updateUserStatusAction(user.id, 'rejected');
                                                    if (res.success) {
                                                        alert("User rejected");
                                                        onClose();
                                                        router.refresh();
                                                    } else {
                                                        alert(res.error);
                                                    }
                                                }}
                                                className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                                            >
                                                Reject User
                                            </button>
                                        </>
                                    )}
                                    {user.status === 'active' && (
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const { updateUserStatusAction } = await import("@/actions/user-management-actions");
                                                const res = await updateUserStatusAction(user.id, 'inactive');
                                                if (res.success) {
                                                    alert("User deactivated");
                                                    onClose();
                                                    router.refresh();
                                                } else {
                                                    alert(res.error);
                                                }
                                            }}
                                            className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
                                        >
                                            Deactivate Account
                                        </button>
                                    )}
                                    {user.status === 'rejected' && (
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const { updateUserStatusAction } = await import("@/actions/user-management-actions");
                                                const res = await updateUserStatusAction(user.id, 'inactive');
                                                if (res.success) {
                                                    alert("User status reset to pending");
                                                    onClose();
                                                    router.refresh();
                                                } else {
                                                    alert(res.error);
                                                }
                                            }}
                                            className="px-4 py-2 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors border border-primary/20"
                                        >
                                            Undo Rejection
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="flex-1 h-12 bg-primary text-white font-bold rounded-xl hover:bg-primary-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="h-12 px-6 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            {passwordError && (
                                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                                    <p className="text-sm font-bold text-red-700">{passwordError}</p>
                                </div>
                            )}

                            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                                <p className="text-sm text-amber-800">
                                    <strong>Warning:</strong> This will immediately reset the user's password. They will need to use the new password to log in.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">
                                    New Password *
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
                                    className="w-full h-12 rounded-xl border border-slate-200 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">
                                    Confirm Password *
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter password"
                                    className="w-full h-12 rounded-xl border border-slate-200 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handlePasswordReset}
                                    disabled={isResettingPassword}
                                    className="flex-1 h-12 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isResettingPassword ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Resetting...
                                        </>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="h-12 px-6 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
