import { ChatMessage } from '@/types/rag';
import { User, Bot, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import SourceList from './SourceList';

interface MessageBubbleProps {
    message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === 'user';

    return (
        <div className={clsx("flex w-full py-6 px-4 md:px-8", {
            "bg-slate-900": isUser,
            "bg-slate-800": !isUser
        })}>
            <div className="max-w-4xl w-full mx-auto flex gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border border-slate-700">
                    {isUser ? (
                        <div className="bg-indigo-600 rounded-full w-full h-full flex items-center justify-center">
                            <User size={20} className="text-white" />
                        </div>
                    ) : (
                        <div className="bg-emerald-600 rounded-full w-full h-full flex items-center justify-center shadow-lg shadow-emerald-900/50">
                            <Bot size={20} className="text-white" />
                        </div>
                    )}
                </div>

                {/* Message Content */}
                <div className="flex-1 w-full min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-300">
                            {isUser ? 'You' : 'Suthra AI'}
                        </span>
                        {message.timestamp && (
                            <span className="text-[10px] text-slate-500 font-normal">
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </div>

                    <div className="text-slate-200 leading-relaxed whitespace-pre-wrap flex flex-col gap-4">
                        {message.isError ? (
                            <div className="flex items-center gap-2 text-red-400 bg-red-900/20 p-3 rounded-md border border-red-900/50">
                                <AlertCircle size={18} />
                                <span>{message.content}</span>
                            </div>
                        ) : (
                            message.content
                        )}
                    </div>

                    {!isUser && message.sources && (
                        <SourceList sources={message.sources} />
                    )}
                </div>
            </div>
        </div>
    );
}
