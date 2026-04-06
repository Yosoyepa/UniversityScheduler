/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
/**
 * Label Atom Component.
 *
 * Form label with optional required indicator.
 */

import { LabelHTMLAttributes } from "react";

// =============================================================================
// Types
// =============================================================================

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean;
}

// =============================================================================
// Component
// =============================================================================

export function Label({
    required = false,
    className = "",
    children,
    ...props
}: LabelProps) {
    const classes = [
        "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <label className={classes} {...props}>
            {children}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
    );
}
