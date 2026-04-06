/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
/**
 * Academic Progress Page.
 *
 * App Router page for the Grades & Academic Progress module.
 * Following frontend-app-router layer rules.
 */

"use client";

import { useState, useEffect } from "react";
import { PlusIcon, MaterialIcon } from "@/components/atoms/Icon";
import { Button } from "@/components/atoms/Button";
import { GradesTable } from "@/components/organisms/GradesTable";
import { GradeFormModal } from "@/components/organisms/GradeFormModal";
import { EvaluationCriteriaForm } from "@/components/organisms/EvaluationCriteriaForm";
import { AcademicKPIHero } from "@/components/organisms/AcademicKPIHero";
import { GradePredictor } from "@/components/organisms/GradePredictor";
import { useGrades } from "@/features/academic_progress/hooks/useGrades";
import { api } from "@/lib/api-client";
import type { Subject, Grade, Semester } from "@/types";
import ProgressLoading from "./loading";
import ProgressError from "./error";

export default function ProgressPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Modal state
    const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
    const [editingGrade, setEditingGrade] = useState<Grade | undefined>(undefined);

    // Load active semester subjects
    useEffect(() => {
        let isMounted = true;
        
        async function loadSubjects() {
            try {
                // 1. Get active semester
                const semResult = await api.get<Semester | null>("/semesters/active");
                if (!semResult.ok) throw new Error(semResult.error.message);
                
                if (semResult.value) {
                    const activeSem = semResult.value;
                    // 2. Get subjects for active semester
                    const subjResult = await api.get<Subject[]>("/subjects", { semester_id: activeSem.id });
                    if (!subjResult.ok) throw new Error(subjResult.error.message);
                    
                    if (isMounted) {
                        const loadedSubjects = subjResult.value || [];
                        setSubjects(loadedSubjects);
                        if (loadedSubjects.length > 0 && !selectedSubjectId) {
                            setSelectedSubjectId(loadedSubjects[0].id);
                        }
                    }
                }
            } catch (err: unknown) {
                if (isMounted) setError(err instanceof Error ? err : new Error(String(err)));
            } finally {
                if (isMounted) setLoadingSubjects(false);
            }
        }
        
        loadSubjects();
        
        return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Feature Hook
    const {
        grades,
        criteria,
        tasks,
        average,
        loading: loadingGrades,
        error: gradesError,
        submitting,
        createGrade,
        updateGrade,
        deleteGrade,
        createCriteria,
    } = useGrades(selectedSubjectId);

    // -------------------------------------------------------------------------
    // Handlers
    // -------------------------------------------------------------------------

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleCreateGrade = async (data: any) => {
        if (!selectedSubjectId) return;
        
        let success = false;
        if (editingGrade) {
            success = await updateGrade(editingGrade.id, data);
        } else {
            success = await createGrade(data, selectedSubjectId);
        }
        
        if (success) {
            setIsGradeModalOpen(false);
            setEditingGrade(undefined);
        }
    };

    const handleDeleteGrade = async (gradeId: string) => {
        if (confirm("¿Estás seguro de que deseas eliminar esta calificación?")) {
            await deleteGrade(gradeId);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleCreateCriteria = async (data: any) => {
        if (!selectedSubjectId) return;
        await createCriteria(data, selectedSubjectId);
    };

    // -------------------------------------------------------------------------
    // Render States
    // -------------------------------------------------------------------------

    if (error) {
        return <ProgressError error={error} reset={() => window.location.reload()} />;
    }

    if (gradesError) {
        // useGrades error is passed locally to the UI rather than throwing to boundary
        console.error("Grades Hook Error:", gradesError);
    }

    if (loadingSubjects) {
        return <ProgressLoading />;
    }

    if (subjects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark h-[60vh] shadow-sm">
                <MaterialIcon name="school" size="xl" className="text-gray-300 dark:text-gray-600 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No hay materias registradas</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
                    Debes registrar al menos una materia en tu semestre activo antes de gestionar calificaciones.
                </p>
                <Button onClick={() => window.location.href = "/dashboard/schedule"}>
                    <MaterialIcon name="arrow_forward" size="sm" />
                    Ir a Horario
                </Button>
            </div>
        );
    }

    const totalCriteriaWeight = criteria.reduce((sum, c) => sum + Number(c.weight), 0);

    return (
        <div className="space-y-6">
            {/* Header / Subject Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Progreso Académico</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Gestiona tus calificaciones y metas por materia.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <label htmlFor="subject-select" className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap flex items-center gap-1.5">
                        <MaterialIcon name="menu_book" size="sm" />
                        Materia:
                    </label>
                    <select
                        id="subject-select"
                        value={selectedSubjectId || ""}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                        className="w-full sm:w-64 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                        {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name} {s.group_code ? `(${s.group_code})` : ""}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
                {/* Left Column: Hero & Table */}
                <div className="flex-1 flex flex-col gap-6 w-full min-w-0">
                    <AcademicKPIHero 
                        gpa={average?.average || 0} 
                        trend={0.1} 
                        percentage={((average?.average || 0) / 5.0) * 100} 
                    />

                    {loadingGrades ? (
                        <ProgressLoading />
                    ) : (
                        <div className="space-y-4 pt-2">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    Calificaciones Registradas
                                </h2>
                                <Button
                                    onClick={() => {
                                        setEditingGrade(undefined);
                                        setIsGradeModalOpen(true);
                                    }}
                                    disabled={submitting}
                                    className="flex items-center gap-2"
                                >
                                    <PlusIcon size="sm" />
                                    <span className="hidden sm:inline">Agregar Nota</span>
                                    <span className="sm:hidden">Agregar</span>
                                </Button>
                            </div>

                            <GradesTable 
                                grades={grades} 
                                criteria={criteria} 
                                tasks={tasks}
                                average={average} 
                                onEditGrade={(g) => {
                                    setEditingGrade(g);
                                    setIsGradeModalOpen(true);
                                }}
                                onDeleteGrade={handleDeleteGrade}
                            />
                        </div>
                    )}
                </div>

                {/* Right Column: Sidebar (Predictor & Evaluation Criteria) */}
                <div className="xl:w-80 shrink-0 flex flex-col gap-6">
                    <GradePredictor 
                        subjects={subjects} 
                        selectedSubjectId={selectedSubjectId || undefined} 
                    />

                    {/* Sidebar: Evaluation Criteria (1/3 width) */}
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-5">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                                Reglas de Evaluación
                            </h2>
                            
                            {criteria.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-4">
                                    No has definido el syllabus de esta materia. Las notas sin criterio se promediarán directamente.
                                </p>
                            ) : (
                                <ul className="space-y-3 mb-6">
                                    {criteria.map((c) => (
                                        <li key={c.id} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">{c.name}</span>
                                            <span className="text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                                                {c.weight}%
                                            </span>
                                        </li>
                                    ))}
                                    
                                    <li className="flex justify-between items-center text-sm font-semibold pt-2 border-t border-gray-100 dark:border-gray-700">
                                        <span className="text-gray-900 dark:text-gray-100">Total Programado</span>
                                        <span className={totalCriteriaWeight === 100 ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}>
                                            {totalCriteriaWeight.toFixed(1)}%
                                        </span>
                                    </li>
                                </ul>
                            )}

                            <div>
                                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Agregar Rubro</h3>
                                <EvaluationCriteriaForm 
                                    totalWeight={totalCriteriaWeight}
                                    onSubmit={handleCreateCriteria}
                                    loading={submitting}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <GradeFormModal
                open={isGradeModalOpen}
                onClose={() => {
                    setIsGradeModalOpen(false);
                    setEditingGrade(undefined);
                }}
                onSubmit={handleCreateGrade}
                initialData={editingGrade}
                criteria={criteria}
                tasks={tasks}
                loading={submitting}
            />
        </div>
    );
}
