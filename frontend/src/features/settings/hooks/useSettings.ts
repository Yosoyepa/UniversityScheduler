"use client";

/**
 * useSettings — Feature hook for User Settings
 *
 * Fetches, updates, and manages user preferences.
 * Integrates with ThemeProvider for dark mode sync.
 * Emits toasts on success/error.
 */

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/features/notifications/context/ToastContext";
import { useTheme } from "@/features/theme/context/ThemeContext";
import type { UserSettingsExpanded, UpdateSettingsPayload, UpdateProfilePayload } from "@/types/entities";

interface UseSettingsReturn {
    settings: UserSettingsExpanded | null;
    isLoading: boolean;
    isSaving: boolean;
    fetchSettings: () => Promise<void>;
    updateSettings: (payload: UpdateSettingsPayload) => Promise<void>;
    updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
    discardChanges: () => void;
    pendingChanges: Partial<UpdateSettingsPayload>;
    setPendingChanges: (changes: Partial<UpdateSettingsPayload>) => void;
}

export function useSettings(): UseSettingsReturn {
    const [settings, setSettings] = useState<UserSettingsExpanded | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [pendingChanges, setPendingChanges] = useState<Partial<UpdateSettingsPayload>>({});
    const { toast } = useToast();
    const { setTheme } = useTheme();

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await apiClient.get<UserSettingsExpanded>("/user/settings");
            if (result.ok) {
                setSettings(result.value);
                // Sync theme state with backend settings
                setTheme(result.value.dark_mode ? "dark" : "light");
            } else {
                toast.error("Error", "No se pudieron cargar las preferencias");
            }
        } finally {
            setIsLoading(false);
        }
    }, [toast, setTheme]);

    const updateSettings = useCallback(async (payload: UpdateSettingsPayload) => {
        setIsSaving(true);
        try {
            const result = await apiClient.patch<UserSettingsExpanded>("/user/settings", payload);
            if (result.ok) {
                setSettings(result.value);
                // Sync dark mode if it changed
                if (payload.dark_mode !== undefined) {
                    setTheme(payload.dark_mode ? "dark" : "light");
                }
                setPendingChanges({});
                toast.success("Preferencias guardadas", "Tus cambios han sido aplicados");
            } else {
                toast.error("Error al guardar", result.error.message);
            }
        } finally {
            setIsSaving(false);
        }
    }, [toast, setTheme]);

    const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
        setIsSaving(true);
        try {
            const result = await apiClient.put<{ full_name: string }>("/user/profile", payload);
            if (result.ok) {
                toast.success("Perfil actualizado", "Tu nombre ha sido guardado");
            } else {
                toast.error("Error al actualizar perfil", result.error.message);
            }
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const discardChanges = useCallback(() => {
        setPendingChanges({});
        toast.info("Cambios descartados");
    }, [toast]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return {
        settings,
        isLoading,
        isSaving,
        fetchSettings,
        updateSettings,
        updateProfile,
        discardChanges,
        pendingChanges,
        setPendingChanges,
    };
}
