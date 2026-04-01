/**
 * KanbanColumn Molecule Component.
 *
 * A single column in the Kanban board, grouping tasks by status.
 * Composes atoms (Badge, Button, PlusIcon) and the TaskCard molecule.
 * Handles HTML5 drag-and-drop for status transitions.
 *
 * Following Atomic Design — molecules compose only atoms.
 * Drag target logic is passed up to the KanbanBoard organism.
 */

import { useState } from "react";
import { Badge } from "../atoms/Badge";
import { Button } from "../atoms/Button";
import { PlusIcon } from "../atoms/Icon";
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
// Column Metadata
// =============================================================================

interface ColumnMeta {
    label: string;
    badgeVariant: BadgeVariant;
    emptyMessage: string;
}

const COLUMN_META: Record<TaskStatus, ColumnMeta> = {
    TODO: {
        label: "Por Hacer",
        badgeVariant: "default",
        emptyMessage: "No hay tareas pendientes",
    },
    IN_PROGRESS: {
        label: "En Progreso",
        badgeVariant: "info",
        emptyMessage: "Ninguna tarea en curso",
    },
    DONE: {
        label: "Hecho",
        badgeVariant: "success",
        emptyMessage: "Nada completado aún",
    },
    ARCHIVED: {
        label: "Archivado",
        badgeVariant: "warning",
        emptyMessage: "Sin tareas archivadas",
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
            className={`flex flex-col min-h-[500px] rounded-xl border-2 transition-colors ${
                isDragOver
                    ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Column Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                        {meta.label}
                    </span>
                    <Badge variant={meta.badgeVariant} size="sm">
                        {tasks.length}
                    </Badge>
                </div>
            </div>

            {/* Card List */}
            <div className="flex-1 flex flex-col gap-3 p-3 overflow-y-auto">
                {tasks.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-sm text-gray-400 dark:text-gray-500 text-center px-4">
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
                                draggable={false} // outer div handles drag
                            />
                        </div>
                    ))
                )}
            </div>

            {/* Add Task Button — only on TODO */}
            {status === "TODO" && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center"
                        onClick={onAddTask}
                    >
                        <PlusIcon size="sm" />
                        <span className="ml-1 text-sm">Agregar Tarea</span>
                    </Button>
                </div>
            )}
        </div>
    );
}
