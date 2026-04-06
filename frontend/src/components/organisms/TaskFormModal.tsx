/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
/**
 * TaskFormModal Organism Component.
 *
 * Modal form for creating and editing tasks.
 * Composes FormField molecule, Button atom, and native selects.
 * Following Atomic Design — organism composed of molecules and atoms.
 */

"use client";

import { FormEvent, useState, useEffect } from "react";
import { FormField } from "../molecules/FormField";
import { Button } from "../atoms/Button";
import { XIcon } from "../atoms/Icon";
import type { TaskPriority, TaskCategory, Subject, Task } from "@/types";

// =============================================================================
// Types
// =============================================================================

export interface TaskFormData {
    title: string;
    description: string;
    subject_id: string | null;
    due_date: string;
    priority: TaskPriority;
    category: TaskCategory;
}

export interface TaskFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: TaskFormData) => void;
    subjects: Subject[];
    initialData?: Partial<Task>;
    loading?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
    { value: "LOW", label: "Baja" },
    { value: "MEDIUM", label: "Media" },
    { value: "HIGH", label: "Alta" },
];

const CATEGORY_OPTIONS: { value: TaskCategory; label: string }[] = [
    { value: "TASK", label: "Tarea" },
    { value: "EXAM", label: "Examen" },
    { value: "PROJECT", label: "Proyecto" },
    { value: "READING", label: "Lectura" },
];

const SELECT_CLASSES =
    "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

// =============================================================================
// Helpers
// =============================================================================

function toDateInputValue(iso: string | null | undefined): string {
    if (!iso) return "";
    // Backend may return ISO datetime; slice to YYYY-MM-DD for <input type="date">
    return iso.slice(0, 10);
}

function buildInitialForm(initialData?: Partial<Task>): TaskFormData {
    return {
        title: initialData?.title ?? "",
        description: initialData?.description ?? "",
        subject_id: initialData?.subject_id ?? null,
        due_date: toDateInputValue(initialData?.due_date),
        priority: initialData?.priority ?? "MEDIUM",
        category: initialData?.category ?? "TASK",
    };
}

// =============================================================================
// Component
// =============================================================================

export function TaskFormModal({
    open,
    onClose,
    onSubmit,
    subjects,
    initialData,
    loading = false,
}: TaskFormModalProps) {
    const [formData, setFormData] = useState<TaskFormData>(
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

    function patch<K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) {
        setFormData((prev) => ({ ...prev, [key]: value }));
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {isEdit ? "Editar Tarea" : "Nueva Tarea"}
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
                        {/* Title */}
                        <FormField
                            label="Título"
                            value={formData.title}
                            onChange={(e) => patch("title", e.target.value)}
                            placeholder="Ej: Entregar informe de laboratorio"
                            required
                        />

                        {/* Description */}
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Descripción
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) =>
                                    patch("description", e.target.value)
                                }
                                placeholder="Detalles opcionales sobre esta tarea…"
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                        </div>

                        {/* Subject */}
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Materia
                            </label>
                            <select
                                value={formData.subject_id ?? ""}
                                onChange={(e) =>
                                    patch(
                                        "subject_id",
                                        e.target.value || null
                                    )
                                }
                                className={SELECT_CLASSES}
                            >
                                <option value="">— Sin materia —</option>
                                {subjects.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Due Date + Priority row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Due date */}
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Fecha límite
                                </label>
                                <input
                                    type="date"
                                    value={formData.due_date}
                                    onChange={(e) =>
                                        patch("due_date", e.target.value)
                                    }
                                    className={SELECT_CLASSES}
                                />
                            </div>

                            {/* Priority */}
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Prioridad
                                </label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) =>
                                        patch(
                                            "priority",
                                            e.target.value as TaskPriority
                                        )
                                    }
                                    className={SELECT_CLASSES}
                                >
                                    {PRIORITY_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Category */}
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Categoría
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) =>
                                    patch(
                                        "category",
                                        e.target.value as TaskCategory
                                    )
                                }
                                className={SELECT_CLASSES}
                            >
                                {CATEGORY_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
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
                                {isEdit ? "Guardar Cambios" : "Crear Tarea"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
