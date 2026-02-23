/**
 * Icon Atom Component.
 *
 * SVG icon wrapper with consistent sizing.
 * Uses Lucide React icons or custom SVGs.
 */

import { SVGAttributes } from "react";

// =============================================================================
// Types
// =============================================================================

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface IconProps extends SVGAttributes<SVGSVGElement> {
    size?: IconSize;
}

// =============================================================================
// Styles
// =============================================================================

const sizeStyles: Record<IconSize, string> = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
};

// =============================================================================
// Base Icon Component
// =============================================================================

export function Icon({
    size = "md",
    className = "",
    children,
    ...props
}: IconProps) {
    const classes = [sizeStyles[size], className].filter(Boolean).join(" ");

    return (
        <svg
            className={classes}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            {...props}
        >
            {children}
        </svg>
    );
}

// =============================================================================
// Common Icons
// =============================================================================

export function CheckIcon(props: Omit<IconProps, "children">) {
    return (
        <Icon {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </Icon>
    );
}

export function XIcon(props: Omit<IconProps, "children">) {
    return (
        <Icon {...props}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
            />
        </Icon>
    );
}

export function PlusIcon(props: Omit<IconProps, "children">) {
    return (
        <Icon {...props}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
            />
        </Icon>
    );
}

export function CalendarIcon(props: Omit<IconProps, "children">) {
    return (
        <Icon {...props}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
        </Icon>
    );
}

export function TaskIcon(props: Omit<IconProps, "children">) {
    return (
        <Icon {...props}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
        </Icon>
    );
}

export function UserIcon(props: Omit<IconProps, "children">) {
    return (
        <Icon {...props}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
        </Icon>
    );
}

export function LogoutIcon(props: Omit<IconProps, "children">) {
    return (
        <Icon {...props}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
        </Icon>
    );
}

export function MenuIcon(props: Omit<IconProps, "children">) {
    return (
        <Icon {...props}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
            />
        </Icon>
    );
}

export function ChevronDownIcon(props: Omit<IconProps, "children">) {
    return (
        <Icon {...props}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
            />
        </Icon>
    );
}

export function SpinnerIcon(props: Omit<IconProps, "children">) {
    return (
        <Icon className="animate-spin" {...props}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </Icon>
    );
}
