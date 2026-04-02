"use client";

import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/atoms/Button";
import { useRouter } from "next/navigation";

export interface LoginFormData {
    email: string;
    password: string;
}

export function LoginForm() {
    const { login, loading, error, clearError } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState<LoginFormData>({
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (error) clearError();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await login(formData);
        if (success) {
            router.push("/dashboard/schedule");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-800">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Correo Electrónico
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="estudiante@universidad.edu"
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contraseña
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                />
            </div>

            <Button
                type="submit"
                variant="primary"
                className="w-full justify-center"
                disabled={loading}
            >
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
        </form>
    );
}
