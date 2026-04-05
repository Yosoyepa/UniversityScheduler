/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
/**
 * Badge Atom Component.
 *
 * Mockup reference: university_schedule_dashboard_1 (difficulty badges), tasks_and_exams_manager_1 (type/priority)
 *
 * Small label for status indicators, tags, and counts.
 * Following Atomic Design — smallest building block.
 */

import { HTMLAttributes } from "react";

// =============================================================================
// Types
// =============================================================================

export type BadgeVariant =
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "info";

export type BadgeSize = "xs" | "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    size?: BadgeSize;
}

// =============================================================================
// Styles — Mockup-aligned with dark mode
// =============================================================================

const baseStyles = "inline-flex items-center font-bold uppercase tracking-wide rounded-full";

const variantStyles: Record<BadgeVariant, string> = {
    default: "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300",
    primary: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    info: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
};

const sizeStyles: Record<BadgeSize, string> = {
    xs: "px-1.5 py-0.5 text-[10px]",
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
};

// =============================================================================
// Component
// =============================================================================

export function Badge({
    variant = "default",
    size = "sm",
    className = "",
    children,
    ...props
}: BadgeProps) {
    const classes = [
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <span className={classes} {...props}>
            {children}
        </span>
    );
}
