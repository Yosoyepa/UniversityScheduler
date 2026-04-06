/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
/**
 * Schedule Page.
 *
 * Mockup reference: university_schedule_dashboard_1/2
 *
 * Displays the weekly schedule grid with class sessions.
 * Uses ScheduleGrid organism and ClassFormModal for subject creation.
 */

"use client";

import { useState } from "react";
import { ScheduleGrid, ClassFormModal, SemesterFormModal, SubjectDetailsModal } from "@/components";
import { Button } from "@/components";
import { useSchedule } from "@/features/schedule/hooks/useSchedule";
import { useProfessors } from "@/features/professors/hooks/useProfessors";
import { useMemo } from "react";
import type { SubjectFormData } from "@/components/organisms/ClassFormModal";
import type { DayOfWeek } from "@/types";
import type { SemesterFormData } from "@/components/organisms/SemesterFormModal";
import type { ClassSessionWithSubject, Subject } from "@/types";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";

// =============================================================================
// Component
// =============================================================================

export default function SchedulePage() {
    const {
        sessions,
        subjects,
        activeSemester,
        loading,
        error,
        createSubject,
        updateSubject,
        createSemester,
        creating,
    } = useSchedule();

    const {
        sessions: tutoringSessions,
        professors,
        loading: loadingProfessors,
    } = useProfessors();

    const [showForm, setShowForm] = useState(false);
    const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
    const [showSemesterForm, setShowSemesterForm] = useState(false);
    const [selectedSession, setSelectedSession] =
        useState<ClassSessionWithSubject | null>(null);

    async function handleSubjectSubmit(data: SubjectFormData) {
        if (subjectToEdit) {
            const success = await updateSubject(subjectToEdit.id, data);
            if (success) {
                setShowForm(false);
                setSubjectToEdit(null);
            }
        } else {
            const success = await createSubject(data);
            if (success) {
                setShowForm(false);
            }
        }
    }

    async function handleCreateSemester(data: SemesterFormData) {
        const success = await createSemester({
            name: data.name,
            start_date: data.start_date,
            end_date: data.end_date,
        });
        if (success) {
            setShowSemesterForm(false);
        }
    }

    function handleSessionClick(session: ClassSessionWithSubject) {
        setSelectedSession(session);
    }

    function handleEditSubject(subjectId: string) {
        const subject = subjects.find(s => s.id === subjectId);
        if (subject) {
            setSelectedSession(null);
            setSubjectToEdit(subject);
            setShowForm(true);
        }
    }

    const combinedSessions = useMemo(() => {
        const mappedTutoringSessions: ClassSessionWithSubject[] = tutoringSessions
            .filter((ts) => ts.status === "SCHEDULED")
            .map((ts) => {
                const prof = professors.find((p) => p.id === ts.professor_id);
                const name = prof ? `Tutoría: ${prof.name}` : "Sesión de Tutoría";

                const parts = ts.date.split("-");
                const dateObj = new Date(
                    parseInt(parts[0]),
                    parseInt(parts[1]) - 1,
                    parseInt(parts[2])
                );
                const day = dateObj.getDay();
                const day_of_week = (day === 0 ? 7 : day) as DayOfWeek;

                return {
                    id: ts.id,
                    subject_id: "tutoring",
                    day_of_week,
                    start_time: ts.start_time,
                    end_time: ts.end_time,
                    classroom: ts.meeting_link || "Presencial / Oficina",
                    attendance_required: true,
                    subject: {
                        id: "tutoring",
                        semester_id: activeSemester?.id || "any",
                        name: name,
                        group_code: null,
                        credits: 0,
                        color: "#10B981",
                        difficulty: "EASY",
                        subject_type: "LIBRE_ELECCION",
                        professor_id: ts.professor_id,
                        created_at: ts.created_at,
                        updated_at: ts.updated_at,
                    },
                } as ClassSessionWithSubject;
            });

        return [...sessions, ...mappedTutoringSessions];
    }, [sessions, tutoringSessions, professors, activeSemester]);

    // Loading state
    if (loading || loadingProfessors) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mt-2" />
                    </div>
                    <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                </div>
                <div className="h-[600px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            </div>
        );
    }

    // No active semester
    if (!activeSemester) {
        return (
            <div className="text-center py-20">
                <span className="material-icons-round text-6xl text-gray-300 dark:text-gray-600 mb-4 block">
                    school
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Sin semestre activo
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    No tienes un semestre activo. Crea uno para empezar a
                    gestionar tu horario.
                </p>
                <Button onClick={() => setShowSemesterForm(true)}>
                    <span className="material-icons-round text-sm">add</span>
                    Crear Semestre
                </Button>
                
                <SemesterFormModal
                    open={showSemesterForm}
                    onClose={() => setShowSemesterForm(false)}
                    onSubmit={handleCreateSemester}
                    loading={creating}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page header — mockup aligned */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        Mi Horario
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                        <span className="material-icons-round text-sm">event</span>
                        {activeSemester.name} · {subjects.length} {subjects.length === 1 ? "materia" : "materias"} · {combinedSessions.length} sesiones
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowSemesterForm(true)}
                    >
                        <span className="material-icons-round text-sm">edit_calendar</span>
                        <span className="hidden sm:inline">Semestre</span>
                    </Button>
                    <Button onClick={() => {
                        setSubjectToEdit(null);
                        setShowForm(true);
                    }}>
                        <span className="material-icons-round text-sm">add</span>
                        Agregar Materia
                    </Button>
                </div>
            </div>

            {/* Error message */}
            {error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-2">
                    <span className="material-icons-round text-red-500 text-lg">error</span>
                    <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
                </div>
            ) : null}

            <div className="flex flex-col xl:flex-row gap-6 items-start">
                {/* Schedule grid */}
                <div className="flex-1 w-full min-w-0">
                    {combinedSessions.length > 0 ? (
                        <ScheduleGrid
                            sessions={combinedSessions}
                            onSessionClick={handleSessionClick}
                        />
                    ) : (
                        <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-12 text-center shadow-sm">
                            <span className="material-icons-round text-5xl text-gray-300 dark:text-gray-600 mb-4 block">
                                event_note
                            </span>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                                Sin materias registradas
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                Aún no tienes materias en este semestre.
                            </p>
                            <Button
                                variant="secondary"
                                onClick={() => setShowForm(true)}
                            >
                                <span className="material-icons-round text-sm">add</span>
                                Agregar primera materia
                            </Button>
                        </div>
                    )}
                </div>

                {/* Dashboard Sidebar Right Column */}
                <DashboardSidebar subjects={subjects} sessions={combinedSessions} />
            </div>

            <SubjectDetailsModal
                open={!!selectedSession}
                session={selectedSession}
                onClose={() => setSelectedSession(null)}
                onEdit={selectedSession?.subject.id === "tutoring" ? undefined : handleEditSubject}
            />

            {/* Create/Edit subject modal */}
            <ClassFormModal
                open={showForm}
                initialData={subjectToEdit ? {
                    name: subjectToEdit.name,
                    credits: subjectToEdit.credits,
                    difficulty: subjectToEdit.difficulty,
                    subject_type: subjectToEdit.subject_type,
                    professor_id: subjectToEdit.professor_id || null,
                    color: subjectToEdit.color,
                    sessions: sessions
                        .filter(s => s.subject.id === subjectToEdit.id)
                        .map(s => {
                            const isVirtual = !!(s.classroom && s.classroom.startsWith('http'));
                            return {
                                id: s.id,
                                day_of_week: s.day_of_week,
                                start_time: s.start_time.substring(0, 5),
                                end_time: s.end_time.substring(0, 5),
                                classroom: s.classroom || "",
                                is_virtual: isVirtual
                            };
                        })
                } : undefined}
                onClose={() => setShowForm(false)}
                onSubmit={handleSubjectSubmit}
                loading={creating}
            />

            <SemesterFormModal
                open={showSemesterForm}
                onClose={() => setShowSemesterForm(false)}
                onSubmit={handleCreateSemester}
                loading={creating}
            />
        </div>
    );
}
