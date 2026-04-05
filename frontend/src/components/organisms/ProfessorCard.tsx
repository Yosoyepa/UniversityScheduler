"use client";

/**
 * ProfessorCard — Organism component.
 *
 * Displays a professor's info, office hours, and provides a "Book Meeting"
 * action. Shows an availability dot when the professor has an active office
 * hour block right now (calculated client-side from the schedule).
 *
 * Follows frontend-atomic-design skill: organism composed of atoms + molecules.
 */

import React, { useMemo } from "react";
import type { OfficeHour, Professor } from "@/types/entities";

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------

const DAY_NAMES = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatTime(t: string): string {
    const [h, m] = t.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

function groupOfficeHoursBySchedule(ohs: OfficeHour[]): string[] {
    if (!ohs.length) return [];
    // Merge consecutive same-slot days whenever possible — simple grouping
    const bySlot: Record<string, number[]> = {};
    ohs.forEach((oh) => {
        const slot = `${oh.start_time}-${oh.end_time}`;
        if (!bySlot[slot]) bySlot[slot] = [];
        bySlot[slot].push(oh.day_of_week);
    });
    return Object.entries(bySlot).map(([slot, days]) => {
        const [start, end] = slot.split("-");
        const dayStr = days
            .sort((a, b) => a - b)
            .map((d) => DAY_NAMES[d])
            .join(", ");
        return `${dayStr}: ${formatTime(start)} - ${formatTime(end)}`;
    });
}

/** Returns the first letter(s) of a name for use as avatar fallback. */
function getInitials(name: string): string {
    return name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("");
}

/** Deterministic pastel hue from a string. */
function nameToHue(name: string): number {
    let hash = 0;
    for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
    return Math.abs(hash) % 360;
}

// -------------------------------------------------------------------------
// Props
// -------------------------------------------------------------------------

interface ProfessorCardProps {
    professor: Professor;
    onBook: (professor: Professor) => void;
    onDelete?: (professorId: string) => void;
}

// -------------------------------------------------------------------------
// Component
// -------------------------------------------------------------------------

export function ProfessorCard({ professor, onBook, onDelete }: ProfessorCardProps) {
    const scheduleLines = useMemo(
        () => groupOfficeHoursBySchedule(professor.office_hours),
        [professor.office_hours]
    );

    const hue = useMemo(() => nameToHue(professor.name), [professor.name]);

    // Split office hours by type for separate display blocks
    const officeHours = professor.office_hours.filter(
        (oh) => oh.location_type === "OFFICE"
    );
    const labHours = professor.office_hours.filter(
        (oh) => oh.location_type === "LAB"
    );
    const virtualHours = professor.office_hours.filter(
        (oh) => oh.location_type === "VIRTUAL"
    );

    const officeLines = groupOfficeHoursBySchedule(officeHours);
    const labLines = groupOfficeHoursBySchedule(labHours);
    const virtualLines = groupOfficeHoursBySchedule(virtualHours);

    const noSchedule = scheduleLines.length === 0;

    return (
        <article
            className="professor-card"
            aria-label={`Professor card: ${professor.name}`}
        >
            {/* Header */}
            <div className="professor-card__header">
                <div className="professor-card__avatar-wrap">
                    {/* Avatar with initials fallback */}
                    <div
                        className="professor-card__avatar"
                        style={{
                            background: `linear-gradient(135deg, hsl(${hue},70%,55%), hsl(${(hue + 40) % 360},70%,45%))`,
                        }}
                        aria-hidden="true"
                    >
                        <span className="professor-card__initials">
                            {getInitials(professor.name)}
                        </span>
                    </div>
                    {professor.is_available_now && (
                        <span
                            className="professor-card__availability-dot"
                            title="Available Now"
                            aria-label="Currently available"
                        />
                    )}
                </div>

                <div className="professor-card__name-block">
                    <h3 className="professor-card__name">{professor.name}</h3>
                    {professor.department && (
                        <p className="professor-card__department">
                            {professor.department}
                        </p>
                    )}
                </div>

                {professor.email && (
                    <a
                        href={`mailto:${professor.email}`}
                        className="professor-card__email-btn"
                        title={`Email ${professor.name}`}
                        aria-label={`Send email to ${professor.name}`}
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">
                            mail
                        </span>
                    </a>
                )}
            </div>

            {/* Office Hours blocks */}
            <div className="professor-card__schedule">
                {noSchedule ? (
                    <div className="professor-card__schedule-row professor-card__schedule-row--empty">
                        <span className="material-symbols-outlined" aria-hidden="true">
                            schedule
                        </span>
                        <div>
                            <p className="professor-card__schedule-label">Horario de Atención</p>
                            <p className="professor-card__schedule-text">
                                Aún no hay horarios configurados
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {officeLines.length > 0 && (
                            <div className="professor-card__schedule-row">
                                <span className="material-symbols-outlined" aria-hidden="true">
                                    schedule
                                </span>
                                <div>
                                    <p className="professor-card__schedule-label">
                                        Horario de Atención
                                    </p>
                                    {officeLines.map((line, i) => (
                                        <p
                                            key={i}
                                            className="professor-card__schedule-text"
                                        >
                                            {line}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                        {labLines.length > 0 && (
                            <div className="professor-card__schedule-row">
                                <span className="material-symbols-outlined" aria-hidden="true">
                                    science
                                </span>
                                <div>
                                    <p className="professor-card__schedule-label">Horas de Laboratorio</p>
                                    {labLines.map((line, i) => (
                                        <p
                                            key={i}
                                            className="professor-card__schedule-text"
                                        >
                                            {line}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                        {virtualHours.length > 0 && (
                            <div className="professor-card__schedule-row">
                                <span className="material-symbols-outlined" aria-hidden="true">
                                    videocam
                                </span>
                                <div>
                                    <p className="professor-card__schedule-label">
                                        Horas Virtuales
                                    </p>
                                    {virtualLines.map((line, i) => (
                                        <p
                                            key={i}
                                            className="professor-card__schedule-text"
                                        >
                                            {line}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* CTA Row */}
            <div className="professor-card__cta">
                <button
                    onClick={() => onBook(professor)}
                    className="professor-card__book-btn"
                    id={`book-meeting-${professor.id}`}
                >
                    <span className="material-symbols-outlined" aria-hidden="true">
                        calendar_add_on
                    </span>
                    <span>Agendar</span>
                </button>
                {onDelete ? (
                    <button
                        onClick={() => onDelete(professor.id)}
                        className="professor-card__delete-btn"
                        title="Eliminar profesor"
                        aria-label={`Eliminar a ${professor.name} del directorio`}
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">
                            delete
                        </span>
                    </button>
                ) : null}
            </div>
        </article>
    );
}
