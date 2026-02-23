/**
 * Input Atom Component.
 *
 * Reusable text input with error states.
 * Following Atomic Design - smallest building block.
 */

import { InputHTMLAttributes, forwardRef } from "react";

// =============================================================================
// Types
// =============================================================================

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
    errorMessage?: string;
}

// =============================================================================
// Styles
// =============================================================================

const baseStyles =
    "w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500";

const normalStyles =
    "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600";

const errorStyles =
    "border-red-500 focus:border-red-500 focus:ring-red-500";

// =============================================================================
// Component
// =============================================================================

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ error = false, errorMessage, className = "", ...props }, ref) => {
        const classes = [
            baseStyles,
            error ? errorStyles : normalStyles,
            className,
        ]
            .filter(Boolean)
            .join(" ");

        return (
            <div className="w-full">
                <input ref={ref} className={classes} {...props} />
                {error && errorMessage && (
                    <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
