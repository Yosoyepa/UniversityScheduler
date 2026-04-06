/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
import { LoginForm } from "@/features/auth/components/LoginForm";
import Link from "next/link"; // Next app router link

export default function LoginPage() {
    return (
        <div className="flex min-h-screen bg-white dark:bg-gray-900">
            {/* Left Box: Branding / Image */}
            <div className="hidden lg:flex lg:flex-1 relative bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-primary to-blue-900 opacity-90 mix-blend-multiply" />
                
                {/* Decorative abstract shapes */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl blend-overlay" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl blend-overlay" />

                <div className="relative z-10 flex flex-col justify-between p-12 lg:p-24 h-full w-full">
                    <div className="flex items-center gap-3">
                        <span className="material-icons-round text-white text-3xl">school</span>
                        <span className="text-white text-2xl font-black tracking-tight">UniversityScheduler</span>
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                            Your Academic Life, <br />
                            <span className="text-blue-300">Perfectly Orchestrated.</span>
                        </h1>
                        <p className="text-lg text-blue-100 max-w-lg font-medium">
                            Manage schedules, track grades, and balance your deliverables with our all-in-one student workspace designed for success.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-blue-200/60 font-medium">
                        <span>v1.0.0-beta.2</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400/50" />
                        <span>University Scheduler Platform</span>
                    </div>
                </div>
            </div>

            {/* Right Box: Form */}
            <div className="flex flex-1 flex-col justify-center items-center p-8 sm:p-12 lg:p-24">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Welcome Back
                        </h2>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Please enter your credentials to access your dashboard.
                        </p>
                    </div>

                    <LoginForm />

                    <div className="text-center text-sm font-medium">
                        <span className="text-gray-500 dark:text-gray-400">Don't have an account? </span>
                        <Link href="/register" className="text-primary hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                            Sign up for free
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
