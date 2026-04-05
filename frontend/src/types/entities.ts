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

// =============================================================================
// Auth Types
// =============================================================================

export interface User {
    id: UUID;
    email: string;
    full_name: string;
    is_active: boolean;
    created_at: ISODateTime;
    updated_at: ISODateTime;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
}

export interface AuthResponse {
    user: User;
    tokens: TokenResponse;
}

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
    push_notifications: boolean;
    sms_alerts: boolean;
    class_reminder_minutes: number;
    exam_reminder_days: number;
    assignment_reminder_hours: number;
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
    subject_type: SubjectType;
    professor_id: UUID | null;
    created_at: ISODateTime;
    updated_at: ISODateTime;
}

export interface ClassSession {
    id: UUID;
    subject_id: UUID;
    day_of_week: DayOfWeek;
    start_time: ISOTime;
    end_time: ISOTime;
    classroom: string | null;
    attendance_required: boolean;
}

// Extended type with subject info for calendar display
export interface ClassSessionWithSubject extends ClassSession {
    subject: Subject;
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

// =============================================================================
// Academic Progress Types (Phase 3)
// =============================================================================

export interface EvaluationCriteria {
    id: UUID;
    subject_id: UUID;
    name: string;
    weight: number;
    category: TaskCategory | null;
    created_at: ISODateTime;
    updated_at: ISODateTime;
}

export interface Grade {
    id: UUID;
    user_id: UUID;
    subject_id: UUID;
    criteria_id: UUID | null;
    task_id: UUID | null;
    score: number;
    max_score: number;
    normalized_score: number;
    graded_at: ISODateTime | null;
    notes: string | null;
    created_at: ISODateTime;
    updated_at: ISODateTime;
}

export interface SubjectAverage {
    subject_id: UUID;
    average: number;
    grades_count: number;
    criteria_count: number;
    is_complete: boolean;
}

// =============================================================================
// Phase 5 Types — Settings (expanded) & Notifications
// =============================================================================


// UserSettingsExpanded is a deprecated alias — UserSettings is now fully expanded
export type UserSettingsExpanded = UserSettings;



export type NotificationType = "TASK_COMPLETED" | "TASK_OVERDUE" | "SYSTEM";

export interface AppNotification {
    id: UUID;
    type: NotificationType;
    title: string;
    message: string;
    is_read: boolean;
    related_entity_id: UUID | null;
    created_at: ISODateTime;
}

export interface NotificationListResponse {
    data: AppNotification[];
    unread_count: number;
}

export interface UnreadCountResponse {
    unread_count: number;
}

export interface UpdateSettingsPayload {
    dark_mode?: boolean;
    email_notifications?: boolean;
    push_notifications?: boolean;
    sms_alerts?: boolean;
    class_reminder_minutes?: number;
    exam_reminder_days?: number;
    assignment_reminder_hours?: number;
}

export interface UpdateProfilePayload {
    full_name?: string;
}

// =============================================================================
// Phase 6 Types — Professors Directory & Tutoring
// =============================================================================

export type OfficeHourLocationType = "OFFICE" | "LAB" | "VIRTUAL";

export type TutoringSessionStatus = "SCHEDULED" | "CANCELLED" | "COMPLETED";

export interface OfficeHour {
    id: UUID;
    professor_id: UUID;
    day_of_week: DayOfWeek; // 1=Mon, 7=Sun
    start_time: ISOTime;
    end_time: ISOTime;
    location_type: OfficeHourLocationType;
    location_details: string | null;
}

export interface Professor {
    id: UUID;
    user_id: UUID;
    name: string;
    email: string | null;
    department: string | null;
    office_hours: OfficeHour[];
    is_available_now: boolean;
    created_at: ISODateTime;
    updated_at: ISODateTime;
}

export interface TutoringSession {
    id: UUID;
    professor_id: UUID;
    user_id: UUID;
    date: ISODate;
    start_time: ISOTime;
    end_time: ISOTime;
    notes: string | null;
    meeting_link: string | null;
    status: TutoringSessionStatus;
    created_at: ISODateTime;
    updated_at: ISODateTime;
}

// -- Request payloads --

export interface CreateOfficeHourPayload {
    day_of_week: number;
    start_time: ISOTime;
    end_time: ISOTime;
    location_type?: OfficeHourLocationType;
    location_details?: string | null;
}

export interface CreateProfessorPayload {
    name: string;
    email?: string | null;
    department?: string | null;
    office_hours?: CreateOfficeHourPayload[];
}

export interface UpdateProfessorPayload {
    name?: string;
    email?: string | null;
    department?: string | null;
}

export interface ScheduleTutoringPayload {
    professor_id: UUID;
    date: ISODate;
    start_time: ISOTime;
    end_time: ISOTime;
    notes?: string | null;
    meeting_link?: string | null;
}
