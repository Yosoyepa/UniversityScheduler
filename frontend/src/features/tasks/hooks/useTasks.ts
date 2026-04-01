/**
 * useTasks Hook.
 *
 * Custom hook for Task Management state and API interactions.
 * Handles CRUD operations and optimistic status transitions.
 *
 * Mirrors the useSchedule.ts pattern:
 * - Uses `api` client from @/lib
 * - Returns typed state + action functions
 * - All mutations return Promise<boolean> for caller feedback
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api-client";
import type { TaskWithSubject, TaskStatus, Subject, Semester } from "@/types";
import type { TaskFormData } from "@/components/organisms/TaskFormModal";

// =============================================================================
// Types
// =============================================================================

interface TasksState {
    tasks: TaskWithSubject[];
    subjects: Subject[];
    loading: boolean;
    error: string | null;
}

export interface UseTasksReturn extends TasksState {
    createTask: (data: TaskFormData) => Promise<boolean>;
    updateTask: (taskId: string, data: Partial<TaskFormData>) => Promise<boolean>;
    updateStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
    deleteTask: (taskId: string) => Promise<boolean>;
    refreshTasks: () => Promise<void>;
    submitting: boolean;
}

// =============================================================================
// API Response Shape (from backend TaskResponse schema)
// =============================================================================

interface TaskResponse {
    id: string;
    user_id: string;
    subject_id: string | null;
    title: string;
    description: string | null;
    due_date: string | null;
    status: TaskStatus;
    priority: string;
    category: string;
    is_synced_gcal: boolean;
    gcal_event_id: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}

interface SubjectWithSessions extends Subject {
    class_sessions: unknown[];
}

// =============================================================================
// Hook
// =============================================================================

export function useTasks(): UseTasksReturn {
    const [state, setState] = useState<TasksState>({
        tasks: [],
        subjects: [],
        loading: true,
        error: null,
    });
    const [submitting, setSubmitting] = useState(false);

    /**
     * Fetch all tasks for the current user and available subjects.
     * Subjects are loaded from the active semester so that the form
     * can offer a subject dropdown.
     */
    const refreshTasks = useCallback(async () => {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        // Fetch tasks
        const tasksResult = await api.get<TaskResponse[]>("/tasks");

        if (!tasksResult.ok) {
            setState((prev) => ({
                ...prev,
                loading: false,
                error: tasksResult.error.message,
            }));
            return;
        }

        // Fetch subjects for the active semester (to enrich tasks + populate form)
        let subjects: Subject[] = [];
        const semesterResult = await api.get<Semester[]>("/semesters", {
            is_active: true,
        });

        if (semesterResult.ok && semesterResult.value?.[0]) {
            const activeSemId = semesterResult.value[0].id;
            const subjectsResult = await api.get<SubjectWithSessions[]>(
                "/subjects",
                { semester_id: activeSemId }
            );
            if (subjectsResult.ok) {
                subjects = subjectsResult.value ?? [];
            }
        }

        // Enrich tasks with subject info
        const subjectMap = new Map(subjects.map((s) => [s.id, s]));
        const enrichedTasks: TaskWithSubject[] = (tasksResult.value ?? []).map(
            (t) => {
                const subj = t.subject_id ? subjectMap.get(t.subject_id) : undefined;
                return {
                    ...t,
                    description: t.description,
                    due_date: t.due_date,
                    is_synced_gcal: t.is_synced_gcal,
                    gcal_event_id: t.gcal_event_id,
                    completed_at: t.completed_at,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    priority: t.priority as any,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    category: t.category as any,
                    subject: subj
                        ? { id: subj.id, name: subj.name, color: subj.color }
                        : null,
                };
            }
        );

        setState({
            tasks: enrichedTasks,
            subjects,
            loading: false,
            error: null,
        });
    }, []);

    /**
     * Create a new task via POST /tasks.
     */
    const createTask = useCallback(
        async (data: TaskFormData): Promise<boolean> => {
            setSubmitting(true);

            const body = {
                title: data.title,
                description: data.description || null,
                subject_id: data.subject_id || null,
                due_date: data.due_date
                    ? new Date(data.due_date).toISOString()
                    : null,
                priority: data.priority,
                category: data.category,
            };

            const result = await api.post<TaskResponse>("/tasks", body);
            setSubmitting(false);

            if (result.ok) {
                await refreshTasks();
                return true;
            }

            setState((prev) => ({ ...prev, error: result.error.message }));
            return false;
        },
        [refreshTasks]
    );

    /**
     * Update task fields via PATCH /tasks/:id.
     */
    const updateTask = useCallback(
        async (taskId: string, data: Partial<TaskFormData>): Promise<boolean> => {
            setSubmitting(true);

            const body: Record<string, unknown> = {};
            if (data.title !== undefined) body.title = data.title;
            if (data.description !== undefined)
                body.description = data.description || null;
            if (data.subject_id !== undefined)
                body.subject_id = data.subject_id || null;
            if (data.due_date !== undefined)
                body.due_date = data.due_date
                    ? new Date(data.due_date).toISOString()
                    : null;
            if (data.priority !== undefined) body.priority = data.priority;
            if (data.category !== undefined) body.category = data.category;

            const result = await api.patch<TaskResponse>(
                `/tasks/${taskId}`,
                body
            );
            setSubmitting(false);

            if (result.ok) {
                await refreshTasks();
                return true;
            }

            setState((prev) => ({ ...prev, error: result.error.message }));
            return false;
        },
        [refreshTasks]
    );

    /**
     * Transition a task to a new status via PATCH /tasks/:id/status.
     * Optimistic update: immediately reflects in UI, rolls back on error.
     */
    const updateStatus = useCallback(
        async (taskId: string, newStatus: TaskStatus): Promise<void> => {
            // Optimistic update
            setState((prev) => ({
                ...prev,
                tasks: prev.tasks.map((t) =>
                    t.id === taskId ? { ...t, status: newStatus } : t
                ),
            }));

            const result = await api.patch<TaskResponse>(
                `/tasks/${taskId}/status`,
                { status: newStatus }
            );

            if (!result.ok) {
                // Rollback
                await refreshTasks();
                setState((prev) => ({
                    ...prev,
                    error: result.error.message,
                }));
            }
        },
        [refreshTasks]
    );

    /**
     * Delete a task via DELETE /tasks/:id.
     */
    const deleteTask = useCallback(
        async (taskId: string): Promise<boolean> => {
            const result = await api.delete(`/tasks/${taskId}`);

            if (result.ok) {
                await refreshTasks();
                return true;
            }

            setState((prev) => ({ ...prev, error: result.error.message }));
            return false;
        },
        [refreshTasks]
    );

    // Load tasks on mount
    useEffect(() => {
        (async () => {
            await refreshTasks();
        })();
    }, [refreshTasks]);

    return {
        ...state,
        createTask,
        updateTask,
        updateStatus,
        deleteTask,
        refreshTasks,
        submitting,
    };
}
