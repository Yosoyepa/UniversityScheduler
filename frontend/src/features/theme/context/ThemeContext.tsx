"use client";

/**
 * ThemeContext — Global Dark Mode Provider
 *
 * Reads theme from localStorage on mount to avoid hydration flash.
 * Applies `class="dark"` to <html> element for Tailwind dark: utilities.
 * Syncs with backend settings on save.
 */

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";

// =============================================================================
// Types
// =============================================================================

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

// =============================================================================
// Context
// =============================================================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// =============================================================================
// Provider
// =============================================================================

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    // On mount: read from localStorage or system preference
    useEffect(() => {
        const stored = localStorage.getItem("university-scheduler-theme") as Theme | null;
        if (stored === "dark" || stored === "light") {
            setThemeState(stored);
            applyThemeToDOM(stored);
        } else {
            // Fallback to system preference
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            const initial: Theme = prefersDark ? "dark" : "light";
            setThemeState(initial);
            applyThemeToDOM(initial);
        }
        setMounted(true);
    }, []);

    const applyThemeToDOM = (t: Theme) => {
        const root = document.documentElement;
        if (t === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    };

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        applyThemeToDOM(newTheme);
        localStorage.setItem("university-scheduler-theme", newTheme);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(theme === "dark" ? "light" : "dark");
    }, [theme, setTheme]);

    // Prevent hydration mismatch — render nothing until mounted
    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <ThemeContext.Provider value={{ theme, isDark: theme === "dark", toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// =============================================================================
// Hook
// =============================================================================

export function useTheme(): ThemeContextType {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return ctx;
}
