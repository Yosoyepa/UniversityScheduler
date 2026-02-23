/**
 * ClassCard Molecule Component.
 *
 * Card displaying class session information for schedule grid.
 * Following Atomic Design - molecule composed of atoms.
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
    // Convert HH:MM:SS to HH:MM
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
    const { subject, start_time, end_time, location } = session;

    return (
        <div
            className={`
        rounded-lg border-l-4 p-2 cursor-pointer
        hover:opacity-90 transition-opacity
        ${compact ? "text-xs" : "text-sm"}
      `}
            style={{
                backgroundColor: `${subject.color}20`,
                borderLeftColor: subject.color,
            }}
            onClick={onClick}
        >
            {/* Subject name */}
            <p
                className="font-semibold truncate"
                style={{ color: subject.color }}
            >
                {subject.name}
            </p>

            {/* Time range */}
            <p className="text-gray-600 dark:text-gray-400">
                {formatTime(start_time)} - {formatTime(end_time)}
            </p>

            {/* Location (if not compact) */}
            {!compact && location && (
                <p className="text-gray-500 dark:text-gray-500 truncate mt-1">
                    📍 {location}
                </p>
            )}
        </div>
    );
}
