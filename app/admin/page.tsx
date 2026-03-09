"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Users,
    Shield,
    ArrowLeft,
    Loader2,
    Activity,
    Search,
    MoreVertical,
    Edit2,
    UserX,
    History,
    X,
    FileText
} from "lucide-react";
import Link from "next/link";
import UserInvite from "../../components/UserInvite";
import { toast } from "sonner";

interface UserProfile {
    email: string;
    role: string;
    requestsCount: number;
    tokensUsed: number;
}

export default function AdminPanel() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<UserProfile[]>([
        { email: "admin@suthratech.com", role: "Admin", requestsCount: 156, tokensUsed: 45000 },
        { email: "user1@suthratech.com", role: "User", requestsCount: 42, tokensUsed: 12000 },
        { email: "user2@suthratech.com", role: "User", requestsCount: 12, tokensUsed: 3500 },
    ]);

    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [selectedLogsUser, setSelectedLogsUser] = useState<UserProfile | null>(null);

    // Dummy logs data
    const getUserLogs = (email: string) => {
        return [
            { id: 1, question: "What is our leave policy?", tokens: 120, time: "2 hours ago" },
            { id: 2, question: "How to configure the new VPN?", tokens: 350, time: "5 hours ago" },
            { id: 3, question: "Summarize the Q3 financial report.", tokens: 840, time: "1 day ago" },
            { id: 4, question: "Find mentions of project Alpha in the codebase.", tokens: 1200, time: "2 days ago" },
        ];
    };

    useEffect(() => {
        const handleClickOutside = () => setOpenDropdown(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        if (status === "unauthenticated" || (status === "authenticated" && !(session?.user as any)?.roles?.includes("Admin"))) {
            router.push("/");
        }
    }, [status, session, router]);

    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <button className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                                <ArrowLeft size={20} />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-white">Admin Control Center</h1>
                            <p className="text-xs text-slate-500">Manage users, roles and system performance</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-sm font-medium text-slate-300">{session?.user?.name}</span>
                            <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">System Administrator</span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center border border-indigo-400/30">
                            <Shield size={20} className="text-white" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl hover:border-indigo-500/30 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-indigo-500/10 rounded-xl group-hover:scale-110 transition-transform">
                                <Users className="text-indigo-400" size={24} />
                            </div>
                            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">+12%</span>
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium">Total Active Users</h3>
                        <p className="text-3xl font-bold text-white mt-1">1,284</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl hover:border-emerald-500/30 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform">
                                <Activity className="text-emerald-400" size={24} />
                            </div>
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Normal</span>
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium">API Health Status</h3>
                        <p className="text-3xl font-bold text-white mt-1">99.9%</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl hover:border-purple-500/30 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform">
                                <Shield className="text-purple-400" size={24} />
                            </div>
                            <span className="text-xs font-bold text-slate-500">Live</span>
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium">Monthly Token Burn</h3>
                        <p className="text-3xl font-bold text-white mt-1">8.4M</p>
                    </div>

                    <UserInvite />
                </div>

                {/* User Management Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Users size={20} className="text-indigo-400" />
                            User Directory
                        </h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder="Filter by email or role..."
                                className="bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm w-full md:w-64 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-semibold">User Identification</th>
                                    <th className="px-6 py-4 font-semibold">Access Level</th>
                                    <th className="px-6 py-4 font-semibold text-center">Requests</th>
                                    <th className="px-6 py-4 font-semibold text-right">Tokens Consumed</th>
                                    <th className="px-6 py-4 font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {users.map((user) => (
                                    <tr key={user.email} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                                                    {user.email[0].toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium text-slate-200">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'Admin'
                                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-sm text-slate-400">{user.requestsCount}</span>
                                        </td>
                                        <td className="px-6 py-5 text-right font-mono">
                                            <span className="text-sm text-emerald-400">{user.tokensUsed.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-5 text-center relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenDropdown(openDropdown === user.email ? null : user.email);
                                                }}
                                                className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-500 relative z-10"
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                            {openDropdown === user.email && (
                                                <div className="absolute right-12 top-8 mt-2 w-48 bg-slate-800 rounded-md shadow-2xl border border-slate-600 z-50 py-1 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => { setSelectedLogsUser(user); setOpenDropdown(null); }}
                                                        className="w-full text-left px-4 py-2 text-sm text-indigo-300 hover:bg-slate-700 hover:text-indigo-200 flex items-center gap-2 transition-colors"
                                                    >
                                                        <History size={14} /> View Logs
                                                    </button>
                                                    <button
                                                        onClick={() => { toast.success(`Edit role action triggered for ${user.email}`); setOpenDropdown(null); }}
                                                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2 transition-colors"
                                                    >
                                                        <Edit2 size={14} /> Edit Role
                                                    </button>
                                                    <button
                                                        onClick={() => { toast.error(`Revoking access for ${user.email}...`); setOpenDropdown(null); }}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2 transition-colors"
                                                    >
                                                        <UserX size={14} /> Revoke Access
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 bg-slate-800/20 border-t border-slate-800 text-center">
                        <button className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                            View All 1,284 Users
                        </button>
                    </div>
                </div>

                {/* Logs Modal Overlay */}
                {selectedLogsUser && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
                            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                                        <History className="text-indigo-400" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">Activity Logs</h3>
                                        <p className="text-xs text-slate-400">{selectedLogsUser.email}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedLogsUser(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-4 overflow-y-auto flex-1 space-y-3">
                                {getUserLogs(selectedLogsUser.email).map(log => (
                                    <div key={log.id} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-indigo-500/30 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-medium text-slate-200 text-sm">{log.question}</div>
                                            <div className="text-xs text-slate-500 whitespace-nowrap ml-4">{log.time}</div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <FileText size={12} className="text-indigo-400" />
                                            <span>Tokens Used: <span className="font-mono text-emerald-400">{log.tokens}</span></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
