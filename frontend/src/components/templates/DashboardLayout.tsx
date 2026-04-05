/**
 * DashboardLayout Template Component.
 *
 * Layout for authenticated dashboard pages.
 * Following Atomic Design - template defines page structure.
 *
 * Phase 5 additions:
 *   - Settings navItem → /dashboard/settings
 *   - Progress navItem → /dashboard/progress
 *   - Dark mode toggle (Sun/Moon) in header
 *   - Notification bell with unread badge (NotificationDropdown)
 *   - User avatar + name in top-right header
 */

"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    CalendarIcon,
    TaskIcon,
    UserIcon,
    LogoutIcon,
    MenuIcon,
    XIcon,
    ChartIcon,
    SettingsIcon,
    SunIcon,
    MoonIcon,
} from "../atoms/Icon";
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
    icon: ReactNode;
}

// =============================================================================
// Navigation Items — Primary pages
// =============================================================================

const navItems: NavItem[] = [
    {
        label: "Horario",
        href: "/dashboard/schedule",
        icon: <CalendarIcon size="md" />,
    },
    {
        label: "Tareas",
        href: "/dashboard/tasks",
        icon: <TaskIcon size="md" />,
    },
    {
        label: "Progreso",
        href: "/dashboard/progress",
        icon: <ChartIcon size="md" />,
    },
    {
        label: "Directorio",
        href: "/dashboard/directory",
        icon: <UserIcon size="md" />,
    },
];

// Bottom secondary nav
const secondaryNavItems: NavItem[] = [
    {
        label: "Ajustes",
        href: "/dashboard/settings",
        icon: <SettingsIcon size="md" />,
    },
];

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
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150
                    ${isActive
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-semibold"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/60 font-medium"
                    }
                `}
            >
                {item.icon}
                <span>{item.label}</span>
                {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                )}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
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
                    bg-white dark:bg-gray-900
                    border-r border-gray-200 dark:border-gray-800
                    flex flex-col
                    transform transition-transform duration-200 ease-in-out
                    lg:translate-x-0
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                {/* Sidebar header */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
                    <Link href="/dashboard" className="flex items-center gap-2.5" id="sidebar-logo">
                        <span className="text-xl">📚</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                            UniScheduler
                        </span>
                    </Link>
                    <button
                        className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Cerrar menú"
                    >
                        <XIcon size="md" />
                    </button>
                </div>

                {/* Primary Navigation */}
                <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" aria-label="Navegación principal">
                    {navItems.map(renderNavLink)}
                </nav>

                {/* Secondary Navigation (bottom) */}
                <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-0.5">
                    {secondaryNavItems.map(renderNavLink)}

                    {/* User section */}
                    {user && (
                        <div className="flex items-center gap-3 mt-2 px-3 py-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                                <UserIcon size="sm" className="text-indigo-600 dark:text-indigo-400" />
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
                                    <LogoutIcon size="sm" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </aside>

            {/* Main content area */}
            <div className="lg:pl-64 flex flex-col min-h-screen">
                {/* Top header bar */}
                <header className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center gap-3">
                    {/* Mobile menu button */}
                    <button
                        id="sidebar-mobile-toggle"
                        className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Abrir menú"
                    >
                        <MenuIcon size="md" />
                    </button>

                    <div className="flex-1" />

                    {/* Dark mode toggle */}
                    <button
                        id="header-theme-toggle"
                        onClick={toggleTheme}
                        aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        {isDark ? <SunIcon size="md" /> : <MoonIcon size="md" />}
                    </button>

                    {/* Notification bell */}
                    <NotificationDropdown />

                    {/* User avatar (desktop) */}
                    {user && (
                        <Link
                            href="/dashboard/settings"
                            id="header-user-avatar"
                            className="hidden sm:flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                                <UserIcon size="xs" className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                                {user.full_name}
                            </span>
                        </Link>
                    )}
                </header>

                {/* Page content */}
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
