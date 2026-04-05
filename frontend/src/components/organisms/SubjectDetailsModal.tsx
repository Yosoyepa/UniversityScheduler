/**
 * SubjectDetailsModal Organism Component.
 *
 * Modal that displays the details of a class session/subject when clicked from the schedule grid.
 * Features a glassmorphism backdrop blur as requested by the user.
 */

"use client";

import { Button } from "../atoms/Button";
import { XIcon } from "../atoms/Icon";
import type { ClassSessionWithSubject } from "@/types";

export interface SubjectDetailsModalProps {
    open: boolean;
    session: ClassSessionWithSubject | null;
    onClose: () => void;
}

export function SubjectDetailsModal({
    open,
    session,
    onClose,
}: SubjectDetailsModalProps) {
    if (!open || !session) return null;

    const { subject, classroom, start_time, end_time, day_of_week } = session;

    // Helper map for days
    const daysMap: Record<number, string> = {
        1: "Lunes",
        2: "Martes",
        3: "Miércoles",
        4: "Jueves",
        5: "Viernes",
        6: "Sábado",
        7: "Domingo"
    };
    
    // Helper format for time "08:00:00" -> "08:00 AM"
    const formatTime = (timeStr: string) => {
        if (!timeStr) return "";
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${m} ${ampm}`;
    };

    return (
        <>
            {/* Backdrop with blur (Glassmorphism) */}
            <div
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-50 transition-all duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div 
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden pointer-events-auto transform transition-all border border-gray-100 dark:border-gray-700/60"
                >
                    {/* Header Banner colored with subject color */}
                    <div 
                        className="h-24 relative p-6 flex justify-between items-start"
                        style={{ backgroundColor: subject.color }}
                    >
                        <div className="absolute inset-0 bg-black/10"></div>
                        <h2 className="text-2xl font-bold text-white relative z-10 drop-shadow-md">
                            {subject.name}
                        </h2>
                        <button
                            onClick={onClose}
                            className="relative z-10 p-2 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full transition-colors"
                        >
                            <XIcon size="md" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">Horario</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {daysMap[day_of_week]}<br/>
                                    {formatTime(start_time)} - {formatTime(end_time)}
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">Salón</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {classroom || "Sin asignar"}
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">Profesor</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {subject.professor_name || "Sin asignar"}
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">Créditos</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {subject.credits}
                                </p>
                            </div>
                        </div>

                        {/* Badges / Extras */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold">
                                {subject.subject_type.replace(/_/g, ' ')}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold">
                                {subject.difficulty}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
