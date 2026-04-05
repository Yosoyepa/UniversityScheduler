/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
/**
 * ClassCard Molecule Component.
 *
 * Mockup reference: university_schedule_dashboard_1 lines 134–164
 *
 * Card displaying class session information for schedule grid.
 * Features shadow, hover elevation, subject color accent bar.
 */

import type { ClassSessionWithSubject } from "@/types";

// =============================================================================
// Types
// =============================================================================

export interface ClassCardProps {
    session: ClassSessionWithSubject;
    onClick?: () => void;
    compact?: boolean;
}

// =============================================================================
// Helpers
// =============================================================================

function formatTime(time: string): string {
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours, 10);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${period}`;
}

// =============================================================================
// Component
// =============================================================================

export function ClassCard({
    session,
    onClick,
    compact = false,
}: ClassCardProps) {
    const { subject, start_time, end_time, classroom } = session;

    return (
        <div
            className={`
                h-full flex flex-col overflow-hidden rounded-lg border-l-4 cursor-pointer
                bg-white/80 dark:bg-slate-800/60
                shadow-sm hover:shadow-md transition-all duration-200
                hover:scale-[1.02]
                ${compact ? "p-1.5 text-xs" : "p-3 text-sm"}
            `}
            style={{
                borderLeftColor: subject.color,
            }}
            onClick={onClick}
        >
            {/* Time — bold colored */}
            <p
                className={`font-bold ${compact ? "text-[10px]" : "text-xs"} mb-0.5`}
                style={{ color: subject.color }}
            >
                {formatTime(start_time)} – {formatTime(end_time)}
            </p>

            {/* Subject name */}
            <p className="font-semibold text-gray-900 dark:text-white truncate leading-tight">
                {subject.name}
            </p>

            {/* Group code or classroom */}
            {!compact && (
                <div className="flex items-center gap-1 mt-1 text-gray-500 dark:text-gray-400 text-xs truncate">
                    {classroom ? (
                        classroom.startsWith("http") ? (
                            <>
                                <span className="material-icons-round text-xs text-emerald-500">videocam</span>
                                <span>Virtual</span>
                            </>
                        ) : (
                            <>
                                <span className="material-icons-round text-xs">location_on</span>
                                <span>{classroom}</span>
                            </>
                        )
                    ) : null}
                </div>
            )}
        </div>
    );
}
