"use client";

/**
 * useProfessors — state hook for the Professors Directory feature.
 *
 * Handles:
 *  - Fetching all professors for the logged-in user
 *  - Creating / updating / deleting professors
 *  - Listing and booking tutoring sessions
 *
 * Follows frontend-atomic-design skill:
 *  - Single responsibility per hook
 *  - All side effects in useEffect / explicit action functions
 *  - Returns loading, error, and data consistently
 */

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import type {
    CreateOfficeHourPayload,
    CreateProfessorPayload,
    Professor,
    ScheduleTutoringPayload,
    TutoringSession,
    UUID,
    UpdateProfessorPayload,
} from "@/types/entities";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface ProfessorsState {
    professors: Professor[];
    sessions: TutoringSession[];
    loading: boolean;
    error: string | null;
}

interface ProfessorsActions {
    refresh: () => Promise<void>;
    createProfessor: (payload: CreateProfessorPayload) => Promise<Professor | null>;
    updateProfessor: (
        id: UUID,
        payload: UpdateProfessorPayload
    ) => Promise<Professor | null>;
    deleteProfessor: (id: UUID) => Promise<boolean>;
    addOfficeHour: (
        professorId: UUID,
        payload: CreateOfficeHourPayload
    ) => Promise<boolean>;
    removeOfficeHour: (professorId: UUID, officeHourId: UUID) => Promise<boolean>;
    scheduleTutoring: (payload: ScheduleTutoringPayload) => Promise<TutoringSession | null>;
    cancelSession: (sessionId: UUID) => Promise<boolean>;
    completeSession: (sessionId: UUID) => Promise<boolean>;
    refreshSessions: () => Promise<void>;
}

export type UseProfessorsReturn = ProfessorsState & ProfessorsActions;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useProfessors(): UseProfessorsReturn {
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [sessions, setSessions] = useState<TutoringSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);

        const result = await api.get<Professor[]>("/professors");
        if (result.ok) {
            setProfessors(result.value);
        } else {
            setError(result.error.message);
        }

        setLoading(false);
    }, []);

    const refreshSessions = useCallback(async () => {
        const result = await api.get<TutoringSession[]>("/tutoring");
        if (result.ok) {
            setSessions(result.value);
        }
    }, []);

    useEffect(() => {
        refresh();
        refreshSessions();
    }, [refresh, refreshSessions]);

    const createProfessor = useCallback(
        async (payload: CreateProfessorPayload): Promise<Professor | null> => {
            const result = await api.post<Professor>("/professors", payload);
            if (result.ok) {
                setProfessors((prev) => [...prev, result.value]);
                return result.value;
            }
            setError(result.error.message);
            return null;
        },
        []
    );

    const updateProfessor = useCallback(
        async (id: UUID, payload: UpdateProfessorPayload): Promise<Professor | null> => {
            const result = await api.patch<Professor>(`/professors/${id}`, payload);
            if (result.ok) {
                setProfessors((prev) =>
                    prev.map((p) => (p.id === id ? result.value : p))
                );
                return result.value;
            }
            setError(result.error.message);
            return null;
        },
        []
    );

    const deleteProfessor = useCallback(async (id: UUID): Promise<boolean> => {
        const result = await api.delete(`/professors/${id}`);
        if (result.ok) {
            setProfessors((prev) => prev.filter((p) => p.id !== id));
            return true;
        }
        setError(result.error.message);
        return false;
    }, []);

    const addOfficeHour = useCallback(
        async (professorId: UUID, payload: CreateOfficeHourPayload): Promise<boolean> => {
            const result = await api.post(
                `/professors/${professorId}/office-hours`,
                payload
            );
            if (result.ok) {
                await refresh();
                return true;
            }
            setError(result.error.message);
            return false;
        },
        [refresh]
    );

    const removeOfficeHour = useCallback(
        async (professorId: UUID, officeHourId: UUID): Promise<boolean> => {
            const result = await api.delete(
                `/professors/${professorId}/office-hours/${officeHourId}`
            );
            if (result.ok) {
                await refresh();
                return true;
            }
            setError(result.error.message);
            return false;
        },
        [refresh]
    );

    const scheduleTutoring = useCallback(
        async (payload: ScheduleTutoringPayload): Promise<TutoringSession | null> => {
            const result = await api.post<TutoringSession>("/tutoring", payload);
            if (result.ok) {
                setSessions((prev) => [result.value, ...prev]);
                return result.value;
            }
            setError(result.error.message);
            return null;
        },
        []
    );

    const cancelSession = useCallback(async (sessionId: UUID): Promise<boolean> => {
        const result = await api.patch<TutoringSession>(
            `/tutoring/${sessionId}/cancel`
        );
        if (result.ok) {
            setSessions((prev) =>
                prev.map((s) => (s.id === sessionId ? result.value : s))
            );
            return true;
        }
        setError(result.error.message);
        return false;
    }, []);

    const completeSession = useCallback(async (sessionId: UUID): Promise<boolean> => {
        const result = await api.patch<TutoringSession>(
            `/tutoring/${sessionId}/complete`
        );
        if (result.ok) {
            setSessions((prev) =>
                prev.map((s) => (s.id === sessionId ? result.value : s))
            );
            return true;
        }
        setError(result.error.message);
        return false;
    }, []);

    return {
        professors,
        sessions,
        loading,
        error,
        refresh,
        refreshSessions,
        createProfessor,
        updateProfessor,
        deleteProfessor,
        addOfficeHour,
        removeOfficeHour,
        scheduleTutoring,
        cancelSession,
        completeSession,
    };
}
