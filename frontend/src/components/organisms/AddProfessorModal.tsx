"use client";

/**
 * AddProfessorModal — Organism component.
 *
 * Lets the student add a new professor to their private directory,
 * optionally configuring an initial set of office hours.
 */

import React, { useState } from "react";
import type { CreateOfficeHourPayload, CreateProfessorPayload } from "@/types/entities";

interface AddProfessorModalProps {
    onConfirm: (payload: CreateProfessorPayload) => Promise<void>;
    onClose: () => void;
}

const DAYS = [
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
    { value: 7, label: "Sunday" },
];

const LOCATION_TYPES = [
    { value: "OFFICE", label: "Office" },
    { value: "LAB", label: "Lab" },
    { value: "VIRTUAL", label: "Virtual / Online" },
];

interface OfficeHourDraft extends CreateOfficeHourPayload {
    _id: string; // client-side key
}

let _draftCounter = 0;
const newDraftId = () => `oh-${++_draftCounter}`;

export function AddProfessorModal({ onConfirm, onClose }: AddProfessorModalProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [department, setDepartment] = useState("");
    const [officeHours, setOfficeHours] = useState<OfficeHourDraft[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function addOfficeHourDraft() {
        setOfficeHours((prev) => [
            ...prev,
            {
                _id: newDraftId(),
                day_of_week: 1,
                start_time: "08:00:00",
                end_time: "10:00:00",
                location_type: "OFFICE",
                location_details: null,
            },
        ]);
    }

    function removeOfficeHourDraft(id: string) {
        setOfficeHours((prev) => prev.filter((oh) => oh._id !== id));
    }

    function updateDraft(id: string, patch: Partial<OfficeHourDraft>) {
        setOfficeHours((prev) =>
            prev.map((oh) => (oh._id === id ? { ...oh, ...patch } : oh))
        );
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) {
            setError("Professor name is required.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const payload: CreateProfessorPayload = {
                name: name.trim(),
                email: email.trim() || null,
                department: department.trim() || null,
                office_hours: officeHours.map(({ _id, ...rest }) => ({
                    ...rest,
                    // Ensure HH:MM:SS format
                    start_time: rest.start_time.length === 5
                        ? `${rest.start_time}:00`
                        : rest.start_time,
                    end_time: rest.end_time.length === 5
                        ? `${rest.end_time}:00`
                        : rest.end_time,
                })),
            };
            await onConfirm(payload);
        } catch {
            setError("Failed to add professor. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-professor-title"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="modal-panel modal-panel--wide">
                {/* Header */}
                <div className="modal-header">
                    <div>
                        <h2 id="add-professor-title" className="modal-title">
                            Add Professor
                        </h2>
                        <p className="modal-subtitle">
                            Add to your personal directory
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="modal-close-btn"
                        aria-label="Close modal"
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">
                            close
                        </span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form" id="add-professor-form">
                    {/* Basic Info */}
                    <fieldset className="form-fieldset">
                        <legend className="form-fieldset__legend">Basic Information</legend>

                        <div className="form-field">
                            <label htmlFor="prof-name" className="form-label">
                                Name <span className="form-label-required">*</span>
                            </label>
                            <input
                                id="prof-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Dr. Jane Smith"
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-field">
                                <label htmlFor="prof-email" className="form-label">
                                    Email{" "}
                                    <span className="form-label-optional">(optional)</span>
                                </label>
                                <input
                                    id="prof-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="professor@university.edu"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-field">
                                <label htmlFor="prof-department" className="form-label">
                                    Department{" "}
                                    <span className="form-label-optional">(optional)</span>
                                </label>
                                <input
                                    id="prof-department"
                                    type="text"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    placeholder="Computer Science"
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </fieldset>

                    {/* Office Hours */}
                    <fieldset className="form-fieldset">
                        <legend className="form-fieldset__legend">
                            Office Hours{" "}
                            <span className="form-label-optional">(optional)</span>
                        </legend>

                        {officeHours.length === 0 && (
                            <p className="form-empty-hint">
                                No office hours added. You can add them later.
                            </p>
                        )}

                        {officeHours.map((oh) => (
                            <div key={oh._id} className="oh-draft-row">
                                <div className="form-row">
                                    <div className="form-field">
                                        <label
                                            htmlFor={`oh-day-${oh._id}`}
                                            className="form-label"
                                        >
                                            Day
                                        </label>
                                        <select
                                            id={`oh-day-${oh._id}`}
                                            value={oh.day_of_week}
                                            onChange={(e) =>
                                                updateDraft(oh._id, {
                                                    day_of_week: Number(e.target.value),
                                                })
                                            }
                                            className="form-input form-input--select"
                                        >
                                            {DAYS.map((d) => (
                                                <option key={d.value} value={d.value}>
                                                    {d.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-field">
                                        <label
                                            htmlFor={`oh-start-${oh._id}`}
                                            className="form-label"
                                        >
                                            Start
                                        </label>
                                        <input
                                            id={`oh-start-${oh._id}`}
                                            type="time"
                                            value={oh.start_time.slice(0, 5)}
                                            onChange={(e) =>
                                                updateDraft(oh._id, {
                                                    start_time: e.target.value,
                                                })
                                            }
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label
                                            htmlFor={`oh-end-${oh._id}`}
                                            className="form-label"
                                        >
                                            End
                                        </label>
                                        <input
                                            id={`oh-end-${oh._id}`}
                                            type="time"
                                            value={oh.end_time.slice(0, 5)}
                                            onChange={(e) =>
                                                updateDraft(oh._id, {
                                                    end_time: e.target.value,
                                                })
                                            }
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-row oh-draft-row__bottom">
                                    <div className="form-field">
                                        <label
                                            htmlFor={`oh-type-${oh._id}`}
                                            className="form-label"
                                        >
                                            Location Type
                                        </label>
                                        <select
                                            id={`oh-type-${oh._id}`}
                                            value={oh.location_type}
                                            onChange={(e) =>
                                                updateDraft(oh._id, {
                                                    location_type: e.target.value as
                                                        | "OFFICE"
                                                        | "LAB"
                                                        | "VIRTUAL",
                                                })
                                            }
                                            className="form-input form-input--select"
                                        >
                                            {LOCATION_TYPES.map((lt) => (
                                                <option key={lt.value} value={lt.value}>
                                                    {lt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-field">
                                        <label
                                            htmlFor={`oh-details-${oh._id}`}
                                            className="form-label"
                                        >
                                            Details{" "}
                                            <span className="form-label-optional">
                                                (room / link)
                                            </span>
                                        </label>
                                        <input
                                            id={`oh-details-${oh._id}`}
                                            type="text"
                                            value={oh.location_details ?? ""}
                                            onChange={(e) =>
                                                updateDraft(oh._id, {
                                                    location_details: e.target.value || null,
                                                })
                                            }
                                            placeholder="Room 302 / https://meet.google.com/..."
                                            className="form-input"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeOfficeHourDraft(oh._id)}
                                        className="oh-draft-row__remove"
                                        aria-label="Remove this office hour block"
                                    >
                                        <span className="material-symbols-outlined" aria-hidden="true">
                                            delete
                                        </span>
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addOfficeHourDraft}
                            className="btn btn--ghost btn--sm"
                            id="add-office-hour-row"
                        >
                            <span className="material-symbols-outlined" aria-hidden="true">
                                add
                            </span>
                            Add Office Hour Block
                        </button>
                    </fieldset>

                    {error && (
                        <p className="form-error" role="alert">
                            {error}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="modal-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn--ghost"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn--primary"
                            disabled={loading}
                            id="confirm-add-professor"
                        >
                            {loading ? (
                                <>
                                    <span className="btn-spinner" aria-hidden="true" />
                                    Saving…
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined" aria-hidden="true">
                                        person_add
                                    </span>
                                    Add Professor
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
