/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
/**
 * Tasks Page — Error Boundary.
 *
 * "use client" is required for error.tsx.
 * Shows a friendly error UI and a retry button.
 */

"use client";

import { useEffect } from "react";
import { Button } from "@/components";

interface TasksErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function TasksError({ error, reset }: TasksErrorProps) {
    useEffect(() => {
        // Optionally log to an error reporting service
        console.error("[tasks/error]", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center max-w-md w-full">
                <h2 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                    Error al cargar las tareas
                </h2>
                <p className="text-sm text-red-600 dark:text-red-400 mb-6">
                    {error.message || "Ocurrió un error inesperado."}
                </p>
                <Button variant="secondary" onClick={reset}>
                    Volver a intentar
                </Button>
            </div>
        </div>
    );
}
