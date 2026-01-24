/**
 * DashboardLayout Template Component.
 *
 * Layout for authenticated dashboard pages.
 * Following Atomic Design - template defines page structure.
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
} from "../atoms/Icon";
import type { User } from "@/types";

// =============================================================================
// Types
// =============================================================================

export interface DashboardLayoutProps {
    children: ReactNode;
    user: User | null;
    onLogout?: () => void;
}

interface NavItem {
    label: string;
    href: string;
    icon: ReactNode;
}

// =============================================================================
// Navigation Items
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
];

// =============================================================================
// Component
// =============================================================================

export function DashboardLayout({
    children,
    user,
    onLogout,
}: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
          fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800
          border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
            >
                {/* Sidebar header */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <span className="text-xl">📚</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                            UniScheduler
                        </span>
                    </Link>
                    <button
                        className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <XIcon size="md" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${isActive
                                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                                    }
                `}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
                    {user && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <UserIcon size="md" className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                    {user.full_name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {user.email}
                                </p>
                            </div>
                            {onLogout && (
                                <button
                                    onClick={onLogout}
                                    className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                                    title="Cerrar sesión"
                                >
                                    <LogoutIcon size="md" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center gap-4">
                    <button
                        className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <MenuIcon size="md" />
                    </button>
                    <div className="flex-1" />
                    {/* Add more header items here (search, notifications, etc.) */}
                </header>

                {/* Page content */}
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
