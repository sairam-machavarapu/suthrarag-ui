import { DocumentSource } from '@/types/rag';
import { FileText } from 'lucide-react';

interface SourceListProps {
    sources: DocumentSource[];
}

export default function SourceList({ sources }: SourceListProps) {
    if (!sources || sources.length === 0) return null;

    return (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
            <div className="text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wide">
                Sources
            </div>
            <div className="flex flex-wrap gap-2">
                {sources.map((source, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-md border border-slate-700 text-sm text-indigo-300 hover:bg-slate-700 hover:border-indigo-500/50 transition-colors cursor-pointer"
                    >
                        <FileText size={14} className="text-indigo-400" />
                        <span className="truncate max-w-[200px]" title={source.documentName}>
                            {source.documentName}
                        </span>
                        <span className="bg-indigo-500/20 text-indigo-200 px-1.5 rounded text-[10px] font-mono leading-tight">
                            #{source.chunkNumber}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
