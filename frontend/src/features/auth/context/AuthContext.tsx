/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
"use client";

import { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, setTokens, clearTokens } from "@/lib/api-client";
import type { User, AuthResponse } from "@/types/entities";
import type { LoginFormData } from "../components/LoginForm";
import type { RegisterFormData } from "../components/RegisterForm";

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    login: (data: LoginFormData) => Promise<boolean>;
    register: (data: RegisterFormData) => Promise<boolean>;
    logout: () => void;
    clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Load initial user state if tokens exist
    useEffect(() => {
        let isMounted = true;

        async function loadUser() {
            // First check if a token exists in localStorage (sync check via api-client logic)
            // api-client has getAccessToken() but we can just attempt a fetch to /auth/me
            // The request function will automatically attach the token and attempt refresh if 401
            try {
                const result = await api.get<User>("/auth/me");
                if (isMounted) {
                    if (result.ok && result.value) {
                        setUser(result.value);
                    } else {
                        // Not authenticated or token invalid/expired beyond refresh
                        setUser(null);
                        clearTokens();
                    }
                }
            } catch {
                if (isMounted) setUser(null);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadUser();

        return () => {
            isMounted = false;
        };
    }, []);

    const login = useCallback(async (data: LoginFormData): Promise<boolean> => {
        setError(null);
        setLoading(true);

        const result = await api.post<AuthResponse>("/auth/login", {
            email: data.email,
            password: data.password,
        });

        if (!result.ok) {
            setError(result.error.message || "Error al iniciar sesión");
            setLoading(false);
            return false;
        }

        if (result.value) {
            const { user, tokens } = result.value;
            setTokens(tokens.access_token, tokens.refresh_token);
            setUser(user);
            setLoading(false);
            return true;
        }

        setError("Respuesta vacía del servidor");
        setLoading(false);
        return false;
    }, []);

    const register = useCallback(async (data: RegisterFormData): Promise<boolean> => {
        setError(null);
        setLoading(true);

        const result = await api.post<AuthResponse>("/auth/register", {
            email: data.email,
            password: data.password,
            full_name: data.full_name,
        });

        if (!result.ok) {
            setError(result.error.message || "Error al registrar la cuenta");
            setLoading(false);
            return false;
        }

        if (result.value) {
            const { user, tokens } = result.value;
            setTokens(tokens.access_token, tokens.refresh_token);
            setUser(user);
            setLoading(false);
            return true;
        }

        setError("Respuesta vacía del servidor");
        setLoading(false);
        return false;
    }, []);

    const logout = useCallback(() => {
        clearTokens();
        setUser(null);
        api.post("/auth/logout").catch(() => {}); // Optional backend logout, don't await
        router.push("/login");
    }, [router]);

    const clearError = useCallback(() => setError(null), []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                loading,
                error,
                login,
                register,
                logout,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
