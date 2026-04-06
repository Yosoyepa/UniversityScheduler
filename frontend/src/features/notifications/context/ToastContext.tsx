/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
"use client";

/**
 * ToastContext — Global Toast Notification System
 *
 * Provides toast() shorthand functions for success, error, warning, info.
 * Toasts auto-dismiss after `duration` ms (default 5000).
 * Max 5 simultaneous toasts visible.
 */

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
    useRef,
} from "react";

// =============================================================================
// Types
// =============================================================================

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, "id">) => void;
    removeToast: (id: string) => void;
    toast: {
        success: (title: string, message?: string) => void;
        error: (title: string, message?: string) => void;
        warning: (title: string, message?: string) => void;
        info: (title: string, message?: string) => void;
    };
}

const MAX_TOASTS = 5;
const DEFAULT_DURATION = 5000;

// =============================================================================
// Context
// =============================================================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// =============================================================================
// Provider
// =============================================================================

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timerRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        const timer = timerRefs.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timerRefs.current.delete(id);
        }
    }, []);

    const addToast = useCallback(
        ({ type, title, message, duration = DEFAULT_DURATION }: Omit<Toast, "id">) => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            const newToast: Toast = { id, type, title, message, duration };

            setToasts((prev) => {
                // Limit to MAX_TOASTS
                const updated = [...prev, newToast];
                return updated.slice(-MAX_TOASTS);
            });

            // Auto-dismiss
            const timer = setTimeout(() => removeToast(id), duration);
            timerRefs.current.set(id, timer);
        },
        [removeToast]
    );

    const toastShorthands = {
        success: (title: string, message?: string) =>
            addToast({ type: "success", title, message, duration: DEFAULT_DURATION }),
        error: (title: string, message?: string) =>
            addToast({ type: "error", title, message, duration: 7000 }),
        warning: (title: string, message?: string) =>
            addToast({ type: "warning", title, message, duration: DEFAULT_DURATION }),
        info: (title: string, message?: string) =>
            addToast({ type: "info", title, message, duration: DEFAULT_DURATION }),
    };

    return (
        <ToastContext.Provider
            value={{ toasts, addToast, removeToast, toast: toastShorthands }}
        >
            {children}
        </ToastContext.Provider>
    );
}

// =============================================================================
// Hook
// =============================================================================

export function useToast(): ToastContextType {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return ctx;
}
