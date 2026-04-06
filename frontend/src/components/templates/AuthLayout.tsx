/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
/**
 * AuthLayout Template Component.
 *
 * Layout for authentication pages (login, register).
 * Following Atomic Design - template defines page structure.
 */

import { ReactNode } from "react";

// =============================================================================
// Types
// =============================================================================

export interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

// =============================================================================
// Component
// =============================================================================

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
            <div className="w-full max-w-md">
                {/* Logo / Branding */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        📚 University Scheduler
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Organiza tu vida académica
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {/* Form content */}
                    {children}
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                    © 2026 University Scheduler. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
}
