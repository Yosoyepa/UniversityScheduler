/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
/**
 * TaskCard Molecule Component.
 *
 * Mockup reference: tasks_and_exams_manager_1 lines 127–162
 *
 * Card displaying task information for Kanban board.
 * Features type/priority badges at top, hover border transition,
 * subject chip, and context menu on hover.
 */

import { Badge, BadgeVariant } from "../atoms/Badge";
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

const priorityLabels: Record<TaskPriority, string> = {
    LOW: "Low",
    MEDIUM: "Med",
    HIGH: "High",
};

const categoryLabels: Record<TaskCategory, string> = {
    TASK: "Task",
    EXAM: "Exam",
    PROJECT: "Project",
    READING: "Reading",
};

const categoryVariant: Record<TaskCategory, BadgeVariant> = {
    TASK: "primary",
    EXAM: "danger",
    PROJECT: "success",
    READING: "info",
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
    const isDone = task.status === "DONE";

    return (
        <div
            className={`
                group relative p-4 bg-white dark:bg-gray-800 rounded-xl
                border border-gray-200 dark:border-gray-700
                hover:border-primary/20 hover:shadow-md dark:hover:border-indigo-500/30
                transition-all duration-200 cursor-pointer
                ${draggable ? "cursor-grab active:cursor-grabbing" : ""}
                ${isDone ? "opacity-60" : ""}
            `}
            onClick={onClick}
            draggable={draggable}
        >
            {/* Badges row — top */}
            <div className="flex items-center gap-1.5 mb-2.5">
                <Badge variant={categoryVariant[task.category]} size="xs">
                    {categoryLabels[task.category]}
                </Badge>
                <Badge variant={priorityVariant[task.priority]} size="xs">
                    {priorityLabels[task.priority]}
                </Badge>

                {/* Context menu — visible on hover */}
                <button
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={(e) => { e.stopPropagation(); }}
                    aria-label="Más opciones"
                >
                    <span className="material-icons-round text-base text-gray-400">more_horiz</span>
                </button>
            </div>

            {/* Title */}
            <h4 className={`font-semibold text-sm text-gray-900 dark:text-white mb-1 line-clamp-2 leading-snug ${isDone ? "line-through" : ""}`}>
                {task.title}
            </h4>

            {/* Description snippet */}
            {task.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                    {task.description}
                </p>
            )}

            {/* Bottom row — due date + subject chip */}
            <div className="flex items-center justify-between mt-auto pt-2">
                {/* Due date */}
                {task.due_date ? (
                    <div
                        className={`flex items-center gap-1 text-xs font-medium ${
                            overdue
                                ? "text-red-500 dark:text-red-400"
                                : "text-gray-500 dark:text-gray-400"
                        }`}
                    >
                        <span className={`material-icons-round text-sm ${overdue ? "text-red-400" : ""}`}>
                            {overdue ? "warning" : "schedule"}
                        </span>
                        <span>{formatDueDate(task.due_date)}</span>
                        {overdue && <span className="font-bold">(Vencido)</span>}
                    </div>
                ) : (
                    <div />
                )}

                {/* Subject chip */}
                {task.subject && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:text-gray-300 max-w-[100px] truncate">
                        <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: task.subject.color }}
                        />
                        {task.subject.name}
                    </span>
                )}
            </div>
        </div>
    );
}
