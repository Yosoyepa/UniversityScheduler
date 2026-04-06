/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export function ProfileDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div ref={dropdownRef} className="relative hidden sm:block">
            {/* Avatar Button */}
            <button
                id="header-user-avatar"
                aria-haspopup="true"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 text-white font-bold text-sm shadow-md ring-2 ring-white dark:ring-slate-700 focus:outline-none focus:ring-primary focus:ring-offset-2"
            >
                {getInitials(user.full_name)}
            </button>

            {/* Dropdown Menu (Cascade Effect) */}
            <div
                className={`
                    absolute right-0 mt-2 w-64 origin-top-right rounded-xl shadow-xl 
                    border border-border-light dark:border-border-dark glass-panel
                    bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md
                    transition-all duration-200 z-50
                    ${isOpen ? "opacity-100 scale-100 translate-y-0 visible" : "opacity-0 scale-95 -translate-y-2 invisible"}
                `}
            >
                <div className="p-4 border-b border-border-light dark:border-border-dark flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 text-white flex items-center justify-center font-bold text-base shrink-0">
                        {getInitials(user.full_name)}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {user.full_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                        </p>
                    </div>
                </div>

                <div className="p-2 space-y-1">
                    <Link
                        href="/dashboard/settings"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700/60 transition-colors"
                    >
                        <span className="material-icons-round text-[20px] text-gray-500 dark:text-gray-400">
                            settings
                        </span>
                        Ajustes
                    </Link>
                    
                    {logout && (
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                logout();
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                        >
                            <span className="material-icons-round text-[20px]">
                                logout
                            </span>
                            Cerrar sesión
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
