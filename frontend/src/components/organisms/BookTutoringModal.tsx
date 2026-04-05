"use client";

/**
 * BookTutoringModal — Organism component.
 *
 * Allows the student to book a tutoring session with a professor.
 * Sessions are self-confirmed (created as SCHEDULED automatically).
 */

import React, { useState } from "react";
import type { Professor, ScheduleTutoringPayload } from "@/types/entities";

interface BookTutoringModalProps {
    professor: Professor;
    onConfirm: (payload: ScheduleTutoringPayload) => Promise<void>;
    onClose: () => void;
}

export function BookTutoringModal({
    professor,
    onConfirm,
    onClose,
}: BookTutoringModalProps) {
    const today = new Date().toISOString().split("T")[0];

    const [date, setDate] = useState(today);
    const [startTime, setStartTime] = useState("10:00");
    const [endTime, setEndTime] = useState("11:00");
    const [notes, setNotes] = useState("");
    const [meetingLink, setMeetingLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (endTime <= startTime) {
            setError("La hora de fin debe ser posterior a la de inicio.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await onConfirm({
                professor_id: professor.id,
                date,
                start_time: `${startTime}:00`,
                end_time: `${endTime}:00`,
                notes: notes || null,
                meeting_link: meetingLink || null,
            });
        } catch {
            setError("Fallo al agendar la sesión. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-modal-title"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="modal-panel !max-w-xl">
                {/* Header */}
                <div className="modal-header">
                    <div>
                        <h2 id="book-modal-title" className="modal-title">
                            Agendar Tutoría
                        </h2>
                        <p className="modal-subtitle">con {professor.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="modal-close-btn"
                        aria-label="Cerrar modal"
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">
                            close
                        </span>
                    </button>
                </div>

                {/* Info banner */}
                <div className="book-modal__info-banner">
                    <span className="material-symbols-outlined" aria-hidden="true">
                        info
                    </span>
                    <p>
                        Las sesiones se registrarán como pre-confirmadas. Asegúrate de haber 
                        coordinado con el profesor antes de agendar.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="modal-form" id="book-tutoring-form">
                    <div className="form-field">
                        <label htmlFor="session-date" className="form-label">
                            Fecha
                        </label>
                        <input
                            id="session-date"
                            type="date"
                            value={date}
                            min={today}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-field">
                            <label htmlFor="session-start" className="form-label">
                                Hora de Inicio
                            </label>
                            <input
                                id="session-start"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                                className="form-input"
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="session-end" className="form-label">
                                Hora de Fin
                            </label>
                            <input
                                id="session-end"
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-field">
                        <label htmlFor="session-notes" className="form-label">
                            Notas{" "}
                            <span className="form-label-optional">(opcional)</span>
                        </label>
                        <textarea
                            id="session-notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Temas a discutir, preguntas específicas..."
                            rows={3}
                            className="form-input form-input--textarea"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="session-link" className="form-label">
                            Enlace de Reunión{" "}
                            <span className="form-label-optional">(opcional)</span>
                        </label>
                        <input
                            id="session-link"
                            type="url"
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                            placeholder="https://meet.google.com/..."
                            className="form-input"
                        />
                    </div>

                    {error ? (
                        <p className="form-error" role="alert">
                            {error}
                        </p>
                    ) : null}

                    {/* Actions */}
                    <div className="modal-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn--ghost"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn--primary"
                            disabled={loading}
                            id="confirm-book-tutoring"
                        >
                            {loading ? (
                                <>
                                    <span
                                        className="btn-spinner"
                                        aria-hidden="true"
                                    />
                                    Agendando…
                                </>
                            ) : (
                                <>
                                    <span
                                        className="material-symbols-outlined"
                                        aria-hidden="true"
                                    >
                                        calendar_add_on
                                    </span>
                                    Confirmar
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
