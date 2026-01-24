/**
 * Shared TypeScript Types for University Scheduler Frontend.
 *
 * Following typescript-advanced-types skill:
 * - Discriminated unions for API state
 * - Utility types for form handling
 * - Type-safe entity definitions
 */

// =============================================================================
// Base Types
// =============================================================================

/** UUID string type for entity IDs */
export type UUID = string;

/** ISO 8601 date-time string */
export type ISODateTime = string;

/** ISO 8601 date string (YYYY-MM-DD) */
export type ISODate = string;

/** ISO 8601 time string (HH:MM:SS) */
export type ISOTime = string;

/** Hex color code (#RRGGBB) */
export type HexColor = `#${string}`;

// =============================================================================
// User & Auth Types
// =============================================================================

export interface User {
    id: UUID;
    email: string;
    full_name: string;
    is_active: boolean;
    created_at: ISODateTime;
    updated_at: ISODateTime;
}

export interface UserSettings {
    dark_mode: boolean;
    email_notifications: boolean;
    alert_preferences: {
        days_before: number[];
        hours_before: number[];
    };
}

export interface AuthTokens {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
}

export interface AuthResponse {
    user: User;
    tokens: AuthTokens;
}

// =============================================================================
// Academic Planning Types (from erd.puml)
// =============================================================================

export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD";

export type SubjectType =
    | "DISCIPLINAR_OBLIGATORIA"
    | "DISCIPLINAR_OPTATIVA"
    | "FUNDAMENTAL_OBLIGATORIA"
    | "FUNDAMENTAL_OPTATIVA"
    | "LIBRE_ELECCION"
    | "TRABAJO_DE_GRADO";

export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface Semester {
    id: UUID;
    user_id: UUID;
    name: string;
    start_date: ISODate;
    end_date: ISODate;
    is_active: boolean;
    created_at: ISODateTime;
    updated_at: ISODateTime;
}

export interface Subject {
    id: UUID;
    semester_id: UUID;
    name: string;
    group_code: string | null;
    credits: number;
    color: HexColor;
    difficulty: DifficultyLevel;
    type: SubjectType;
    professor_name: string | null;
    created_at: ISODateTime;
    updated_at: ISODateTime;
}

export interface ClassSession {
    id: UUID;
    subject_id: UUID;
    day_of_week: DayOfWeek;
    start_time: ISOTime;
    end_time: ISOTime;
    location: string | null;
    attendance_required: boolean;
}

// Extended type with subject info for calendar display
export interface ClassSessionWithSubject extends ClassSession {
    subject: Pick<Subject, "id" | "name" | "color">;
}

// =============================================================================
// Task Types (from task_lifecycle_state.puml)
// =============================================================================

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "ARCHIVED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type TaskCategory = "TASK" | "EXAM" | "PROJECT" | "READING";

export interface Task {
    id: UUID;
    user_id: UUID;
    subject_id: UUID | null;
    title: string;
    description: string | null;
    due_date: ISODateTime | null;
    status: TaskStatus;
    priority: TaskPriority;
    category: TaskCategory;
    is_synced_gcal: boolean;
    gcal_event_id: string | null;
    completed_at: ISODateTime | null;
    created_at: ISODateTime;
    updated_at: ISODateTime;
}

// Extended type with subject info for display
export interface TaskWithSubject extends Task {
    subject: Pick<Subject, "id" | "name" | "color"> | null;
}
