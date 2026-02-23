/**
 * TaskCard Molecule Component.
 *
 * Card displaying task information for Kanban board.
 * Following Atomic Design - molecule composed of atoms.
 */

import { Badge, BadgeVariant } from "../atoms/Badge";
import { CalendarIcon } from "../atoms/Icon";
import type { TaskWithSubject, TaskPriority, TaskCategory } from "@/types";

// =============================================================================
// Types
// =============================================================================

export interface TaskCardProps {
    task: TaskWithSubject;
    onClick?: () => void;
    draggable?: boolean;
}

// =============================================================================
// Helpers
// =============================================================================

const priorityVariant: Record<TaskPriority, BadgeVariant> = {
    LOW: "default",
    MEDIUM: "warning",
    HIGH: "danger",
};

const categoryLabels: Record<TaskCategory, string> = {
    TASK: "Tarea",
    EXAM: "Examen",
    PROJECT: "Proyecto",
    READING: "Lectura",
};

function formatDueDate(date: string | null): string | null {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString("es-CO", {
        month: "short",
        day: "numeric",
    });
}

function isOverdue(date: string | null): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
}

// =============================================================================
// Component
// =============================================================================

export function TaskCard({ task, onClick, draggable = false }: TaskCardProps) {
    const overdue = task.status !== "DONE" && isOverdue(task.due_date);

    return (
        <div
            className={`
        p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
        hover:shadow-md transition-shadow cursor-pointer
        ${draggable ? "cursor-grab active:cursor-grabbing" : ""}
      `}
            onClick={onClick}
            draggable={draggable}
        >
            {/* Subject color indicator */}
            {task.subject && (
                <div
                    className="w-full h-1 rounded-full mb-3"
                    style={{ backgroundColor: task.subject.color }}
                />
            )}

            {/* Title */}
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                {task.title}
            </h4>

            {/* Subject name */}
            {task.subject && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {task.subject.name}
                </p>
            )}

            {/* Badges row */}
            <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant={priorityVariant[task.priority]} size="sm">
                    {task.priority}
                </Badge>
                <Badge variant="info" size="sm">
                    {categoryLabels[task.category]}
                </Badge>
            </div>

            {/* Due date */}
            {task.due_date && (
                <div
                    className={`
            flex items-center gap-1 text-sm
            ${overdue ? "text-red-500" : "text-gray-500 dark:text-gray-400"}
          `}
                >
                    <CalendarIcon size="sm" />
                    <span>{formatDueDate(task.due_date)}</span>
                    {overdue && <span className="font-medium">(Vencido)</span>}
                </div>
            )}
        </div>
    );
}
