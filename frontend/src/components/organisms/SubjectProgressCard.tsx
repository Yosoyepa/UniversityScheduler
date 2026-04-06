"use client";

import React, { useMemo } from 'react';
import type { Subject } from '@/types';
import { useProfessors } from '@/features/professors/hooks/useProfessors';

export interface SubjectProgressCardProps {
    subject: Subject;
    average: number; // calculated from grades
}

// Pseudo-random generator based on string
const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
};

// Generate a deterministic beautiful gradient for a subject
const generateGradient = (subjectId: string, baseColor: string) => {
    const hash = hashString(subjectId);
    const deg = (hash % 360) + "deg";
    // Using baseColor mixed with dark and light variants to create an abstract mesh look
    return `linear-gradient(${deg}, ${baseColor} 0%, rgba(30, 41, 59, 0.8) 100%), radial-gradient(circle at 0% 0%, rgba(255,255,255,0.1) 0%, transparent 50%)`;
};

export function SubjectProgressCard({ subject, average }: SubjectProgressCardProps) {
    const { professors } = useProfessors();
    const professor = professors.find((p) => p.id === subject.professor_id);
    const profName = professor ? professor.name : "Sin asignar";
    
    const isPassing = average >= 3.0; // Assuming 5.0 scale where 3.0 is passing
    
    // Convert 0.0-5.0 to 0-100 scale for visual presentation as requested by user mockup ("95/100")
    // Wait, University Scheduler might be on a 5.0 scale natively (Colombia context), but the mockup says 95/100.
    // I will display the native scale (ex. 4.2 / 5.0).
    const formattedAverage = average.toFixed(1);
    const percentage = (average / 5.0) * 100;

    const bgGradient = useMemo(() => generateGradient(subject.id, subject.color), [subject]);

    return (
        <div className="group bg-white dark:bg-[#111827] rounded-xl p-5 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all shadow-lg hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3 w-2/3">
                    <div 
                        className="size-12 min-w-[48px] rounded-lg shadow-inner border border-gray-200 dark:border-gray-700 flex items-center justify-center text-white font-bold text-xl" 
                        style={{ background: bgGradient }}
                    >
                        {subject.name.substring(0, 1).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="text-gray-900 dark:text-white font-bold text-lg leading-tight group-hover:text-primary transition-colors truncate">
                            {subject.name}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
                            {subject.subject_type.replace(/_/g, ' ')} • Prof. {profName.split(' ')[0]}
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-col items-end">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">
                        {formattedAverage}
                        <span className="text-lg text-gray-400 font-medium">/5.0</span>
                    </span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isPassing ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30' : 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30'}`}>
                        {isPassing ? 'Passing' : 'Failing'}
                    </span>
                </div>
            </div>

            {/* Sparkline Trend MOCK */}
            <div className="h-16 w-full mb-4 relative opacity-70 group-hover:opacity-100 transition-opacity">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
                    <defs>
                        <linearGradient id={`grad-${subject.id}`} x1="0%" x2="0%" y1="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: subject.color, stopOpacity: 0.5 }}></stop>
                            <stop offset="100%" style={{ stopColor: subject.color, stopOpacity: 0 }}></stop>
                        </linearGradient>
                    </defs>
                    <path d="M0 35 L10 30 L20 32 L30 25 L40 28 L50 20 L60 22 L70 15 L80 10 L90 12 L100 5" fill={`url(#grad-${subject.id})`} stroke="none"></path>
                    <path d="M0 35 L10 30 L20 32 L30 25 L40 28 L50 20 L60 22 L70 15 L80 10 L90 12 L100 5" fill="none" stroke={subject.color} strokeLinecap="round" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                    
                    {/* Points */}
                    <circle cx="20" cy="32" fill={subject.color} r="1.5"></circle>
                    <circle cx="50" cy="20" fill={subject.color} r="1.5"></circle>
                    <circle cx="100" cy="5" fill="#fff" r="2.5" stroke={subject.color} strokeWidth="1.5"></circle>
                </svg>
            </div>

            {/* Breakdown MOCK */}
            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Exams (MOCKED - 40%)</span>
                        <span className="text-gray-900 dark:text-white font-medium">{formattedAverage}/5.0</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${percentage}%`, backgroundColor: subject.color }}></div>
                    </div>
                </div>
            </div>
            
            {/* Absolute accent border top */}
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: subject.color }}></div>
        </div>
    );
}
