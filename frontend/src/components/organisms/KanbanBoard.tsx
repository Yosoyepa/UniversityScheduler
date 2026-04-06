/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
/**
 * KanbanBoard Organism Component.
 *
 * Full Kanban board for Task Management.
 * Composes 4 KanbanColumn molecules (one per TaskStatus).
 * Handles drag-and-drop status transitions and delegates to parent hooks.
 *
 * Following Atomic Design — organisms compose molecules and atoms.
 */

"use client";

import { useMemo } from "react";
import { KanbanColumn } from "../molecules/KanbanColumn";
import type { TaskWithSubject, TaskStatus } from "@/types";

// =============================================================================
// Types
// =============================================================================

export interface KanbanBoardProps {
    tasks: TaskWithSubject[];
    onStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void>;
    onTaskClick: (task: TaskWithSubject) => void;
    onAddTask: () => void;
}

// =============================================================================
// Constants
// =============================================================================

const COLUMN_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE", "ARCHIVED"];

// =============================================================================
// Component
// =============================================================================

export function KanbanBoard({
    tasks,
    onStatusChange,
    onTaskClick,
    onAddTask,
}: KanbanBoardProps) {
    // Group tasks by status
    const tasksByStatus = useMemo(() => {
        const grouped = new Map<TaskStatus, TaskWithSubject[]>();
        for (const status of COLUMN_ORDER) {
            grouped.set(status, []);
        }
        for (const task of tasks) {
            const list = grouped.get(task.status);
            if (list) {
                list.push(task);
            }
        }
        return grouped;
    }, [tasks]);

    async function handleDrop(taskId: string, newStatus: TaskStatus) {
        // Avoid no-op transitions
        const task = tasks.find((t) => t.id === taskId);
        if (!task || task.status === newStatus) return;
        await onStatusChange(taskId, newStatus);
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {COLUMN_ORDER.map((status) => (
                <KanbanColumn
                    key={status}
                    status={status}
                    tasks={tasksByStatus.get(status) ?? []}
                    onTaskClick={onTaskClick}
                    onDrop={handleDrop}
                    onAddTask={onAddTask}
                />
            ))}
        </div>
    );
}
