/**
 * GradesTable Organism Component.
 *
 * Displays all grades for a specific subject with their corresponding criteria.
 * Calculates and shows the weighted average at the bottom.
 * Following Atomic Design methodology.
 */

import { GradeRow } from "../molecules/GradeRow";
import { Badge } from "../atoms/Badge";
import type { Grade, EvaluationCriteria, SubjectAverage, TaskWithSubject } from "@/types";

// =============================================================================
// Types
// =============================================================================

export interface GradesTableProps {
    grades: Grade[];
    criteria: EvaluationCriteria[];
    tasks: TaskWithSubject[];
    average: SubjectAverage | null;
    onEditGrade: (grade: Grade) => void;
    onDeleteGrade: (gradeId: string) => void;
}

// =============================================================================
// Component
// =============================================================================

export function GradesTable({
    grades,
    criteria,
    tasks,
    average,
    onEditGrade,
    onDeleteGrade,
}: GradesTableProps) {
    // Map criteria and tasks for easy lookup
    const criteriaMap = new Map(criteria.map(c => [c.id, c]));
    const tasksMap = new Map(tasks.map(t => [t.id, t]));

    // Sort grades by criteria name or graded_at
    const sortedGrades = [...grades].sort((a, b) => {
        const cA = a.criteria_id ? criteriaMap.get(a.criteria_id)?.name || "" : "Z";
        const cB = b.criteria_id ? criteriaMap.get(b.criteria_id)?.name || "" : "Z";
        return cA.localeCompare(cB);
    });

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                        <tr>
                            <th className="px-4 py-3 font-medium">Criterio / Peso</th>
                            <th className="px-4 py-3 font-medium">Tarea Vinculada</th>
                            <th className="px-4 py-3 font-medium">Calificación</th>
                            <th className="px-4 py-3 font-medium">Porcentaje</th>
                            <th className="px-4 py-3 font-medium">Notas</th>
                            <th className="px-4 py-3 font-medium text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedGrades.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                    No hay calificaciones registradas para esta materia.
                                </td>
                            </tr>
                        ) : (
                            sortedGrades.map((grade) => (
                                <GradeRow
                                    key={grade.id}
                                    grade={grade}
                                    criteria={grade.criteria_id ? criteriaMap.get(grade.criteria_id) : undefined}
                                    taskTitle={grade.task_id ? tasksMap.get(grade.task_id)?.title : undefined}
                                    onEdit={onEditGrade}
                                    onDelete={onDeleteGrade}
                                />
                            ))
                        )}
                    </tbody>
                    {average && sortedGrades.length > 0 && (
                        <tfoot className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-slate-200 dark:border-slate-700">
                            <tr>
                                <td colSpan={2} className="px-4 py-4 font-semibold text-gray-900 dark:text-gray-100">
                                    Promedio Acumulado
                                    {average.is_complete && (
                                        <Badge variant="success" size="sm" className="ml-2">Completo</Badge>
                                    )}
                                </td>
                                <td colSpan={4} className="px-4 py-4 text-left">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                                            {Number(average.average).toFixed(1)}%
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            (basado en {average.grades_count} notas registradas y sus pesos)
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}
