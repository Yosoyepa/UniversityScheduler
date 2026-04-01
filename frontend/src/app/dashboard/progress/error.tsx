"use client";

import { useEffect } from "react";
import { Button } from "@/components/atoms/Button";

export default function ProgressError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Progress page boundary caught error:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center p-12 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
                Algo salió mal cargando tus calificaciones
            </h2>
            <p className="text-red-600 dark:text-red-300 mb-6 text-center max-w-md">
                {error.message || "Ocurrió un error inesperado al intentar cargar los datos académicos."}
            </p>
            <Button onClick={() => reset()} variant="secondary">
                Intentar de nuevo
            </Button>
        </div>
    );
}
