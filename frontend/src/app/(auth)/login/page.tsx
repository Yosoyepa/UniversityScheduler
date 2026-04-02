import { LoginForm } from "@/features/auth/components/LoginForm";
import Link from "next/link"; // Next app router link

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Iniciar Sesión
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Accede a tu cuenta de UniversityScheduler
                    </p>
                </div>

                <div className="mt-8 flex justify-center">
                    <LoginForm />
                </div>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">¿No tienes cuenta? </span>
                    <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                        Regístrate gratis
                    </Link>
                </div>
            </div>
        </div>
    );
}
