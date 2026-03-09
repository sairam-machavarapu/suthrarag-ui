import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { UserPlus, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function UserInvite() {
    const { data: session } = useSession();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('User');
    const [isInviting, setIsInviting] = useState(false);
    const [result, setResult] = useState<{ status: string; message: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Please enter an email address.');
            return;
        }

        setIsInviting(true);
        setError(null);
        setResult(null);

        try {
            const token = (session?.user as any)?.id_token;
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_BASE_URL}/admin/invite`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, role }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to send invitation');
            }

            const data = await response.json();
            setResult(data);
            setEmail('');
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl hover:border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-indigo-500/10 rounded-xl">
                    <UserPlus className="text-indigo-400" size={24} />
                </div>
                <h2 className="text-lg font-bold text-white">Invite New User</h2>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="employee@suthratech.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Assign Role</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                        <option value="User">User</option>
                        <option value="InternalUser">Internal User</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={isInviting || !email}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${isInviting || !email
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20'
                        }`}
                >
                    {isInviting ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Sending Invitation...</span>
                        </>
                    ) : (
                        <>
                            <UserPlus size={16} />
                            <span>Send Invitation</span>
                        </>
                    )}
                </button>
            </form>

            {error && (
                <div className="mt-4 flex items-start gap-2 p-2 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-xs">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {result && (
                <div className="mt-4 p-3 bg-emerald-900/20 border border-emerald-900/50 rounded-md space-y-1">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                        <CheckCircle size={14} />
                        <span>Invitation Sent</span>
                    </div>
                    <div className="text-[10px] text-slate-400 pl-5">
                        {result.message}
                    </div>
                </div>
            )}
        </div>
    );
}
