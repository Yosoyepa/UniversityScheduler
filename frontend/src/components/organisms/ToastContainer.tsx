/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
"use client";

/**
 * ToastContainer — Fixed overlay for displaying toast notifications
 *
 * Positioned bottom-right. Renders a stack of Toast notifications
 * with slide-in animation and close button.
 *
 * Atom-level: purely presentational, consumes useToast hook.
 * Level: Organism (uses atoms + context — feature-aware)
 */

import React from "react";
import { useToast, Toast, ToastType } from "@/features/notifications/context/ToastContext";
import { XIcon } from "@/components/atoms/Icon";

// =============================================================================
// Toast type config
// =============================================================================

const typeConfig: Record<
    ToastType,
    { bg: string; border: string; icon: string; textColor: string }
> = {
    success: {
        bg: "bg-green-50 dark:bg-green-900/20",
        border: "border-green-200 dark:border-green-700",
        icon: "✅",
        textColor: "text-green-800 dark:text-green-300",
    },
    error: {
        bg: "bg-red-50 dark:bg-red-900/20",
        border: "border-red-200 dark:border-red-700",
        icon: "❌",
        textColor: "text-red-800 dark:text-red-300",
    },
    warning: {
        bg: "bg-amber-50 dark:bg-amber-900/20",
        border: "border-amber-200 dark:border-amber-700",
        icon: "⚠️",
        textColor: "text-amber-800 dark:text-amber-300",
    },
    info: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-700",
        icon: "ℹ️",
        textColor: "text-blue-800 dark:text-blue-300",
    },
};

// =============================================================================
// Single Toast Item
// =============================================================================

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const config = typeConfig[toast.type];

    return (
        <div
            role="alert"
            aria-live="polite"
            className={`
                flex items-start gap-3 p-4 rounded-lg border shadow-lg
                min-w-[300px] max-w-[420px]
                animate-in slide-in-from-right-full duration-300
                ${config.bg} ${config.border}
            `}
        >
            <span className="text-lg flex-shrink-0 mt-0.5" aria-hidden>
                {config.icon}
            </span>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${config.textColor}`}>
                    {toast.title}
                </p>
                {toast.message && (
                    <p className={`text-xs mt-0.5 opacity-80 ${config.textColor}`}>
                        {toast.message}
                    </p>
                )}
            </div>
            <button
                onClick={onClose}
                aria-label="Cerrar notificación"
                className={`flex-shrink-0 p-0.5 rounded opacity-60 hover:opacity-100 transition-opacity ${config.textColor}`}
            >
                <XIcon size="xs" />
            </button>
        </div>
    );
}

// =============================================================================
// Container
// =============================================================================

export function ToastContainer() {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div
            className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2"
            aria-label="Notifications"
        >
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}
