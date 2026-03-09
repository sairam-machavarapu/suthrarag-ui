import { MessageSquare, Plus, User, LayoutDashboard, LogOut, Trash2, Clock } from 'lucide-react';
import DocumentUpload from './DocumentUpload';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Conversation } from '@/types/rag';
import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SidebarProps {
    onProfileClick: () => void;
    onNewChat: () => void;
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        roles?: string[];
    };
    conversations: Conversation[];
    activeId: string;
    onSelectConversation: (id: string) => void;
    onDeleteConversation: (id: string) => void;
}

export default function Sidebar({
    onProfileClick,
    onNewChat,
    user,
    conversations,
    activeId,
    onSelectConversation,
    onDeleteConversation
}: SidebarProps) {
    const isAdmin = user?.roles?.includes('Admin');

    return (
        <div className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-full">
            <div className="p-4 border-b border-slate-800">
                <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    Suthra AI Assistant
                </h1>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">Enterprise RAG</p>
            </div>

            <div className="p-4 space-y-4 border-b border-slate-800">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center gap-2 justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors shadow-sm shadow-indigo-900/40"
                >
                    <Plus size={18} />
                    New Chat
                </button>

                {isAdmin && <DocumentUpload />}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 px-2">Navigation</div>

                <button
                    onClick={onNewChat}
                    className={cn(
                        "flex items-center gap-3 w-full px-3 py-2 text-left rounded-md transition-colors",
                        !activeId ? "bg-slate-800 text-slate-200" : "hover:bg-slate-800/50 text-slate-400 hover:text-slate-200"
                    )}
                >
                    <MessageSquare size={16} className={!activeId ? "text-indigo-400" : "text-slate-400"} />
                    <span className="truncate text-sm">Chat Assistant</span>
                </button>

                {isAdmin && (
                    <Link href="/admin">
                        <button className="flex items-center gap-3 w-full px-3 py-2 text-left rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
                            <LayoutDashboard size={16} />
                            <span className="truncate text-sm">Admin Panel</span>
                        </button>
                    </Link>
                )}

                {conversations.length > 0 && (
                    <>
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 mt-6 px-2">Recent Chats</div>
                        <div className="space-y-1">
                            {conversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    className={cn(
                                        "group flex items-center justify-between w-full px-3 py-2 text-left rounded-md transition-all cursor-pointer",
                                        activeId === conv.id ? "bg-slate-800 text-slate-200" : "hover:bg-slate-800/50 text-slate-400 hover:text-slate-200"
                                    )}
                                    onClick={() => onSelectConversation(conv.id)}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <Clock size={14} className={activeId === conv.id ? "text-indigo-400" : "text-slate-500"} />
                                        <span className="truncate text-sm">{conv.title}</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteConversation(conv.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="p-4 border-t border-slate-800 space-y-2">
                <button
                    onClick={onProfileClick}
                    className="flex items-center gap-3 w-full p-2 hover:bg-slate-800 rounded-md transition-colors"
                >
                    <div className="bg-slate-700 p-1.5 rounded-full shrink-0">
                        <User size={18} className="text-slate-300" />
                    </div>
                    <div className="flex flex-col items-start overflow-hidden">
                        <span className="text-sm font-medium truncate w-full">{user?.name || 'User'}</span>
                        <span className="text-[10px] text-slate-500 truncate w-full">{user?.email}</span>
                    </div>
                </button>

                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 w-full p-2 hover:bg-red-900/20 text-slate-400 hover:text-red-400 rounded-md transition-all group"
                >
                    <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    <span className="text-sm font-medium">Log out</span>
                </button>
            </div>
        </div>
    );
}
