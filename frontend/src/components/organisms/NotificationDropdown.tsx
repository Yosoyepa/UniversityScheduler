/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
"use client";

/**
 * NotificationDropdown — Bell dropdown for header
 *
 * Organism: Shows list of recent notifications with read/unread state.
 * Integrates with useNotifications hook.
 */

import React, { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { BellIcon, CheckIcon } from "@/components/atoms/Icon";

export function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading, fetchNotifications } = useNotifications();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAllRead = async () => {
        await markAllAsRead();
    };

    const handleMarkRead = async (id: string) => {
        await markAsRead(id);
    };

    return (
        <div ref={dropdownRef} className="relative">
            {/* Bell button */}
            <button
                id="notifications-bell-button"
                aria-label={`${unreadCount} notificaciones sin leer`}
                aria-haspopup="true"
                aria-expanded={isOpen}
                onClick={() => {
                    setIsOpen((prev) => {
                        const next = !prev;
                        if (next) fetchNotifications(); // Fetch fresh data when opening
                        return next;
                    });
                }}
                className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <BellIcon size="md" />
                {unreadCount > 0 && (
                    <span
                        aria-hidden
                        className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
                    >
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {isOpen && (
                <div
                    role="dialog"
                    aria-label="Notifications"
                    className="absolute right-0 mt-2 w-80 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 z-50"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            Notifications
                        </span>
                        {unreadCount > 0 && (
                            <button
                                id="notifications-mark-all-read"
                                onClick={handleMarkAllRead}
                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Notification list */}
                    <div className="max-h-80 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex justify-center py-6">
                                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-8 text-center">
                                <BellIcon size="lg" className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                    No hay notificaciones
                                </p>
                            </div>
                        ) : (
                            <ul>
                                {notifications.map((notif) => (
                                    <li
                                        key={notif.id}
                                        className={`
                                            flex gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0
                                            ${notif.is_read ? "" : "bg-indigo-50/50 dark:bg-indigo-900/10"}
                                        `}
                                    >
                                        {/* Unread dot */}
                                        <div className="flex-shrink-0 mt-1">
                                            {!notif.is_read && (
                                                <div className="w-2 h-2 rounded-full bg-indigo-500" aria-label="Unread" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${notif.is_read ? "text-gray-600 dark:text-gray-400" : "text-gray-900 dark:text-white"}`}>
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                                {notif.message}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                {new Date(notif.created_at).toLocaleDateString("es-CO", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>

                                        {/* Mark read button */}
                                        {!notif.is_read && (
                                            <button
                                                id={`notification-read-${notif.id}`}
                                                aria-label="Mark as read"
                                                onClick={() => handleMarkRead(notif.id)}
                                                className="flex-shrink-0 p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                            >
                                                <CheckIcon size="xs" />
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
