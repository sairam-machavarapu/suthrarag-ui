import { X, Activity } from 'lucide-react';

interface ProfilePanelProps {
    isOpen: boolean;
    onClose: () => void;
    stats: {
        totalRequests: number;
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        model: string;
    };
}

const DAILY_LIMIT = 100000; // Simulated daily limit

export default function ProfilePanel({ isOpen, onClose, stats }: ProfilePanelProps) {
    if (!isOpen) return null;

    const remainingTokens = Math.max(0, DAILY_LIMIT - stats.totalTokens);
    const usagePercentage = Math.min(100, (stats.totalTokens / DAILY_LIMIT) * 100);

    return (
        <div className="fixed inset-y-0 right-0 w-80 bg-slate-900 border-l border-slate-700 shadow-2xl shadow-black/50 p-6 flex flex-col z-50 transform transition-transform duration-300">
            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                    <Activity size={20} className="text-indigo-400" />
                    Dashboard
                </h2>
                <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="space-y-6">
                {/* Token Usage Summary */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <div className="text-sm font-medium text-slate-400 mb-1">Total Tokens Used</div>
                    <div className="text-3xl font-bold tracking-tight text-white mb-4">
                        {stats.totalTokens.toLocaleString()}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-700 rounded-full h-2.5 mb-2">
                        <div
                            className="bg-indigo-500 h-2.5 rounded-full"
                            style={{ width: `${usagePercentage}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>{stats.totalTokens.toLocaleString()} used</span>
                        <span>{remainingTokens.toLocaleString()} remaining</span>
                    </div>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                        <div className="text-xs font-medium text-slate-400 mb-1">Prompt Tokens</div>
                        <div className="text-lg font-semibold text-indigo-300">
                            {stats.promptTokens.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                        <div className="text-xs font-medium text-slate-400 mb-1">Completion Tokens</div>
                        <div className="text-lg font-semibold text-emerald-300">
                            {stats.completionTokens.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Total Requests</span>
                            <span className="font-semibold text-slate-200">{stats.totalRequests}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-700/50 pt-3">
                            <span className="text-sm text-slate-400">Current Model</span>
                            <span className="bg-slate-700 px-2 py-1 rounded text-xs font-mono text-indigo-200">
                                {stats.model || 'gpt-4o-mini'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
