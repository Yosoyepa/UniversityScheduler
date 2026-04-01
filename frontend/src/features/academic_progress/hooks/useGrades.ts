/**
 * useGrades Hook.
 *
 * Custom hook for Academic Progress state and API interactions.
 * Handles CRUD operations for Grades and Evaluation Criteria.
 *
 * Mirrors the useTasks.ts pattern:
 * - Uses `api` client from @/lib
 * - Returns typed state + action functions
 * - All mutations return Promise<boolean> for caller feedback
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api-client";
import type { Grade, EvaluationCriteria, SubjectAverage, TaskWithSubject } from "@/types";
import type { GradeFormData } from "@/components/organisms/GradeFormModal";
import type { EvaluationCriteriaFormData } from "@/components/organisms/EvaluationCriteriaForm";

// =============================================================================
// Types
// =============================================================================

interface GradesState {
    grades: Grade[];
    criteria: EvaluationCriteria[];
    tasks: TaskWithSubject[];
    average: SubjectAverage | null;
    loading: boolean;
    error: string | null;
}

export interface UseGradesReturn extends GradesState {
    createGrade: (data: GradeFormData, subjectId: string) => Promise<boolean>;
    updateGrade: (gradeId: string, data: Partial<GradeFormData>) => Promise<boolean>;
    deleteGrade: (gradeId: string) => Promise<boolean>;
    
    createCriteria: (data: EvaluationCriteriaFormData, subjectId: string) => Promise<boolean>;
    deleteCriteria: (criteriaId: string) => Promise<boolean>;
    
    refreshData: () => Promise<void>;
    submitting: boolean;
}

// =============================================================================
// Hook
// =============================================================================

export function useGrades(activeSubjectId: string | null): UseGradesReturn {
    const [state, setState] = useState<GradesState>({
        grades: [],
        criteria: [],
        tasks: [],
        average: null,
        loading: true,
        error: null,
    });
    const [submitting, setSubmitting] = useState(false);

    /**
     * Fetch all relevant data for the active subject.
     */
    const refreshData = useCallback(async () => {
        if (!activeSubjectId) {
            setState(prev => ({ ...prev, loading: false }));
            return;
        }

        setState(prev => ({ ...prev, loading: true, error: null }));

        // 1. Fetch grades for subject
        const gradesResult = await api.get<Grade[]>("/grades", { subject_id: activeSubjectId });
        
        // 2. Fetch criteria for subject
        const criteriaResult = await api.get<EvaluationCriteria[]>("/evaluation-criteria", { subject_id: activeSubjectId });
        
        // 3. Fetch tasks for subject (to link exam/project to grade)
        const tasksResult = await api.get<TaskWithSubject[]>("/tasks");

        // 4. Fetch subject average
        const averageResult = await api.get<SubjectAverage>(`/grades/subjects/${activeSubjectId}/average`);

        if (!gradesResult.ok || !criteriaResult.ok || !averageResult.ok) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: "Failed to load academic progress data.",
            }));
            return;
        }

        // Filter tasks that belong to this subject
        const subjectTasks = (tasksResult.value || []).filter(t => t.subject_id === activeSubjectId);

        setState({
            grades: gradesResult.value ?? [],
            criteria: criteriaResult.value ?? [],
            tasks: subjectTasks,
            average: averageResult.value ?? null,
            loading: false,
            error: null,
        });
    }, [activeSubjectId]);

    /**
     * Create a new Grade via POST /grades
     */
    const createGrade = useCallback(
        async (data: GradeFormData, subjectId: string): Promise<boolean> => {
            setSubmitting(true);

            const result = await api.post<Grade>("/grades", {
                subject_id: subjectId,
                criteria_id: data.criteria_id,
                task_id: data.task_id,
                score: data.score,
                max_score: data.max_score,
                notes: data.notes || null,
                graded_at: new Date().toISOString(),
            });

            setSubmitting(false);

            if (result.ok) {
                await refreshData();
                return true;
            }

            setState((prev) => ({ ...prev, error: result.error.message }));
            return false;
        },
        [refreshData]
    );

    /**
     * Update a Grade via PATCH /grades/:id
     */
    const updateGrade = useCallback(
        async (gradeId: string, data: Partial<GradeFormData>): Promise<boolean> => {
            setSubmitting(true);

            const result = await api.patch<Grade>(`/grades/${gradeId}`, {
                score: data.score,
                notes: data.notes || null,
            });

            setSubmitting(false);

            if (result.ok) {
                await refreshData();
                return true;
            }

            setState((prev) => ({ ...prev, error: result.error.message }));
            return false;
        },
        [refreshData]
    );

    /**
     * Delete a Grade via DELETE /grades/:id
     */
    const deleteGrade = useCallback(
        async (gradeId: string): Promise<boolean> => {
            const result = await api.delete(`/grades/${gradeId}`);

            if (result.ok) {
                await refreshData();
                return true;
            }

            setState((prev) => ({ ...prev, error: result.error.message }));
            return false;
        },
        [refreshData]
    );

    /**
     * Create Evaluation Criteria via POST /evaluation-criteria
     */
    const createCriteria = useCallback(
        async (data: EvaluationCriteriaFormData, subjectId: string): Promise<boolean> => {
            setSubmitting(true);

            const result = await api.post<EvaluationCriteria>("/evaluation-criteria", {
                subject_id: subjectId,
                name: data.name,
                weight: data.weight,
            });

            setSubmitting(false);

            if (result.ok) {
                await refreshData();
                return true;
            }

            setState((prev) => ({ ...prev, error: result.error.message }));
            return false;
        },
        [refreshData]
    );

    /**
     * Delete Evaluation Criteria via DELETE /evaluation-criteria/:id
     */
    const deleteCriteria = useCallback(
        async (criteriaId: string): Promise<boolean> => {
            const result = await api.delete(`/evaluation-criteria/${criteriaId}`);

            if (result.ok) {
                await refreshData();
                return true;
            }

            setState((prev) => ({ ...prev, error: result.error.message }));
            return false;
        },
        [refreshData]
    );

    // Load data on mount / subject change
    useEffect(() => {
        (async () => {
            await refreshData();
        })();
    }, [refreshData, activeSubjectId]);

    return {
        ...state,
        createGrade,
        updateGrade,
        deleteGrade,
        createCriteria,
        deleteCriteria,
        refreshData,
        submitting,
    };
}
