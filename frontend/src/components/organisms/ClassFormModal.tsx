/**
 * ClassFormModal Organism Component.
 *
 * Modal form for creating/editing subjects and class sessions.
 * Following Atomic Design - organism composed of molecules (FormField)
 * and atoms (Button, Badge).
 */

"use client";

import { FormEvent, useState } from "react";
import { FormField } from "../molecules/FormField";
import { Button } from "../atoms/Button";
import { XIcon, PlusIcon } from "../atoms/Icon";
import type {
    DifficultyLevel,
    SubjectType,
    DayOfWeek,
    HexColor,
} from "@/types";

// =============================================================================
// Types
// =============================================================================

export interface ClassSessionFormData {
    day_of_week: DayOfWeek;
    start_time: string;
    end_time: string;
    classroom: string;
}

export interface SubjectFormData {
    name: string;
    credits: number;
    difficulty: DifficultyLevel;
    subject_type: SubjectType;
    professor_name: string;
    color: HexColor;
    sessions: ClassSessionFormData[];
}

export interface ClassFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: SubjectFormData) => void;
    initialData?: Partial<SubjectFormData>;
    loading?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string }[] = [
    { value: "EASY", label: "Fácil" },
    { value: "MEDIUM", label: "Media" },
    { value: "HARD", label: "Difícil" },
];

const SUBJECT_TYPE_OPTIONS: { value: SubjectType; label: string }[] = [
    { value: "DISCIPLINAR_OBLIGATORIA", label: "Disciplinar Obligatoria" },
    { value: "DISCIPLINAR_OPTATIVA", label: "Disciplinar Optativa" },
    { value: "FUNDAMENTAL_OBLIGATORIA", label: "Fundamental Obligatoria" },
    { value: "FUNDAMENTAL_OPTATIVA", label: "Fundamental Optativa" },
    { value: "LIBRE_ELECCION", label: "Libre Elección" },
    { value: "TRABAJO_DE_GRADO", label: "Trabajo de Grado" },
];

const DAY_OPTIONS: { value: DayOfWeek; label: string }[] = [
    { value: 1, label: "Lunes" },
    { value: 2, label: "Martes" },
    { value: 3, label: "Miércoles" },
    { value: 4, label: "Jueves" },
    { value: 5, label: "Viernes" },
    { value: 6, label: "Sábado" },
];

const DEFAULT_COLORS: HexColor[] = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#F97316",
];

const EMPTY_SESSION: ClassSessionFormData = {
    day_of_week: 1,
    start_time: "08:00",
    end_time: "10:00",
    classroom: "",
};

// =============================================================================
// Component
// =============================================================================

export function ClassFormModal({
    open,
    onClose,
    onSubmit,
    initialData,
    loading = false,
}: ClassFormModalProps) {
    const [formData, setFormData] = useState<SubjectFormData>({
        name: initialData?.name || "",
        credits: initialData?.credits || 3,
        difficulty: initialData?.difficulty || "MEDIUM",
        subject_type: initialData?.subject_type || "DISCIPLINAR_OBLIGATORIA",
        professor_name: initialData?.professor_name || "",
        color: initialData?.color || DEFAULT_COLORS[0],
        sessions: initialData?.sessions || [{ ...EMPTY_SESSION }],
    });

    if (!open) return null;

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        onSubmit(formData);
    }

    function addSession() {
        setFormData((prev) => ({
            ...prev,
            sessions: [...prev.sessions, { ...EMPTY_SESSION }],
        }));
    }

    function removeSession(index: number) {
        setFormData((prev) => ({
            ...prev,
            sessions: prev.sessions.filter((_, i) => i !== index),
        }));
    }

    function updateSession(
        index: number,
        field: keyof ClassSessionFormData,
        value: string | number
    ) {
        setFormData((prev) => ({
            ...prev,
            sessions: prev.sessions.map((s, i) =>
                i === index ? { ...s, [field]: value } : s
            ),
        }));
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {initialData?.name
                                ? "Editar Materia"
                                : "Nueva Materia"}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <XIcon size="md" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Subject info row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                label="Nombre de la materia"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                placeholder="Ej: Cálculo Diferencial"
                                required
                            />
                            <FormField
                                label="Profesor"
                                value={formData.professor_name}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        professor_name: e.target.value,
                                    }))
                                }
                                placeholder="Ej: Dr. García"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                label="Créditos"
                                type="number"
                                min={1}
                                max={20}
                                value={formData.credits}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        credits: parseInt(e.target.value) || 1,
                                    }))
                                }
                                required
                            />

                            {/* Difficulty select */}
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Dificultad
                                </label>
                                <select
                                    value={formData.difficulty}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            difficulty: e.target
                                                .value as DifficultyLevel,
                                        }))
                                    }
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                >
                                    {DIFFICULTY_OPTIONS.map((opt) => (
                                        <option
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Subject type select */}
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tipo
                                </label>
                                <select
                                    value={formData.subject_type}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            subject_type: e.target
                                                .value as SubjectType,
                                        }))
                                    }
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                >
                                    {SUBJECT_TYPE_OPTIONS.map((opt) => (
                                        <option
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Color picker */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Color
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {DEFAULT_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                color,
                                            }))
                                        }
                                        className={`w-8 h-8 rounded-full border-2 transition-transform ${
                                            formData.color === color
                                                ? "border-gray-900 dark:border-white scale-110"
                                                : "border-transparent hover:scale-105"
                                        }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Sessions */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Horarios de clase
                                </label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={addSession}
                                >
                                    <PlusIcon size="sm" />
                                    <span className="ml-1">Agregar</span>
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {formData.sessions.map((session, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-end bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg"
                                    >
                                        {/* Day select */}
                                        <div>
                                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                Día
                                            </label>
                                            <select
                                                value={session.day_of_week}
                                                onChange={(e) =>
                                                    updateSession(
                                                        index,
                                                        "day_of_week",
                                                        parseInt(e.target.value)
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
                                            >
                                                {DAY_OPTIONS.map((opt) => (
                                                    <option
                                                        key={opt.value}
                                                        value={opt.value}
                                                    >
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Start time */}
                                        <div>
                                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                Inicio
                                            </label>
                                            <input
                                                type="time"
                                                value={session.start_time}
                                                onChange={(e) =>
                                                    updateSession(
                                                        index,
                                                        "start_time",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        {/* End time */}
                                        <div>
                                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                Fin
                                            </label>
                                            <input
                                                type="time"
                                                value={session.end_time}
                                                onChange={(e) =>
                                                    updateSession(
                                                        index,
                                                        "end_time",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        {/* Location */}
                                        <div>
                                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                Salón
                                            </label>
                                            <input
                                                type="text"
                                                value={session.classroom}
                                                onChange={(e) =>
                                                    updateSession(
                                                        index,
                                                        "classroom",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Ej: 301-B"
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        {/* Remove button */}
                                        {formData.sessions.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeSession(index)
                                                }
                                                className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                <XIcon size="sm" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" loading={loading}>
                                {initialData?.name ? "Guardar" : "Crear Materia"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
