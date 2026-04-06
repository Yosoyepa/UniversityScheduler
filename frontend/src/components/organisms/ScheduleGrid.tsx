/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
/**
 * ScheduleGrid Organism Component.
 *
 * Mockup reference: university_schedule_dashboard_1 lines 104–254
 *
 * Weekly calendar grid displaying class sessions.
 * Following Atomic Design — organism composed of ClassCard molecules.
 *
 * Mockup design features:
 *   - Day headers with date number + short weekday name
 *   - Alternating column backgrounds
 *   - Time labels column
 *   - Absolutely positioned session cards
 */

"use client";

import { useMemo } from "react";
import { ClassCard } from "../molecules/ClassCard";
import type { ClassSessionWithSubject, DayOfWeek } from "@/types";

// =============================================================================
// Types
// =============================================================================

export interface ScheduleGridProps {
    sessions: ClassSessionWithSubject[];
    onSessionClick?: (session: ClassSessionWithSubject) => void;
    startHour?: number;
    endHour?: number;
}

// =============================================================================
// Constants
// =============================================================================

const DAY_LABELS: Record<DayOfWeek, { short: string; full: string }> = {
    1: { short: "LUN", full: "Lunes" },
    2: { short: "MAR", full: "Martes" },
    3: { short: "MIÉ", full: "Miércoles" },
    4: { short: "JUE", full: "Jueves" },
    5: { short: "VIE", full: "Viernes" },
    6: { short: "SÁB", full: "Sábado" },
    7: { short: "DOM", full: "Domingo" },
};

const DAYS_TO_SHOW: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 7];

// =============================================================================
// Helpers
// =============================================================================

function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

function formatHour(hour: number): string {
    const period = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:00 ${period}`;
}

// =============================================================================
// Component
// =============================================================================

export function ScheduleGrid({
    sessions,
    onSessionClick,
    startHour = 6,
    endHour = 21,
}: ScheduleGridProps) {
    // Group sessions by day
    const sessionsByDay = useMemo(() => {
        const grouped = new Map<DayOfWeek, ClassSessionWithSubject[]>();
        for (const day of DAYS_TO_SHOW) {
            grouped.set(day, []);
        }
        for (const session of sessions) {
            const dayList = grouped.get(session.day_of_week);
            if (dayList) {
                dayList.push(session);
            }
        }
        return grouped;
    }, [sessions]);

    const totalMinutes = (endHour - startHour) * 60;
    const hours = Array.from(
        { length: endHour - startHour },
        (_, i) => startHour + i
    );

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-auto shadow-sm pb-2">
            <div className="min-w-[700px]">
                {/* Day header row */}
                <div className="grid grid-cols-[72px_repeat(7,minmax(0,1fr))] border-b border-border-light dark:border-border-dark">
                    {/* Empty top-left corner */}
                    <div className="p-3 border-r border-border-light dark:border-border-dark" />

                    {DAYS_TO_SHOW.map((day, idx) => {
                        const hasSessions = (sessionsByDay.get(day) || []).length > 0;
                        return (
                            <div
                                key={day}
                                className={`
                                    p-3 text-center border-r border-border-light dark:border-border-dark last:border-r-0
                                    ${idx % 2 === 0
                                        ? "bg-white dark:bg-slate-900/50"
                                        : "bg-gray-50/50 dark:bg-slate-800/30"
                                    }
                                `}
                            >
                                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold truncate">
                                    {DAY_LABELS[day].short}
                                </p>
                                <p className={`text-sm lg:text-lg font-bold truncate ${hasSessions ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
                                    {DAY_LABELS[day].full}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Grid body */}
                <div className="grid grid-cols-[72px_repeat(7,minmax(0,1fr))]">
                {/* Time labels column */}
                <div className="border-r border-border-light dark:border-border-dark">
                    {hours.map((hour) => (
                        <div
                            key={hour}
                            className="h-16 flex items-start justify-end pr-2 pt-1 border-b border-gray-100 dark:border-gray-800/50"
                        >
                            <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                                {formatHour(hour)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Day columns with positioned session cards */}
                {DAYS_TO_SHOW.map((day, idx) => (
                    <div
                        key={day}
                        className={`
                            relative border-r border-border-light dark:border-border-dark last:border-r-0
                            ${idx % 2 === 0
                                ? "bg-white dark:bg-slate-900/50"
                                : "bg-gray-50/30 dark:bg-slate-800/20"
                            }
                        `}
                    >
                        {/* Hour grid lines */}
                        {hours.map((hour) => (
                            <div
                                key={hour}
                                className="h-16 border-b border-gray-100 dark:border-gray-800/50"
                            />
                        ))}

                        {/* Absolutely positioned session cards */}
                        {(sessionsByDay.get(day) || []).map((session) => {
                            const startMin =
                                timeToMinutes(session.start_time) -
                                startHour * 60;
                            const endMin =
                                timeToMinutes(session.end_time) -
                                startHour * 60;
                            const topPercent = (startMin / totalMinutes) * 100;
                            const heightPercent =
                                ((endMin - startMin) / totalMinutes) * 100;

                            return (
                                <div
                                    key={session.id}
                                    className="absolute left-1 right-1 z-10"
                                    style={{
                                        top: `${topPercent}%`,
                                        height: `${heightPercent}%`,
                                    }}
                                >
                                    <ClassCard
                                        session={session}
                                        onClick={() =>
                                            onSessionClick?.(session)
                                        }
                                        compact={endMin - startMin <= 60}
                                    />
                                </div>
                            );
                        })}

                        {/* Free day placeholder */}
                        {(sessionsByDay.get(day) || []).length === 0 && (
                            <div className="absolute inset-4 flex items-center justify-center">
                                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                                    <span className="material-icons-round text-3xl text-gray-300 dark:text-gray-600">
                                        event_available
                                    </span>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">
                                        Libre
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            </div>
        </div>
    );
}
