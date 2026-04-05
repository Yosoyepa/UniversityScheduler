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
import type { SubjectFormData } from "@/components/organisms/ClassFormModal";
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

    // Loading state
    if (loading) {
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
                        {activeSemester.name} · {subjects.length} materia
                        {subjects.length !== 1 ? "s" : ""}
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
            {sessions.length > 0 ? (
                <ScheduleGrid
                    sessions={sessions}
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
                onEdit={handleEditSubject}
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
