/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
/**
 * GradeRow Molecule Component.
 *
 * Represents a single row in the grades table.
 * Following Atomic Design methodology.
 */

import { Button } from "../atoms/Button";
import { Badge } from "../atoms/Badge";
import type { Grade, EvaluationCriteria } from "@/types";

// =============================================================================
// Types
// =============================================================================

export interface GradeRowProps {
    grade: Grade;
    criteria?: EvaluationCriteria;
    taskTitle?: string;
    onEdit?: (grade: Grade) => void;
    onDelete?: (gradeId: string) => void;
}

// =============================================================================
// Component
// =============================================================================

export function GradeRow({
    grade,
    criteria,
    taskTitle,
    onEdit,
    onDelete,
}: GradeRowProps) {
    // Format to 2 decimal places
    const scoreFormatted = Number(grade.score).toFixed(1);
    const maxScoreFormatted = Number(grade.max_score).toFixed(1);
    const percentage = Number(grade.normalized_score).toFixed(1);

    const isFailing = grade.normalized_score < 60;

    return (
        <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <td className="px-4 py-3">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                    {criteria?.name || "Calificación General"}
                </div>
                {criteria?.weight && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Peso: {criteria.weight}%
                    </div>
                )}
            </td>
            
            <td className="px-4 py-3">
                {taskTitle ? (
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        {taskTitle}
                    </span>
                ) : (
                    <span className="text-xs text-gray-400 italic">Sin tarea vinculada</span>
                )}
            </td>

            <td className="px-4 py-3 font-semibold">
                <span className={isFailing ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-100"}>
                    {scoreFormatted} <span className="text-gray-400 font-normal">/ {maxScoreFormatted}</span>
                </span>
            </td>

            <td className="px-4 py-3">
                <Badge variant={isFailing ? "danger" : "success"} size="sm">
                    {percentage}%
                </Badge>
            </td>

            <td className="px-4 py-3 max-w-xs truncate text-sm text-gray-500 dark:text-gray-400">
                {grade.notes || "-"}
            </td>

            <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                    {onEdit && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onEdit(grade)}
                            title="Editar calificación"
                        >
                            Editar
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDelete(grade.id)}
                            title="Eliminar calificación"
                        >
                            Eliminar
                        </Button>
                    )}
                </div>
            </td>
        </tr>
    );
}
