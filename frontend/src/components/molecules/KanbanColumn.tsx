/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
/**
 * KanbanColumn Molecule Component.
 *
 * Mockup reference: tasks_and_exams_manager_1 lines 105–175
 *
 * A single column in the Kanban board with status dot, count badge,
 * add button on header, and soft-bg card container.
 */

import { useState } from "react";
import { Badge } from "../atoms/Badge";
import { TaskCard } from "./TaskCard";
import type { TaskWithSubject, TaskStatus } from "@/types";
import type { BadgeVariant } from "../atoms/Badge";

// =============================================================================
// Types
// =============================================================================

export interface KanbanColumnProps {
    status: TaskStatus;
    tasks: TaskWithSubject[];
    onTaskClick: (task: TaskWithSubject) => void;
    onDrop: (taskId: string, newStatus: TaskStatus) => void;
    onAddTask: () => void;
}

// =============================================================================
// Column Metadata — Mockup-aligned
// =============================================================================

interface ColumnMeta {
    label: string;
    badgeVariant: BadgeVariant;
    emptyMessage: string;
    dotColor: string;
    dotGlow: string;
}

const COLUMN_META: Record<TaskStatus, ColumnMeta> = {
    TODO: {
        label: "To Do",
        badgeVariant: "default",
        emptyMessage: "No hay tareas pendientes",
        dotColor: "bg-gray-400",
        dotGlow: "dark:shadow-[0_0_6px_rgba(156,163,175,0.5)]",
    },
    IN_PROGRESS: {
        label: "In Progress",
        badgeVariant: "primary",
        emptyMessage: "Ninguna tarea en curso",
        dotColor: "bg-blue-500",
        dotGlow: "dark:shadow-[0_0_6px_rgba(59,130,246,0.5)]",
    },
    DONE: {
        label: "Done",
        badgeVariant: "success",
        emptyMessage: "Nada completado aún",
        dotColor: "bg-emerald-500",
        dotGlow: "dark:shadow-[0_0_6px_rgba(16,185,129,0.5)]",
    },
    ARCHIVED: {
        label: "Archived",
        badgeVariant: "warning",
        emptyMessage: "Sin tareas archivadas",
        dotColor: "bg-amber-500",
        dotGlow: "dark:shadow-[0_0_6px_rgba(245,158,11,0.5)]",
    },
};

// =============================================================================
// Component
// =============================================================================

export function KanbanColumn({
    status,
    tasks,
    onTaskClick,
    onDrop,
    onAddTask,
}: KanbanColumnProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const meta = COLUMN_META[status];

    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsDragOver(true);
    }

    function handleDragLeave() {
        setIsDragOver(false);
    }

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsDragOver(false);
        const taskId = e.dataTransfer.getData("task-id");
        if (taskId) {
            onDrop(taskId, status);
        }
    }

    return (
        <div
            className={`
                flex flex-col min-h-[500px] rounded-xl transition-all duration-200
                ${isDragOver
                    ? "bg-indigo-50/60 dark:bg-indigo-900/20 ring-2 ring-primary/30"
                    : "bg-[#e7ebf3]/50 dark:bg-slate-800/40"
                }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Column Header */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    {/* Status dot with glow in dark mode */}
                    <span className={`w-2 h-2 rounded-full ${meta.dotColor} ${meta.dotGlow}`} />
                    <span className="font-bold text-sm text-gray-800 dark:text-gray-100">
                        {meta.label}
                    </span>
                    <Badge variant={meta.badgeVariant} size="xs">
                        {tasks.length}
                    </Badge>
                </div>
                <button
                    onClick={onAddTask}
                    className="p-1 rounded-md text-gray-400 hover:text-primary hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                    aria-label={`Agregar tarea a ${meta.label}`}
                >
                    <span className="material-icons-round text-base">add</span>
                </button>
            </div>

            {/* Card List */}
            <div className="flex-1 flex flex-col gap-2.5 px-3 pb-3 overflow-y-auto custom-scrollbar">
                {tasks.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-sm text-gray-400 dark:text-gray-500 text-center px-4 py-8">
                            {meta.emptyMessage}
                        </p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData("task-id", task.id);
                            }}
                        >
                            <TaskCard
                                task={task}
                                onClick={() => onTaskClick(task)}
                                draggable={false}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
