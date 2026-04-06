/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
/**
 * GradeFormModal Organism Component.
 *
 * Modal form for creating and editing grades.
 * Following Atomic Design — organism composed of molecules and atoms.
 */

"use client";

import { FormEvent, useState, useEffect } from "react";
import { Button } from "../atoms/Button";
import { XIcon } from "../atoms/Icon";
import type { Grade, EvaluationCriteria, TaskWithSubject } from "@/types";

// =============================================================================
// Types
// =============================================================================

export interface GradeFormData {
    criteria_id: string | null;
    task_id: string | null;
    score: number;
    max_score: number;
    notes: string;
}

export interface GradeFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: GradeFormData) => void;
    criteria: EvaluationCriteria[];
    tasks: TaskWithSubject[];
    initialData?: Partial<Grade>;
    loading?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const SELECT_CLASSES =
    "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const INPUT_CLASSES = SELECT_CLASSES; // Use the same base styles

// =============================================================================
// Helpers
// =============================================================================

function buildInitialForm(initialData?: Partial<Grade>): GradeFormData {
    return {
        criteria_id: initialData?.criteria_id ?? null,
        task_id: initialData?.task_id ?? null,
        score: initialData?.score ?? 0.0,
        max_score: initialData?.max_score ?? 5.0,
        notes: initialData?.notes ?? "",
    };
}

// =============================================================================
// Component
// =============================================================================

export function GradeFormModal({
    open,
    onClose,
    onSubmit,
    criteria,
    tasks,
    initialData,
    loading = false,
}: GradeFormModalProps) {
    const [formData, setFormData] = useState<GradeFormData>(
        buildInitialForm(initialData)
    );

    // Reinitialise when initialData changes (e.g. opening for edit)
    useEffect(() => {
        setFormData(buildInitialForm(initialData));
    }, [initialData]);

    if (!open) return null;

    const isEdit = Boolean(initialData?.id);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        onSubmit(formData);
    }

    function patch<K extends keyof GradeFormData>(key: K, value: GradeFormData[K]) {
        setFormData((prev) => ({ ...prev, [key]: value }));
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {isEdit ? "Editar Calificación" : "Registrar Calificación"}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <XIcon size="md" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        
                        {/* Criteria Selection */}
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Criterio de Evaluación
                            </label>
                            <select
                                value={formData.criteria_id ?? ""}
                                onChange={(e) =>
                                    patch("criteria_id", e.target.value || null)
                                }
                                className={SELECT_CLASSES}
                            >
                                <option value="">— Ninguno (Calificación libre) —</option>
                                {criteria.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.weight}%)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Task Linking */}
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tarea Vinculada <span className="text-gray-400 font-normal ml-1">(Opcional)</span>
                            </label>
                            <select
                                value={formData.task_id ?? ""}
                                onChange={(e) =>
                                    patch("task_id", e.target.value || null)
                                }
                                className={SELECT_CLASSES}
                            >
                                <option value="">— Seleccionar tarea previa —</option>
                                {tasks.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.title}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Permite llevar trazabilidad entre los exámenes/trabajos y la nota final.
                            </p>
                        </div>

                        {/* Score Inputs */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nota Obtenida
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max={formData.max_score}
                                    required
                                    value={formData.score}
                                    onChange={(e) =>
                                        patch("score", parseFloat(e.target.value) || 0)
                                    }
                                    className={INPUT_CLASSES}
                                    placeholder="Ej: 4.5"
                                />
                            </div>
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nota Máxima
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.1"
                                    required
                                    value={formData.max_score}
                                    onChange={(e) =>
                                        patch("max_score", parseFloat(e.target.value) || 5.0)
                                    }
                                    className={INPUT_CLASSES}
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Notas Adicionales
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => patch("notes", e.target.value)}
                                placeholder="Comentarios sobre la calificación..."
                                rows={2}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" loading={loading}>
                                {isEdit ? "Guardar Cambios" : "Guardar Calificación"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
