/**
 * Authentication Service.
 *
 * Handles login, register, logout, and token management.
 */

import { api, setTokens, clearTokens, getAccessToken } from "./api-client";
import { AuthResponse, User, Result } from "@/types";

// =============================================================================
// Auth Request Types
// =============================================================================

export interface RegisterRequest {
    email: string;
    password: string;
    full_name: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

// =============================================================================
// Auth Service
// =============================================================================

/**
 * Register a new user.
 */
export async function register(
    request: RegisterRequest
): Promise<Result<AuthResponse>> {
    const result = await api.post<AuthResponse>("/auth/register", request);

    if (result.ok) {
        const { tokens } = result.value;
        setTokens(tokens.access_token, tokens.refresh_token);
    }

    return result;
}

/**
 * Login with email and password.
 */
export async function login(
    request: LoginRequest
): Promise<Result<AuthResponse>> {
    const result = await api.post<AuthResponse>("/auth/login", request);

    if (result.ok) {
        const { tokens } = result.value;
        setTokens(tokens.access_token, tokens.refresh_token);
    }

    return result;
}

/**
 * Logout the current user.
 */
export async function logout(): Promise<void> {
    // Call logout endpoint (fire and forget)
    await api.post("/auth/logout");
    clearTokens();
}

/**
 * Get the current authenticated user.
 */
export async function getCurrentUser(): Promise<Result<User>> {
    return api.get<User>("/auth/me");
}

/**
 * Check if user is authenticated (has valid token).
 */
export function isAuthenticated(): boolean {
    return getAccessToken() !== null;
}

// Export as object for convenience
export const authService = {
    register,
    login,
    logout,
    getCurrentUser,
    isAuthenticated,
};
