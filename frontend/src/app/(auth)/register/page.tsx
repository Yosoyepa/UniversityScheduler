/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
    return (
        <div className="flex min-h-screen bg-white dark:bg-gray-900 flex-row-reverse">
            {/* Left Box: Branding / Image */}
            <div className="hidden lg:flex lg:flex-1 relative bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-primary to-indigo-900 opacity-90 mix-blend-multiply" />
                
                {/* Decorative abstract shapes */}
                <div className="absolute top-0 left-0 -ml-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl blend-overlay" />
                <div className="absolute bottom-0 right-0 -mr-16 -mb-16 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl blend-overlay" />

                <div className="relative z-10 flex flex-col justify-between p-12 lg:p-24 h-full w-full items-end text-right">
                    <div className="flex items-center gap-3">
                        <span className="text-white text-2xl font-black tracking-tight">UniversityScheduler</span>
                        <span className="material-icons-round text-white text-3xl">school</span>
                    </div>

                    <div className="space-y-6 flex flex-col items-end text-right">
                        <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                            Start Organizing <br />
                            <span className="text-purple-300">Your Future.</span>
                        </h1>
                        <p className="text-lg text-indigo-100 max-w-lg font-medium">
                            Join thousands of students who have optimized their university life through a robust hexagonal architecture planning tool.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Box: Form */}
            <div className="flex flex-1 flex-col justify-center items-center p-8 sm:p-12 lg:p-24">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Create an Account
                        </h2>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Join UniversityScheduler and start planning.
                        </p>
                    </div>

                    <RegisterForm />

                    <div className="text-center text-sm font-medium">
                        <span className="text-gray-500 dark:text-gray-400">Already have an account? </span>
                        <Link href="/login" className="text-primary hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                            Sign in here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
