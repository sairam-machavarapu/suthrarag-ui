"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { LogIn, Loader2, AlertCircle } from "lucide-react";

import { Suspense } from "react";

function SignInContent() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    useEffect(() => {
        if (status === "authenticated") {
            window.location.href = "/";
        }
    }, [status]);

    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Suthra AI
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Sign in with your company account to continue
                    </p>
                </div>

                {error === "AccessDenied" && (
                    <div className="flex items-start gap-3 p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm">
                        <AlertCircle size={20} className="shrink-0" />
                        <p>Only SuthraTech employees are allowed to access this system.</p>
                    </div>
                )}

                <button
                    onClick={() => signIn("azure-ad")}
                    className="flex w-full items-center justify-center gap-3 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 active:scale-95"
                >
                    <LogIn size={20} />
                    Sign in with Microsoft
                </button>

                <div className="mt-6 border-t border-slate-800 pt-6">
                    <p className="text-center text-[10px] uppercase tracking-widest text-slate-500">
                        Internal Use Only
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-950"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>}>
            <SignInContent />
        </Suspense>
    );
}
