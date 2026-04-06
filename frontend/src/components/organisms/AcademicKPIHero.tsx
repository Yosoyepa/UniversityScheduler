/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
import React from "react";
import { MaterialIcon } from "../atoms/Icon";

interface AcademicKPIHeroProps {
    gpa: number;
    trend: number;
    percentage: number;
}

export function AcademicKPIHero({ gpa, trend, percentage }: AcademicKPIHeroProps) {
    const isPositive = trend >= 0;

    return (
        <section className="bg-white dark:bg-surface-dark rounded-2xl p-6 lg:p-8 border border-border-light dark:border-border-dark relative overflow-hidden shadow-sm">
            {/* Background decorative glow */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div className="flex flex-col gap-4 max-w-lg">
                    <div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                            ¡Sigue con el gran trabajo!
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-base">
                            Tu rendimiento académico tiene una tendencia positiva este semestre. Has mantenido un promedio sólido en tus materias principales.
                        </p>
                    </div>
                    <div className="flex gap-3 mt-2">
                        <button className="bg-primary hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-primary/25 transition-all flex items-center gap-2">
                            <MaterialIcon name="download" size="sm" />
                            Certificado
                        </button>
                        <button className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-lg text-sm font-bold transition-all border border-gray-200 dark:border-slate-700">
                            Detalles
                        </button>
                    </div>
                </div>

                {/* Radial Chart */}
                <div className="relative h-48 w-48 md:h-56 md:w-56 shrink-0 flex items-center justify-center">
                    {/* Outer Glow Ring */}
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                    
                    {/* Progress Ring  using inline conic-gradient */}
                    <div 
                        className="h-full w-full rounded-full flex items-center justify-center transition-all duration-1000 ease-out"
                        style={{
                            background: `conic-gradient(var(--color-primary) ${percentage}%, var(--color-gray-200) 0deg)`
                        }}
                    >
                        {/* We use a mask or an inner div to create the donut hole */}
                        {/* For dark mode, we must make sure the inner circle matches the card bg (surface-dark) */}
                        <div className="absolute inset-[8px] bg-white dark:bg-surface-dark rounded-full flex flex-col items-center justify-center z-10">
                            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">
                                Promedio Reg.
                            </span>
                            <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
                                {gpa.toFixed(1)}
                            </span>
                            <span className={`text-sm font-bold flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full ${
                                isPositive 
                                    ? "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30" 
                                    : "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
                            }`}>
                                <MaterialIcon name={isPositive ? "trending_up" : "trending_down"} size="xs" />
                                {isPositive ? "+" : ""}{trend.toFixed(1)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
