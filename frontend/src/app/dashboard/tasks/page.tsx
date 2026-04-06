/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
/**
 * Tasks Page.
 *
 * Mockup reference: tasks_and_exams_manager_1/2
 *
 * Kanban board view for Task Management.
 * Features stats row, view toggle, and sort controls.
 */

"use client";

import { useState, useMemo } from "react";
import { KanbanBoard, TaskFormModal } from "@/components";
import { Button } from "@/components";
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

    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // -------------------------------------------------------------------------
    // Computed stats
    // -------------------------------------------------------------------------
    const stats = useMemo(() => {
        const pending = tasks.filter(t => t.category === "EXAM" && t.status !== "DONE").length;
        const dueSoon = tasks.filter(t => {
            if (!t.due_date || t.status === "DONE") return false;
            const diff = new Date(t.due_date).getTime() - Date.now();
            return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000; // within 7 days
        }).length;
        const completed = tasks.filter(t => t.status === "DONE").length;
        return { pending, dueSoon, completed };
    }, [tasks]);

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
    // Loading
    // -------------------------------------------------------------------------
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                    <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-[500px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        Tareas & Exámenes
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {tasks.length} tarea{tasks.length !== 1 ? "s" : ""} en total
                    </p>
                </div>
                <Button id="btn-nueva-tarea" onClick={handleAddTask}>
                    <span className="material-icons-round text-sm">add</span>
                    Nueva Tarea
                </Button>
            </div>

            {/* Stats row — Mockup reference: tasks_and_exams_manager_1 lines 55-90 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-5 shadow-sm flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500">
                        <span className="material-icons-round text-xl">quiz</span>
                    </div>
                    <div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.pending}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Exámenes Pendientes</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-5 shadow-sm flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-500">
                        <span className="material-icons-round text-xl">schedule</span>
                    </div>
                    <div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.dueSoon}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Vencen esta semana</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-5 shadow-sm flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500">
                        <span className="material-icons-round text-xl">check_circle</span>
                    </div>
                    <div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.completed}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Completadas</p>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-2">
                    <span className="material-icons-round text-red-500 text-lg">error</span>
                    <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
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
