/**
 * ScheduleGrid Organism Component.
 *
 * Weekly calendar grid displaying class sessions positioned by day and time.
 * Following Atomic Design - organism composed of molecules (ClassCard).
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

const DAY_LABELS: Record<DayOfWeek, string> = {
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
    7: "Domingo",
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
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-gray-200 dark:border-gray-700">
                {/* Empty top-left corner */}
                <div className="p-3 border-r border-gray-200 dark:border-gray-700" />

                <>{DAYS_TO_SHOW.map((day) => (
                    <div
                        key={day}
                        className="p-3 text-center font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                    >
                        {DAY_LABELS[day]}
                    </div>
                ))}</>
            </div>

            <div className="grid grid-cols-[80px_repeat(7,1fr)]">
                {/* Time labels column */}
                <div className="border-r border-gray-200 dark:border-gray-700">
                    <>{hours.map((hour) => (
                        <div
                            key={hour}
                            className="h-16 flex items-start justify-end pr-3 pt-1 border-b border-gray-100 dark:border-gray-700/50"
                        >
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatHour(hour)}
                            </span>
                        </div>
                    ))}</>
                </div>

                {/* Day columns with positioned session cards */}
                <>{DAYS_TO_SHOW.map((day) => (
                    <div
                        key={day}
                        className="relative border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                    >
                        {/* Hour grid lines */}
                        <>{hours.map((hour) => (
                            <div
                                key={hour}
                                className="h-16 border-b border-gray-100 dark:border-gray-700/50"
                            />
                        ))}</>

                        {/* Absolutely positioned session cards */}
                        <>{(sessionsByDay.get(day) || []).map((session) => {
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
                                        compact={endMin - startMin < 60}
                                    />
                                </div>
                            );
                        })}</>
                    </div>
                ))}</>
            </div>
        </div>
    );
}
