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

export function ArchiveIcon(props: Omit<IconProps, "children">) {
    return (
        <Icon {...props}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
        </Icon>
    );
}

export function ClockIcon(props: Omit<IconProps, "children">) {
    return (
        <Icon {...props}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </Icon>
    );
}

export function EditIcon(props: Omit<IconProps, "children">) {
    return (
        <Icon {...props}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
        </Icon>
    );
}

export function TrashIcon(props: Omit<IconProps, "children">) {
    return (
        <Icon {...props}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
        </Icon>
    );
}
