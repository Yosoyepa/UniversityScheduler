/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
/**
 * Schedule Page Error Boundary.
 *
 * Shown when an error occurs in the schedule page or its children.
 */

"use client";

import { Button } from "@/components";

export default function ScheduleError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="text-6xl">📅</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Error al cargar el horario
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                {error.message ||
                    "Ocurrió un error inesperado. Por favor intenta de nuevo."}
            </p>
            <Button onClick={reset} variant="secondary">
                Reintentar
            </Button>
        </div>
    );
}
