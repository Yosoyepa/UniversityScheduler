"use client";

import React, { useMemo, useState, useEffect } from "react";
import type { Subject, ClassSessionWithSubject } from "@/types";

export interface DashboardSidebarProps {
    subjects: Subject[];
    sessions: ClassSessionWithSubject[];
}

export function DashboardSidebar({ subjects, sessions }: DashboardSidebarProps) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // update every minute
        return () => clearInterval(timer);
    }, []);

    const totalCredits = useMemo(() => {
        return subjects.reduce((sum, s) => sum + s.credits, 0);
    }, [subjects]);

    // Compute next class simply based on today's day and upcoming time
    const nextClass = useMemo(() => {
        if (!sessions || sessions.length === 0) return null;
        
        // Match JS getDay() where 0=Sun, 1=Mon... to our DayOfWeek 1(Mon)-7(Sun)
        let currentDay = currentTime.getDay();
        if (currentDay === 0) currentDay = 7;
        
        const currentHours = currentTime.getHours();
        const currentMinutes = currentTime.getMinutes();
        const currentTimeStr = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
        
        // Try finding today's next class
        const todaySessions = sessions
            .filter(s => s.day_of_week === currentDay && s.start_time >= currentTimeStr)
            .sort((a, b) => a.start_time.localeCompare(b.start_time));
            
        if (todaySessions.length > 0) return todaySessions[0];
        
        // Otherwise grab first class of tomorrow
        let nextDay = currentDay + 1 > 7 ? 1 : currentDay + 1;
        const tomorrowSessions = sessions
            .filter(s => s.day_of_week === nextDay)
            .sort((a, b) => a.start_time.localeCompare(b.start_time));
        
        if (tomorrowSessions.length > 0) return { ...tomorrowSessions[0], _isTomorrow: true };
        
        return null;
    }, [sessions, currentTime]);

    // calculate remaining time
    let remainingMinutes = 0;
    if (nextClass && !(nextClass as any)._isTomorrow) {
        const [nextH, nextM] = nextClass.start_time.split(':').map(Number);
        remainingMinutes = (nextH * 60 + nextM) - (currentTime.getHours() * 60 + currentTime.getMinutes());
    }

    return (
        <div className="xl:col-span-1 space-y-6 shrink-0 xl:w-80">
            {/* NEXT UP COMPONENT */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-lg border-2 border-indigo-500 dark:border-indigo-400 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-full -mr-8 -mt-8 z-0 transition-transform group-hover:scale-110"></div>
                <div className="p-5 relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 mb-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                SIGUIENTE
                            </span>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                {nextClass ? nextClass.subject.name : "No hay clases próximas"}
                            </h3>
                            {nextClass && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                                    {nextClass.classroom?.startsWith('http') ? "Clase Virtual" : `Salón ${nextClass.classroom || 'Sin asignar'}`}
                                </p>
                            )}
                        </div>
                        {nextClass && (
                            <div className="text-right">
                                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                    {nextClass.start_time}
                                </div>
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {(nextClass as any)._isTomorrow ? 'Mañana' : 'Hoy'}
                                </div>
                            </div>
                        )}
                    </div>
                    {nextClass && !(nextClass as any)._isTomorrow && remainingMinutes > 0 && remainingMinutes <= 120 && (
                        <div className="flex items-center gap-3 mb-5">
                            <div className="flex-1 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-lg p-2 flex items-center justify-center gap-2">
                                <span className="material-icons-round text-orange-500 text-xl">timer</span>
                                <span className="font-bold text-gray-700 dark:text-gray-200">{remainingMinutes} min</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">restantes</span>
                            </div>
                        </div>
                    )}
                    {nextClass && (
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                <span className="material-icons-round text-lg">{(nextClass.classroom?.startsWith('http')) ? 'videocam' : 'location_on'}</span>
                                {(nextClass.classroom?.startsWith('http')) ? 'Ingresar' : 'Indicaciones'}
                            </button>
                            <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                                <span className="material-icons-round text-lg">info</span>
                                Detalles
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* TOTAL CREDITS */}
            <div className="bg-gradient-to-br from-primary to-blue-600 rounded-xl p-6 shadow-lg text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full group-hover:scale-110 transition duration-500"></div>
                <h3 className="text-lg font-medium opacity-90">Total de Créditos</h3>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-tight">{totalCredits}</span>
                    <span className="text-sm opacity-75">/ 20 Máx</span>
                </div>
                <div className="mt-4 w-full bg-black/20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: `${Math.min((totalCredits / 20) * 100, 100)}%` }}></div>
                </div>
            </div>

            {/* COURSE INSIGHTS MOCKUP */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-icons-round text-primary text-xl">insights</span>
                        Resumen de Materias
                    </h3>
                </div>
                <div className="space-y-4">
                    {subjects.length > 0 ? subjects.slice(0, 4).map((subject) => {
                        return (
                            <div key={subject.id} className="pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">{subject.name}</h4>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase
                                        ${subject.difficulty === 'HARD' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                          subject.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                                        {subject.difficulty === 'HARD' ? 'DIFÍCIL' : subject.difficulty === 'MEDIUM' ? 'MEDIO' : 'FÁCIL'}
                                    </span>
                                </div>
                                <div className="mt-1 flex justify-between text-xs">
                                    <span className="text-gray-500 dark:text-gray-400">Créditos: {subject.credits}</span>
                                    <span className="text-blue-600 dark:text-blue-400 font-medium truncate max-w-[120px]">{subject.subject_type.substring(0, 15)}</span>
                                </div>
                            </div>
                        )
                    }) : (
                        <p className="text-sm text-gray-500 italic text-center">Registra clases para ver un resumen.</p>
                    )}
                </div>
                {subjects.length > 4 && (
                    <button className="w-full mt-6 py-2 text-sm text-gray-500 dark:text-gray-400 font-medium border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                        Ver Todos los Cursos
                    </button>
                )}
            </div>
            
            {/* ENROLLMENT MOCKUP */}
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-start gap-3">
                    <span className="material-icons-round text-blue-600 dark:text-blue-400">info</span>
                    <div>
                        <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Período de Inscripción</p>
                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">Termina en 5 días. Revisa tus créditos optativos.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
