/**
 * Type-Safe API Client Types.
 *
 * Following typescript-advanced-types skill patterns:
 * - Discriminated unions for async state
 * - Generic Result type for error handling
 * - Type-safe endpoint definitions
 */

// =============================================================================
// Async State (Discriminated Union Pattern)
// =============================================================================

export type AsyncState<T> =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; data: T }
    | { status: "error"; error: ApiError };

/** Initial idle state */
export const idle = <T>(): AsyncState<T> => ({ status: "idle" });

/** Loading state */
export const loading = <T>(): AsyncState<T> => ({ status: "loading" });

/** Success state with data */
export const success = <T>(data: T): AsyncState<T> => ({
    status: "success",
    data,
});

/** Error state */
export const error = <T>(err: ApiError): AsyncState<T> => ({
    status: "error",
    error: err,
});

// =============================================================================
// Result Type (Rust-style error handling)
// =============================================================================

export type Result<T, E = ApiError> =
    | { ok: true; value: T }
    | { ok: false; error: E };

/** Create successful result */
export const ok = <T>(value: T): Result<T> => ({ ok: true, value });

/** Create error result */
export const err = <E = ApiError>(error: E): Result<never, E> => ({
    ok: false,
    error,
});

// =============================================================================
// API Error Types
// =============================================================================

export interface ApiError {
    error: string;
    message: string;
    request_id?: string;
    timestamp?: string;
    details?: Record<string, string[]>;
}

export interface ValidationError extends ApiError {
    error: "VALIDATION_ERROR";
    details: Record<string, string[]>;
}

// =============================================================================
// API Response Types
// =============================================================================

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface MessageResponse {
    message: string;
    success: boolean;
}

// =============================================================================
// HTTP Types
// =============================================================================

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestConfig {
    method: HttpMethod;
    headers?: Record<string, string>;
    body?: unknown;
    params?: Record<string, string | number | boolean>;
}
