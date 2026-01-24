/**
 * Type-Safe API Client.
 *
 * Centralized HTTP client for backend API communication.
 * Handles authentication, error transformation, and type safety.
 *
 * Following typescript-advanced-types skill:
 * - Generic request methods with type inference
 * - Result type for explicit error handling
 */

import { ApiError, Result, ok, err } from "@/types/api";

// Environment configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_VERSION = "/api/v1";

// Storage keys
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

/**
 * Get the stored access token.
 */
export function getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get the stored refresh token.
 */
export function getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Store authentication tokens.
 */
export function setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Clear stored tokens (logout).
 */
export function clearTokens(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Build full URL with optional query parameters.
 */
function buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean>
): string {
    const url = new URL(`${API_BASE_URL}${API_VERSION}${endpoint}`);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, String(value));
        });
    }

    return url.toString();
}

/**
 * Transform API error response to ApiError type.
 */
async function parseError(response: Response): Promise<ApiError> {
    try {
        const data = await response.json();
        return {
            error: data.error || "UNKNOWN_ERROR",
            message: data.message || "An unexpected error occurred",
            request_id: data.request_id,
            timestamp: data.timestamp,
            details: data.details,
        };
    } catch {
        return {
            error: "NETWORK_ERROR",
            message: `HTTP ${response.status}: ${response.statusText}`,
        };
    }
}

/**
 * Generic API request function.
 *
 * @param endpoint - API endpoint (e.g., "/auth/login")
 * @param options - Request options
 * @returns Result<T> with either data or error
 */
export async function request<T>(
    endpoint: string,
    options: {
        method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
        body?: unknown;
        params?: Record<string, string | number | boolean>;
        auth?: boolean;
    } = {}
): Promise<Result<T>> {
    const { method = "GET", body, params, auth = true } = options;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    // Add auth header if required and token exists
    if (auth) {
        const token = getAccessToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }

    try {
        const response = await fetch(buildUrl(endpoint, params), {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            // Handle 401 - attempt token refresh
            if (response.status === 401 && auth) {
                const refreshed = await attemptTokenRefresh();
                if (refreshed) {
                    // Retry the original request
                    return request<T>(endpoint, options);
                }
                // Refresh failed, clear tokens and return error
                clearTokens();
            }

            const error = await parseError(response);
            return err(error);
        }

        // Handle empty responses (204 No Content)
        if (response.status === 204) {
            return ok(undefined as T);
        }

        const data = await response.json();
        return ok(data as T);
    } catch (e) {
        return err({
            error: "NETWORK_ERROR",
            message: e instanceof Error ? e.message : "Network request failed",
        });
    }
}

/**
 * Attempt to refresh the access token.
 */
async function attemptTokenRefresh(): Promise<boolean> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
        const response = await fetch(buildUrl("/auth/refresh"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!response.ok) return false;

        const data = await response.json();
        setTokens(data.access_token, data.refresh_token);
        return true;
    } catch {
        return false;
    }
}

// =============================================================================
// Convenience Methods
// =============================================================================

export const api = {
    get: <T>(
        endpoint: string,
        params?: Record<string, string | number | boolean>
    ) => request<T>(endpoint, { method: "GET", params }),

    post: <T>(endpoint: string, body?: unknown) =>
        request<T>(endpoint, { method: "POST", body }),

    put: <T>(endpoint: string, body?: unknown) =>
        request<T>(endpoint, { method: "PUT", body }),

    patch: <T>(endpoint: string, body?: unknown) =>
        request<T>(endpoint, { method: "PATCH", body }),

    delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};
