/**
 * Schedule Page.
 *
 * Displays the weekly schedule grid with class sessions.
 * Uses ScheduleGrid organism and ClassFormModal for subject creation.
 */

"use client";

import { useState } from "react";
import { ScheduleGrid, ClassFormModal, SemesterFormModal, SubjectDetailsModal } from "@/components";
import { Button, PlusIcon } from "@/components";
import { useSchedule } from "@/features/schedule/hooks/useSchedule";
import { useProfessors } from "@/features/professors/hooks/useProfessors";
import { useMemo } from "react";
import type { SubjectFormData } from "@/components/organisms/ClassFormModal";
import type { DayOfWeek } from "@/types";
import type { SemesterFormData } from "@/components/organisms/SemesterFormModal";
import type { ClassSessionWithSubject, Subject } from "@/types";

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
        // Find subject to edit and its sessions
        const subject = subjects.find(s => s.id === subjectId);
        if (subject) {
            setSelectedSession(null);
            setSubjectToEdit(subject);
            setShowForm(true);
        }
    }

    const combinedSessions = useMemo(() => {
        const mappedTutoringSessions: ClassSessionWithSubject[] = tutoringSessions
            .filter((ts) => ts.status === "SCHEDULED") // Only show scheduled sessions
            .map((ts) => {
                const prof = professors.find((p) => p.id === ts.professor_id);
                const name = prof ? `Tutoría: ${prof.name}` : "Sesión de Tutoría";

                // Parse date (YYYY-MM-DD) carefully to avoid timezone issues
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
                        color: "#10B981", // Emerald green to distinguish from classes
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
            <div className="space-y-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-48" />
                <div className="h-[600px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            </div>
        );
    }

    // No active semester
    if (!activeSemester) {
        return (
            <div className="text-center py-20">
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                    No tienes un semestre activo. Crea uno para empezar a
                    gestionar tu horario.
                </p>
                <Button onClick={() => setShowSemesterForm(true)}>Crear Semestre</Button>
                
                {/* Create semester modal */}
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
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Mi Horario
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {activeSemester.name} · {subjects.length} {subjects.length === 1 ? "materia" : "materias"}
                    </p>
                </div>
                <Button onClick={() => {
                    setSubjectToEdit(null);
                    setShowForm(true);
                }}>
                    <PlusIcon size="sm" />
                    <span className="ml-2">Agregar Materia</span>
                </Button>
            </div>

            {/* Error message */}
            {error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-300 text-sm">
                        {error}
                    </p>
                </div>
            ) : null}

            {/* Schedule grid */}
            {combinedSessions.length > 0 ? (
                <ScheduleGrid
                    sessions={combinedSessions}
                    onSessionClick={handleSessionClick}
                />
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Aún no tienes materias en este semestre.
                    </p>
                    <Button
                        variant="secondary"
                        onClick={() => setShowForm(true)}
                    >
                        <PlusIcon size="sm" />
                        <span className="ml-2">Agregar primera materia</span>
                    </Button>
                </div>
            )}

            <SubjectDetailsModal
                open={!!selectedSession}
                session={selectedSession}
                onClose={() => setSelectedSession(null)}
                onEdit={selectedSession?.subject.id === "tutoring" ? undefined : handleEditSubject}
            />

            {/* Create subject modal */}
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
        </div>
    );
}
