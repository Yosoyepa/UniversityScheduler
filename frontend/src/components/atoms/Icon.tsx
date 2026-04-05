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

// =============================================================================
// Phase 5 Icons — Settings, Notifications, Theme
// =============================================================================

export function SettingsIcon(props: Omit<IconProps, "children">) {
    return (
        <Icon {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </Icon>
    );
}

export function BellIcon(props: Omit<IconProps, "children">) {
    return (
        <Icon {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </Icon>
    );
}

export function SunIcon(props: Omit<IconProps, "children">) {
    return (
        <Icon {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </Icon>
    );
}

export function MoonIcon(props: Omit<IconProps, "children">) {
    return (
        <Icon {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </Icon>
    );
}

export function ChartIcon(props: Omit<IconProps, "children">) {
    return (
        <Icon {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </Icon>
    );
}

export function ShieldIcon(props: Omit<IconProps, "children">) {
    return (
        <Icon {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </Icon>
    );
}

export function PaletteIcon(props: Omit<IconProps, "children">) {
    return (
        <Icon {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </Icon>
    );
}
