import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UploadResult {
    status: string;
    document: string;
    message?: string;
}

export default function DocumentUpload() {
    const { data: session } = useSession();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<UploadResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [processingState, setProcessingState] = useState<{ name: string, progress: number } | null>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (processingState) {
            const checkStatus = async () => {
                try {
                    const token = (session?.user as any)?.id_token;
                    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                    const response = await fetch(`${API_BASE_URL}/admin/upload/status/${encodeURIComponent(processingState.name)}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.status === 'Indexed') {
                            toast.success(`Document "${processingState.name}" indexed successfully!`);
                            setProcessingState(null);
                        } else if (data.status === 'Cancelled') {
                            toast.info(`Processing for "${processingState.name}" was cancelled.`);
                            setProcessingState(null);
                        } else if (data.status.startsWith('Error:')) {
                            toast.error(`Indexing failed for "${processingState.name}": ${data.status}`);
                            setProcessingState(null);
                        } else {
                            setProcessingState(prev => prev ? { ...prev, progress: data.progress } : null);
                        }
                    }
                } catch (err) {
                    console.error('Error polling status:', err);
                }
            };

            interval = setInterval(checkStatus, 2000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [processingState, session]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setResult(null);
        }
    };

    const handleCancel = async () => {
        if (!processingState) return;

        try {
            const token = (session?.user as any)?.id_token;
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_BASE_URL}/admin/upload/cancel/${encodeURIComponent(processingState.name)}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                toast.info("Cancellation requested...");
            }
        } catch (err) {
            toast.error("Failed to request cancellation.");
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        setIsUploading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);
        const fileName = file.name;

        try {
            const token = (session?.user as any)?.id_token;
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_BASE_URL}/admin/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Upload failed');
            }

            const data: UploadResult = await response.json();
            setResult(data);
            setProcessingState({ name: fileName, progress: 0 });
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-4 shadow-inner">
            <div className="flex items-center gap-2 text-indigo-400 font-medium text-sm">
                <Upload size={16} />
                <span>Upload Document</span>
            </div>

            <div className="space-y-3">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.txt"
                    className="block w-full text-xs text-slate-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-xs file:font-semibold
                        file:bg-slate-700 file:text-slate-200
                        hover:file:bg-slate-600 cursor-pointer"
                />

                <button
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${!file || isUploading
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20'
                        }`}
                >
                    {isUploading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Uploading...</span>
                        </>
                    ) : (
                        <>
                            <FileText size={16} />
                            <span>Upload</span>
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="flex items-start gap-2 p-2 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-xs">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {result && (
                <div className="p-3 bg-emerald-900/20 border border-emerald-900/50 rounded-md space-y-1">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                        <CheckCircle size={14} />
                        <span>Document uploaded successfully</span>
                    </div>
                    {result.message && (
                        <div className="text-[10px] text-slate-400 pl-5">
                            {result.message}
                        </div>
                    )}
                </div>
            )}

            {processingState && (
                <div className="space-y-2 p-3 bg-slate-900/50 border border-slate-700 rounded-md">
                    <div className="flex items-center justify-between text-[10px] text-slate-300">
                        <div className="flex items-center gap-2">
                            <Loader2 size={12} className="animate-spin text-indigo-400" />
                            <span className="truncate max-w-[120px]">Indexing "{processingState.name}"...</span>
                        </div>
                        <span className="font-mono text-indigo-400">{processingState.progress}%</span>
                    </div>

                    <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-indigo-500 h-full transition-all duration-500 ease-out"
                            style={{ width: `${processingState.progress}%` }}
                        />
                    </div>

                    <button
                        onClick={handleCancel}
                        className="w-full flex items-center justify-center gap-1.5 py-1 text-[10px] text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                    >
                        <XCircle size={12} />
                        Cancel Process
                    </button>
                </div>
            )}
        </div>
    );
}
