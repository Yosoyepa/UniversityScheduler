/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
/**
 * DashboardLayout Template Component.
 *
 * Mockup reference: university_schedule_dashboard_1/2
 *
 * Layout for authenticated dashboard pages.
 * Features:
 *   - Glassmorphism sticky navbar with brand, theme toggle pill, user avatar
 *   - Responsive sidebar with Material Icons navigation
 *   - Dark mode support with smooth transitions
 */

"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationDropdown } from "../organisms/NotificationDropdown";
import { useTheme } from "@/features/theme/context/ThemeContext";
import { useAuth } from "@/features/auth/hooks/useAuth";

// =============================================================================
// Types
// =============================================================================

export interface DashboardLayoutProps {
    children: ReactNode;
}

interface NavItem {
    label: string;
    href: string;
    icon: string; // Material Icons name
}

// =============================================================================
// Navigation Items
// =============================================================================

const navItems: NavItem[] = [
    { label: "Horario", href: "/dashboard/schedule", icon: "calendar_month" },
    { label: "Tareas", href: "/dashboard/tasks", icon: "task_alt" },
    { label: "Progreso", href: "/dashboard/progress", icon: "insights" },
    { label: "Directorio", href: "/dashboard/directory", icon: "groups" },
];

const secondaryNavItems: NavItem[] = [
    { label: "Ajustes", href: "/dashboard/settings", icon: "settings" },
];

// =============================================================================
// Helpers
// =============================================================================

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

// =============================================================================
// Component
// =============================================================================

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { isDark, toggleTheme } = useTheme();
    const { user, logout } = useAuth();

    const renderNavLink = (item: NavItem) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
            <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.label.toLowerCase()}`}
                onClick={() => setSidebarOpen(false)}
                className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150
                    ${isActive
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-semibold"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/60 font-medium"
                    }
                `}
            >
                <span className={`material-icons-round text-xl ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-500"}`}>
                    {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
                {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                )}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-gray-800 dark:text-gray-200 font-sans antialiased transition-colors duration-200">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 z-50 h-full w-64
                    bg-surface-light dark:bg-surface-dark
                    border-r border-border-light dark:border-border-dark
                    flex flex-col
                    transform transition-transform duration-200 ease-in-out
                    lg:translate-x-0
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                {/* Sidebar header — Brand */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-border-light dark:border-border-dark">
                    <Link href="/dashboard" className="flex items-center gap-3" id="sidebar-logo">
                        <div className="bg-primary/10 dark:bg-primary-light/20 p-2 rounded-lg text-primary dark:text-indigo-400">
                            <span className="material-icons-round text-2xl">school</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight text-gray-900 dark:text-white leading-tight">
                                UniSchedule
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                Semester 2024-1
                            </p>
                        </div>
                    </Link>
                    <button
                        className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Cerrar menú"
                    >
                        <span className="material-icons-round text-xl">close</span>
                    </button>
                </div>

                {/* Primary Navigation */}
                <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" aria-label="Navegación principal">
                    {navItems.map(renderNavLink)}
                </nav>

                {/* Secondary Navigation (bottom) */}
                <div className="p-3 border-t border-border-light dark:border-border-dark space-y-0.5">
                    {secondaryNavItems.map(renderNavLink)}

                    {/* User section */}
                    {user && (
                        <div className="flex items-center gap-3 mt-2 px-3 py-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                                {getInitials(user.full_name)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {user.full_name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {user.email}
                                </p>
                            </div>
                            {logout && (
                                <button
                                    id="sidebar-logout-btn"
                                    onClick={logout}
                                    className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg"
                                    title="Cerrar sesión"
                                    aria-label="Cerrar sesión"
                                >
                                    <span className="material-icons-round text-lg">logout</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </aside>

            {/* Main content area */}
            <div className="lg:pl-64 flex flex-col min-h-screen">
                {/* Glassmorphism top navbar */}
                <header className="sticky top-0 z-30 h-16 bg-surface-light/90 dark:bg-surface-dark/80 border-b border-border-light dark:border-border-dark glass-panel px-4 sm:px-6 flex items-center gap-3">
                    {/* Mobile menu button */}
                    <button
                        id="sidebar-mobile-toggle"
                        className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Abrir menú"
                    >
                        <span className="material-icons-round text-xl">menu</span>
                    </button>

                    <div className="flex-1" />

                    {/* Theme toggle pill */}
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700/50 border border-transparent dark:border-slate-600 rounded-full px-1 p-1">
                        <button
                            onClick={() => !isDark || toggleTheme()}
                            className={`p-1.5 rounded-full transition-colors ${
                                !isDark
                                    ? "bg-white dark:bg-slate-600 shadow-sm text-yellow-500"
                                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            }`}
                            aria-label="Modo claro"
                        >
                            <span className="material-icons-round text-sm">light_mode</span>
                        </button>
                        <button
                            onClick={() => isDark || toggleTheme()}
                            className={`p-1.5 rounded-full transition-colors ${
                                isDark
                                    ? "bg-white dark:bg-slate-600 shadow-sm text-indigo-500 dark:text-indigo-300"
                                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            }`}
                            aria-label="Modo oscuro"
                        >
                            <span className="material-icons-round text-sm">dark_mode</span>
                        </button>
                    </div>

                    {/* Notification bell */}
                    <NotificationDropdown />

                    {/* User avatar (desktop) — gradient circle with initials */}
                    {user && (
                        <Link
                            href="/dashboard/settings"
                            id="header-user-avatar"
                            className="hidden sm:flex"
                        >
                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white dark:ring-slate-700">
                                {getInitials(user.full_name)}
                            </div>
                        </Link>
                    )}
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
