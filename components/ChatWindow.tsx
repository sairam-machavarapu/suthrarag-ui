'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Send, Loader2 } from 'lucide-react';
import { ChatMessage, ChatResponse } from '@/types/rag';
import MessageBubble from './MessageBubble';
import { askQuestion } from '@/lib/api';

interface ChatWindowProps {
    onTokenUsageUpdate: (usage: ChatResponse['metadata']['token_usage']) => void;
    messages: ChatMessage[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export default function ChatWindow({ onTokenUsageUpdate, messages, setMessages }: ChatWindowProps) {
    const { data: session } = useSession();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const token = (session?.user as any)?.id_token;
            const response = await askQuestion(userMessage.content, token);

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.answer,
                timestamp: new Date().toISOString(),
                sources: response.sources,
                metadata: response.metadata,
            };

            setMessages((prev) => [...prev, assistantMessage]);
            if (response.metadata?.token_usage) {
                onTokenUsageUpdate(response.metadata.token_usage);
            }
        } catch (error: unknown) {
            console.error(error);
            const errorMessageValue = error instanceof Error ? error.message : 'An error occurred while connecting to the AI Assistant.';
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: errorMessageValue,
                timestamp: new Date().toISOString(),
                isError: true,
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            // Give focus back to the input
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-200">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto w-full">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                        <div className="bg-slate-800/50 p-8 rounded-full mb-6">
                            <span className="text-4xl text-indigo-400">✨</span>
                        </div>
                        <h2 className="text-2xl font-semibold text-slate-300 mb-2">How can I help you today?</h2>
                        <p className="max-w-md text-center text-sm">
                            Ask questions about your enterprise knowledge base, and I&apos;ll find the right answers using retrieved documents.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {messages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} />
                        ))}

                        {/* Loading Indicator */}
                        {isLoading && (
                            <div className="flex w-full py-6 px-4 md:px-8 bg-slate-800">
                                <div className="max-w-4xl w-full mx-auto flex gap-6">
                                    <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border border-slate-700 bg-emerald-600 shadow-lg shadow-emerald-900/50">
                                        <Loader2 size={20} className="text-white animate-spin" />
                                    </div>
                                    <div className="flex-1 w-full min-w-0 flex items-center">
                                        <div className="text-sm text-slate-400 flex gap-2 w-full">
                                            Suthra AI is thinking...
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-4 w-full shrink-0" />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="w-full flex-shrink-0 p-4 md:px-8 bg-slate-950 border-t border-slate-800">
                <div className="max-w-4xl mx-auto relative group flex items-end bg-slate-800/50 rounded-xl border border-slate-700 shadow-xl focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 transition-all duration-300 px-4 py-3">
                    <textarea
                        ref={inputRef}
                        rows={1}
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            // Auto resize text area
                            e.target.style.height = 'auto';
                            e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Send a message..."
                        disabled={isLoading}
                        className="w-full bg-transparent border-none focus:outline-none focus:ring-0 resize-none max-h-48 text-slate-200 placeholder-slate-500 min-h-[24px] overflow-y-auto my-1"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={!input.trim() || isLoading}
                        className="ml-2 flex-shrink-0 p-2 sm:p-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
                <div className="text-center mt-3 text-xs text-slate-500">
                    Enterprise AI Assistant • Answers generated from retrieved documents.
                </div>
            </div>
        </div>
    );
}
