"use client";

/**
 * /dashboard/directory — Professors Directory & Tutoring Page.
 *
 * Displays the user's private professor directory with:
 *  - Searchable professor card grid
 *  - Availability badge (real-time)
 *  - Office hours schedule
 *  - Book Meeting / Tutoring session flow
 *  - Add professor CTA
 *
 * Following frontend-app-router skill:
 *  - "use client" for state / interactivity
 *  - Single-purpose page component
 *  - Delegates domain state to useProfessors hook
 */

import React, { useMemo, useState } from "react";
import { useProfessors } from "@/features/professors/hooks/useProfessors";
import { ProfessorCard } from "@/components/organisms/ProfessorCard";
import { BookTutoringModal } from "@/components/organisms/BookTutoringModal";
import { AddProfessorModal } from "@/components/organisms/AddProfessorModal";
import type {
    CreateProfessorPayload,
    Professor,
    ScheduleTutoringPayload,
} from "@/types/entities";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
    SCHEDULED: { label: "Scheduled", cls: "session-status--scheduled" },
    COMPLETED: { label: "Completed", cls: "session-status--completed" },
    CANCELLED: { label: "Cancelled", cls: "session-status--cancelled" },
};

function formatDate(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatTime(t: string) {
    const [h, m] = t.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function DirectoryPage() {
    const {
        professors,
        sessions,
        loading,
        error,
        createProfessor,
        deleteProfessor,
        scheduleTutoring,
        cancelSession,
        completeSession,
    } = useProfessors();

    // ---- UI local state ----
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [bookTarget, setBookTarget] = useState<Professor | null>(null);
    const [activeTab, setActiveTab] = useState<"directory" | "sessions">("directory");
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // ---- Search filter ----
    const filtered = useMemo(() => {
        if (!searchQuery.trim()) return professors;
        const q = searchQuery.toLowerCase();
        return professors.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                (p.department ?? "").toLowerCase().includes(q) ||
                (p.email ?? "").toLowerCase().includes(q)
        );
    }, [professors, searchQuery]);

    // ---- Handlers ----
    async function handleAddProfessor(payload: CreateProfessorPayload) {
        await createProfessor(payload);
        setShowAddModal(false);
    }

    async function handleBook(payload: ScheduleTutoringPayload) {
        await scheduleTutoring(payload);
        setBookTarget(null);
    }

    async function handleDelete(id: string) {
        if (deleteConfirm !== id) {
            setDeleteConfirm(id);
            return;
        }
        await deleteProfessor(id);
        setDeleteConfirm(null);
    }

    const availableCount = professors.filter((p) => p.is_available_now).length;
    const scheduledCount = sessions.filter((s) => s.status === "SCHEDULED").length;

    // ---- Render ----
    return (
        <>
            <div className="directory-page">
                {/* ---- Page Header ---- */}
                <div className="directory-page__header">
                    <div>
                        <h1 className="directory-page__title">Directorio de Profesores y Tutorías</h1>
                        <p className="directory-page__subtitle">
                            Gestiona tu directorio personal de profesores y agenda sesiones de tutoría.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn btn--primary"
                        id="header-add-professor-btn"
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">
                            person_add
                        </span>
                        Añadir Profesor
                    </button>
                </div>

                {/* ---- Stats Row ---- */}
                <div className="directory-stats">
                    <div className="directory-stat">
                        <span className="material-symbols-outlined" aria-hidden="true">
                            group
                        </span>
                        <span className="directory-stat__value">{professors.length}</span>
                        <span className="directory-stat__label">Profesores</span>
                    </div>
                    <div className="directory-stat directory-stat--available">
                        <span className="material-symbols-outlined" aria-hidden="true">
                            radio_button_checked
                        </span>
                        <span className="directory-stat__value">{availableCount}</span>
                        <span className="directory-stat__label">Disponibles Ahora</span>
                    </div>
                    <div className="directory-stat">
                        <span className="material-symbols-outlined" aria-hidden="true">
                            event
                        </span>
                        <span className="directory-stat__value">{scheduledCount}</span>
                        <span className="directory-stat__label">Próximas Sesiones</span>
                    </div>
                </div>

                {/* ---- Tab Navigation ---- */}
                <div className="directory-tabs" role="tablist">
                    <button
                        role="tab"
                        aria-selected={activeTab === "directory"}
                        className={`directory-tab ${activeTab === "directory" ? "directory-tab--active" : ""}`}
                        onClick={() => setActiveTab("directory")}
                        id="tab-directory"
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">
                            contacts
                        </span>
                        Directorio
                    </button>
                    <button
                        role="tab"
                        aria-selected={activeTab === "sessions"}
                        className={`directory-tab ${activeTab === "sessions" ? "directory-tab--active" : ""}`}
                        onClick={() => setActiveTab("sessions")}
                        id="tab-sessions"
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">
                            calendar_month
                        </span>
                        Mis Sesiones
                        {scheduledCount > 0 ? (
                            <span className="directory-tab__badge">{scheduledCount}</span>
                        ) : null}
                    </button>
                </div>

                {/* ---- Error Banner ---- */}
                {error ? (
                    <div className="alert alert--error" role="alert">
                        <span className="material-symbols-outlined">error</span>
                        {error}
                    </div>
                ) : null}

                {/* ---- DIRECTORY TAB ---- */}
                {activeTab === "directory" && (
                    <>
                        {/* Search */}
                        <div className="directory-search-wrap">
                            <label
                                htmlFor="professor-search"
                                className="sr-only"
                            >
                                Buscar profesores
                            </label>
                            <span
                                className="material-symbols-outlined directory-search__icon"
                                aria-hidden="true"
                            >
                                search
                            </span>
                            <input
                                id="professor-search"
                                type="search"
                                placeholder="Buscar por nombre, departamento o correo..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="directory-search__input"
                            />
                        </div>

                        {/* Loading skeleton */}
                        {loading && (
                            <div className="professor-grid">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="professor-card professor-card--skeleton" />
                                ))}
                            </div>
                        )}

                        {/* Empty state */}
                        {!loading && filtered.length === 0 && (
                            <div className="directory-empty">
                                <span
                                    className="material-symbols-outlined directory-empty__icon"
                                    aria-hidden="true"
                                >
                                    {searchQuery ? "search_off" : "contacts"}
                                </span>
                                <h2 className="directory-empty__title">
                                    {searchQuery
                                        ? "Ningún profesor coincide con tu búsqueda"
                                        : "Tu directorio está vacío"}
                                </h2>
                                <p className="directory-empty__hint">
                                    {searchQuery
                                        ? "Intenta con otras palabras."
                                        : "Añade a tu primer profesor para comenzar."}
                                </p>
                                {!searchQuery && (
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="btn btn--primary"
                                        id="empty-add-professor-btn"
                                    >
                                        <span
                                            className="material-symbols-outlined"
                                            aria-hidden="true"
                                        >
                                            person_add
                                        </span>
                                        Añadir mi primer profesor
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Grid */}
                        {!loading && filtered.length > 0 && (
                            <div className="professor-grid">
                                {filtered.map((professor) => (
                                    <div key={professor.id} className="professor-grid__item">
                                        {deleteConfirm === professor.id && (
                                            <div
                                                className="professor-delete-confirm"
                                                role="alert"
                                            >
                                                <p>¿Eliminar a {professor.name}?</p>
                                                <div className="professor-delete-confirm__actions">
                                                    <button
                                                        onClick={() => setDeleteConfirm(null)}
                                                        className="btn btn--ghost btn--sm"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(professor.id)}
                                                        className="btn btn--danger btn--sm"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        <ProfessorCard
                                            professor={professor}
                                            onBook={setBookTarget}
                                            onDelete={handleDelete}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ---- SESSIONS TAB ---- */}
                {activeTab === "sessions" && (
                    <div className="sessions-list">
                        {sessions.length === 0 && (
                            <div className="directory-empty">
                                <span
                                    className="material-symbols-outlined directory-empty__icon"
                                    aria-hidden="true"
                                >
                                    event_busy
                                </span>
                                <h2 className="directory-empty__title">
                                    Aún no hay sesiones de tutoría
                                </h2>
                                <p className="directory-empty__hint">
                                    Ve a la pestaña Directorio y haz clic en "Agendar" en algún profesor.
                                </p>
                            </div>
                        )}

                        {sessions.map((session) => {
                            const professor = professors.find(
                                (p) => p.id === session.professor_id
                            );
                            const statusInfo =
                                STATUS_LABELS[session.status] ?? STATUS_LABELS.SCHEDULED;

                            return (
                                <div key={session.id} className="session-row">
                                    <div className="session-row__meta">
                                        <p className="session-row__date">
                                            {formatDate(session.date)}
                                        </p>
                                        <p className="session-row__time">
                                            {formatTime(session.start_time)} –{" "}
                                            {formatTime(session.end_time)}
                                        </p>
                                    </div>

                                    <div className="session-row__info">
                                        <p className="session-row__professor">
                                            {professor?.name ?? "Profesor desconocido"}
                                        </p>
                                        {session.notes && (
                                            <p className="session-row__notes">
                                                {session.notes}
                                            </p>
                                        )}
                                    </div>

                                    <span
                                        className={`session-status ${statusInfo.cls}`}
                                    >
                                        {statusInfo.label}
                                    </span>

                                    {session.status === "SCHEDULED" && (
                                        <div className="session-row__actions">
                                            <button
                                                onClick={() => completeSession(session.id)}
                                                className="btn btn--ghost btn--sm"
                                                title="Marcar como completada"
                                            >
                                                <span
                                                    className="material-symbols-outlined"
                                                    aria-hidden="true"
                                                >
                                                    check_circle
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => cancelSession(session.id)}
                                                className="btn btn--ghost btn--sm"
                                                title="Cancelar sesión"
                                            >
                                                <span
                                                    className="material-symbols-outlined"
                                                    aria-hidden="true"
                                                >
                                                    cancel
                                                </span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ---- Modals ---- */}
            {showAddModal && (
                <AddProfessorModal
                    onConfirm={handleAddProfessor}
                    onClose={() => setShowAddModal(false)}
                />
            )}

            {bookTarget && (
                <BookTutoringModal
                    professor={bookTarget}
                    onConfirm={handleBook}
                    onClose={() => setBookTarget(null)}
                />
            )}
        </>
    );
}
