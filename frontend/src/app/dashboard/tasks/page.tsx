/**
 * Tasks Page.
 *
 * Kanban board view for Task Management (Phase 2).
 * Client component — uses useTasks hook for real-time state.
 *
 * Following App Router conventions:
 * - "use client" for interactive hooks
 * - Delegates display to KanbanBoard organism
 * - Implements loading skeleton via loading.tsx companion
 */

"use client";

import { useState } from "react";
import { KanbanBoard, TaskFormModal } from "@/components";
import { Button, PlusIcon } from "@/components";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import type { TaskWithSubject, TaskStatus, Task } from "@/types";
import type { TaskFormData } from "@/components/organisms/TaskFormModal";

// =============================================================================
// Component
// =============================================================================

export default function TasksPage() {
    const {
        tasks,
        subjects,
        loading,
        error,
        submitting,
        createTask,
        updateTask,
        updateStatus,
    } = useTasks();

    // Modal state
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // -------------------------------------------------------------------------
    // Handlers
    // -------------------------------------------------------------------------

    async function handleCreateTask(data: TaskFormData) {
        const success = await createTask(data);
        if (success) {
            setShowForm(false);
        }
    }

    async function handleUpdateTask(data: TaskFormData) {
        if (!editingTask) return;
        const success = await updateTask(editingTask.id, data);
        if (success) {
            setEditingTask(null);
            setShowForm(false);
        }
    }

    function handleTaskClick(task: TaskWithSubject) {
        setEditingTask(task);
        setShowForm(true);
    }

    function handleAddTask() {
        setEditingTask(null);
        setShowForm(true);
    }

    function handleCloseForm() {
        setEditingTask(null);
        setShowForm(false);
    }

    async function handleStatusChange(taskId: string, newStatus: TaskStatus) {
        await updateStatus(taskId, newStatus);
    }

    // -------------------------------------------------------------------------
    // Loading state (also shown by loading.tsx Suspense boundary)
    // -------------------------------------------------------------------------
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                    <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-[500px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Mis Tareas
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {tasks.length} tarea{tasks.length !== 1 ? "s" : ""} en
                        total
                    </p>
                </div>
                <Button id="btn-nueva-tarea" onClick={handleAddTask}>
                    <PlusIcon size="sm" />
                    <span className="ml-2">Nueva Tarea</span>
                </Button>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-300 text-sm">
                        {error}
                    </p>
                </div>
            )}

            {/* Kanban Board */}
            <KanbanBoard
                tasks={tasks}
                onStatusChange={handleStatusChange}
                onTaskClick={handleTaskClick}
                onAddTask={handleAddTask}
            />

            {/* Task Form Modal */}
            <TaskFormModal
                open={showForm}
                onClose={handleCloseForm}
                onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                subjects={subjects}
                initialData={editingTask ?? undefined}
                loading={submitting}
            />
        </div>
    );
}
