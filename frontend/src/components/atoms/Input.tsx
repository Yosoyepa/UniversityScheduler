/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
/**
 * Input Atom Component.
 *
 * Mockup reference: add_and_edit_class_details_2 (rounded-xl inputs with focus ring)
 *
 * Reusable text input with error states and optional leading icon.
 * Following Atomic Design — smallest building block.
 */

import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

// =============================================================================
// Types
// =============================================================================

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
    errorMessage?: string;
    leadingIcon?: ReactNode;
}

// =============================================================================
// Styles — Mockup-aligned
// =============================================================================

const baseStyles =
    "w-full px-4 py-2.5 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800/50 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-transparent";

const normalStyles =
    "border-gray-300 dark:border-gray-700 focus:ring-primary";

const errorStyles =
    "border-red-500 focus:ring-red-500";

// =============================================================================
// Component
// =============================================================================

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ error = false, errorMessage, leadingIcon, className = "", ...props }, ref) => {
        const inputClasses = [
            baseStyles,
            error ? errorStyles : normalStyles,
            leadingIcon ? "pl-10" : "",
            className,
        ]
            .filter(Boolean)
            .join(" ");

        return (
            <div className="w-full">
                <div className="relative">
                    {leadingIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
                            {leadingIcon}
                        </div>
                    )}
                    <input ref={ref} className={inputClasses} {...props} />
                </div>
                {error && errorMessage && (
                    <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errorMessage}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
