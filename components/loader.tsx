"use client";

import { Loader2 } from "lucide-react";

export default function Loader({ text = "Loading..." }: { text?: string }) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm dark:bg-black/60">
            <Loader2 className="w-10 h-10 animate-spin text-black dark:text-white" />
            <p className="mt-3 text-gray-700 dark:text-gray-200 text-sm">{text}</p>
        </div>
    );
}
