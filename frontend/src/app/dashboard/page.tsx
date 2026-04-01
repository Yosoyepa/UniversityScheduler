/**
 * Dashboard Home Page.
 *
 * Landing page after login, redirects or shows overview.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard | University Scheduler",
    description: "Gestiona tu horario y tareas universitarias",
};

export default function DashboardPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
                Bienvenido a University Scheduler. Usa el menú lateral para
                navegar.
            </p>
        </div>
    );
}
