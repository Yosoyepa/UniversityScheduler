/**
 * useSchedule Hook.
 *
 * Custom hook for managing schedule state and API interactions.
 * Handles fetching subjects, sessions, and creating new subjects.
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api-client";
import type {
    Subject,
    ClassSession,
    ClassSessionWithSubject,
    Semester,
} from "@/types";
import type { SubjectFormData } from "@/components/organisms/ClassFormModal";

// =============================================================================
// Types
// =============================================================================

interface ScheduleState {
    sessions: ClassSessionWithSubject[];
    subjects: Subject[];
    activeSemester: Semester | null;
    loading: boolean;
    error: string | null;
}

interface UseScheduleReturn extends ScheduleState {
    createSubject: (data: SubjectFormData) => Promise<boolean>;
    updateSubject: (id: string, data: SubjectFormData) => Promise<boolean>;
    deleteSubject: (subjectId: string) => Promise<boolean>;
    createSemester: (data: { name: string; start_date: string; end_date: string }) => Promise<boolean>;
    refreshSchedule: () => Promise<void>;
    creating: boolean;
}

// =============================================================================
// API Response Types
// =============================================================================

interface SubjectWithSessions extends Subject {
    class_sessions: ClassSession[];
}

// =============================================================================
// Hook
// =============================================================================

export function useSchedule(): UseScheduleReturn {
    const [state, setState] = useState<ScheduleState>({
        sessions: [],
        subjects: [],
        activeSemester: null,
        loading: true,
        error: null,
    });
    const [creating, setCreating] = useState(false);

    /**
     * Fetch active semester and its subjects with sessions.
     */
    const refreshSchedule = useCallback(async () => {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        // 1. Get active semester
        const semesterResult = await api.get<Semester | null>("/semesters/active");

        if (!semesterResult.ok) {
            setState((prev) => ({
                ...prev,
                loading: false,
                error: semesterResult.error.message,
            }));
            return;
        }

        const activeSemester = semesterResult.value;

        if (!activeSemester) {
            setState({
                sessions: [],
                subjects: [],
                activeSemester: null,
                loading: false,
                error: null,
            });
            return;
        }

        // 2. Get subjects for the active semester
        const subjectsResult = await api.get<SubjectWithSessions[]>(
            "/subjects",
            { semester_id: activeSemester.id }
        );

        if (!subjectsResult.ok) {
            setState((prev) => ({
                ...prev,
                activeSemester,
                loading: false,
                error: subjectsResult.error.message,
            }));
            return;
        }

        // 3. Flatten sessions with subject info for the grid
        const subjects = subjectsResult.value || [];
        const sessions: ClassSessionWithSubject[] = subjects.flatMap(
            (subject) =>
                (subject.class_sessions || []).map((session) => ({
                    ...session,
                    subject: subject,
                }))
        );

        setState({
            sessions,
            subjects,
            activeSemester,
            loading: false,
            error: null,
        });
    }, []);

    /**
     * Create a new subject with class sessions.
     */
    const createSubject = useCallback(
        async (data: SubjectFormData): Promise<boolean> => {
            if (!state.activeSemester) return false;

            setCreating(true);

            const body = {
                name: data.name,
                credits: data.credits,
                difficulty: data.difficulty,
                subject_type: data.subject_type,
                professor_id: null,  // Set via directory module if needed
                color: data.color,
                semester_id: state.activeSemester.id,
                class_sessions: data.sessions.map((s) => ({
                    day_of_week: s.day_of_week,
                    start_time: s.start_time + ":00",
                    end_time: s.end_time + ":00",
                    classroom: s.classroom || null,
                })),
            };

            const result = await api.post<Subject>("/subjects", body);
            setCreating(false);

            if (result.ok) {
                await refreshSchedule();
                return true;
            }

            setState((prev) => ({
                ...prev,
                error: result.error.message,
            }));
            return false;
        },
        [state.activeSemester, refreshSchedule]
    );

    const updateSubject = useCallback(
        async (id: string, data: SubjectFormData) => {
            if (!state.activeSemester) return false;

            setCreating(true);
            setState((prev) => ({ ...prev, error: null }));

            // 1. Update basic subject details
            const subjectBody = {
                name: data.name,
                credits: data.credits,
                difficulty: data.difficulty,
                subject_type: data.subject_type,
                professor_id: null,  // Updated separately via directory module
                color: data.color,
            };

            const result = await api.patch<Subject>(`/subjects/${id}`, subjectBody);
            
            if (!result.ok) {
                setState((prev) => ({ ...prev, error: result.error.message }));
                setCreating(false);
                return false;
            }

            // 2. Diff and sync sessions
            const subject = result.value as any;
            if (subject && subject.class_sessions) {
                const existingSessionIds = subject.class_sessions.map((s: any) => s.id);
                const formDataSessionIds = data.sessions.filter((s: any) => s.id).map((s: any) => s.id);
                
                // Sessions to delete
                const toDelete = existingSessionIds.filter((id: string) => !formDataSessionIds.includes(id));
                for (const delId of toDelete) {
                    await api.delete(`/sessions/${delId}`);
                }

                // Sessions to update or create
                for (const session of data.sessions) {
                    const sessionBody = {
                        day_of_week: session.day_of_week,
                        start_time: session.start_time + (session.start_time.length === 5 ? ":00" : ""),
                        end_time: session.end_time + (session.end_time.length === 5 ? ":00" : ""),
                        classroom: session.classroom || null,
                    };

                    if (session.id) {
                        // Update existing
                        await api.patch(`/sessions/${session.id}`, sessionBody);
                    } else {
                        // Create new
                        await api.post(`/subjects/${id}/sessions`, sessionBody);
                    }
                }
            }

            setCreating(false);
            await refreshSchedule();
            return true;
        },
        [state.activeSemester, refreshSchedule]
    );

    /**
     * Delete a subject.
     */
    const deleteSubject = useCallback(
        async (subjectId: string): Promise<boolean> => {
            const result = await api.delete(`/subjects/${subjectId}`);

            if (result.ok) {
                await refreshSchedule();
                return true;
            }

            setState((prev) => ({
                ...prev,
                error: result.error.message,
            }));
            return false;
        },
        [refreshSchedule]
    );

    /**
     * Create a new semester and automatically activate it.
     */
    const createSemester = useCallback(
        async (data: { name: string; start_date: string; end_date: string }): Promise<boolean> => {
            setCreating(true);

            // 1. Create the semester
            const result = await api.post<Semester>("/semesters", data);

            if (!result.ok) {
                setCreating(false);
                setState((prev) => ({ ...prev, error: result.error.message }));
                return false;
            }

            // 2. Activate the semester
            const activateResult = await api.post<Semester>(`/semesters/${result.value!.id}/activate`, {});
            
            setCreating(false);

            if (activateResult.ok) {
                await refreshSchedule();
                return true;
            }

            setState((prev) => ({ ...prev, error: activateResult.error.message }));
            return false;
        },
        [refreshSchedule]
    );

    // Load schedule on mount
    useEffect(() => {
        (async () => {
            await refreshSchedule();
        })();
    }, [refreshSchedule]);

    return {
        ...state,
        createSubject,
        updateSubject,
        deleteSubject,
        createSemester,
        refreshSchedule,
        creating,
    };
}
