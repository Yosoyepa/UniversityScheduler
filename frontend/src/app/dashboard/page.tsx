/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
/**
 * Dashboard Home Page.
 *
 * Mockup reference: university_schedule_dashboard_1 lines 25–100
 *
 * Landing page after login — shows a welcome overview with quick stats,
 * upcoming class, and navigation prompts.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard | University Scheduler",
    description: "Gestiona tu horario y tareas universitarias",
};

export default function DashboardPage() {
    return (
        <div className="space-y-8 max-w-5xl">
            {/* Page header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                    Dashboard
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Bienvenido a UniSchedule. Aquí tienes un resumen rápido de tu semestre.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Schedule */}
                <a
                    href="/dashboard/schedule"
                    className="group bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-primary dark:text-indigo-400">
                            <span className="material-icons-round text-xl">calendar_month</span>
                        </div>
                        <span className="font-bold text-sm text-gray-800 dark:text-gray-200 group-hover:text-primary dark:group-hover:text-indigo-400 transition-colors">
                            Mi Horario
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Revisa tu horario semanal y gestiona materias.
                    </p>
                </a>

                {/* Tasks */}
                <a
                    href="/dashboard/tasks"
                    className="group bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-5 shadow-sm hover:shadow-md hover:border-blue-400/30 transition-all duration-200"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <span className="material-icons-round text-xl">task_alt</span>
                        </div>
                        <span className="font-bold text-sm text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Mis Tareas
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Kanban board para organizar entregas y exámenes.
                    </p>
                </a>

                {/* Progress */}
                <a
                    href="/dashboard/progress"
                    className="group bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-5 shadow-sm hover:shadow-md hover:border-emerald-400/30 transition-all duration-200"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                            <span className="material-icons-round text-xl">insights</span>
                        </div>
                        <span className="font-bold text-sm text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            Progreso
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Notas, promedios y visualización de rendimiento.
                    </p>
                </a>

                {/* Directory */}
                <a
                    href="/dashboard/directory"
                    className="group bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-5 shadow-sm hover:shadow-md hover:border-purple-400/30 transition-all duration-200"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                            <span className="material-icons-round text-xl">groups</span>
                        </div>
                        <span className="font-bold text-sm text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            Directorio
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Profesores, tutorías y horarios de atención.
                    </p>
                </a>
            </div>

            {/* Info banner */}
            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 dark:from-primary/20 dark:to-purple-500/20 rounded-xl p-6 border border-primary/20 dark:border-primary/30">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/20 dark:bg-primary/30 text-primary dark:text-indigo-300">
                        <span className="material-icons-round text-2xl">school</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                            Organiza tu semestre
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Comienza añadiendo tus materias en{" "}
                            <a href="/dashboard/schedule" className="text-primary hover:underline font-medium">
                                Horario
                            </a>
                            , luego gestiona tus entregas en{" "}
                            <a href="/dashboard/tasks" className="text-primary hover:underline font-medium">
                                Tareas
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
