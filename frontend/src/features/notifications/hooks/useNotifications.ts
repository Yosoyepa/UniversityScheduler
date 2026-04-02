"use client";

/**
 * useNotifications — Feature hook for in-app notification management
 *
 * Lists notifications, manages read state, polls unread count for bell badge.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import type { AppNotification, NotificationListResponse, UnreadCountResponse } from "@/types/entities";

const POLL_INTERVAL_MS = 30_000; // 30 seconds polling for bell badge

interface UseNotificationsReturn {
    notifications: AppNotification[];
    unreadCount: number;
    isLoading: boolean;
    fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refreshCount: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const refreshCount = useCallback(async () => {
        const result = await apiClient.get<UnreadCountResponse>("/user/notifications/count");
        if (result.ok) {
            setUnreadCount(result.value.unread_count);
        }
    }, []);

    const fetchNotifications = useCallback(async (unreadOnly = false) => {
        setIsLoading(true);
        try {
            const url = unreadOnly
                ? "/user/notifications?unread_only=true"
                : "/user/notifications";
            const result = await apiClient.get<NotificationListResponse>(url);
            if (result.ok) {
                setNotifications(result.value.data);
                setUnreadCount(result.value.unread_count);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (notificationId: string) => {
        const result = await apiClient.patch(`/user/notifications/${notificationId}/read`, {});
        if (result.ok) {
            setNotifications((prev) =>
                prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        const result = await apiClient.patch("/user/notifications/read-all", {});
        if (result.ok) {
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            setUnreadCount(0);
        }
    }, []);

    // Start polling for badge counter
    useEffect(() => {
        fetchNotifications();

        pollRef.current = setInterval(refreshCount, POLL_INTERVAL_MS);
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [fetchNotifications, refreshCount]);

    return {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        refreshCount,
    };
}
