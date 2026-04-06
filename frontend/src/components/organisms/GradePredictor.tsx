/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
"use client";

import React, { useState } from "react";
import { MaterialIcon } from "../atoms/Icon";
import { Button } from "../atoms/Button";
import type { Subject } from "@/types";

interface GradePredictorProps {
    subjects: Subject[];
    selectedSubjectId?: string;
}

export function GradePredictor({ subjects, selectedSubjectId }: GradePredictorProps) {
    const [targetGrade, setTargetGrade] = useState<number>(4.0);
    const [examWeight, setExamWeight] = useState<number>(40);

    const activeSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

    // Mock calculation logic to predict required score
    // Assumes target format is out of 5.0
    const neededScore = Math.min(5.0, targetGrade + ((5.0 - targetGrade) * (examWeight / 100) * 1.5));

    return (
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-indigo-50 dark:bg-primary/20 rounded-lg text-primary">
                    <MaterialIcon name="calculate" size="md" />
                </div>
                <h3 className="text-gray-900 dark:text-white font-bold text-lg">Predecir mi Nota</h3>
            </div>
            
            <form className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                        Materia
                    </label>
                    <select 
                        disabled
                        value={activeSubject?.id || ""}
                        className="form-select bg-gray-50 dark:bg-surface-darker border-border-light dark:border-border-dark rounded-lg text-gray-900 dark:text-white text-sm w-full focus:ring-primary opacity-80"
                    >
                        {activeSubject && <option value={activeSubject.id}>{activeSubject.name}</option>}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                        Nota Final Esperada
                    </label>
                    <div className="flex items-center bg-gray-50 dark:bg-surface-darker border border-border-light dark:border-border-dark rounded-lg px-3 h-10 focus-within:ring-2 focus-within:ring-primary transition-all">
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            value={targetGrade}
                            onChange={(e) => setTargetGrade(Number(e.target.value))}
                            className="bg-transparent border-none text-gray-900 dark:text-white text-sm w-full p-0 focus:ring-0" 
                        />
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">/ 5.0</span>
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                        Peso del Examen Final
                    </label>
                    <div className="flex items-center bg-gray-50 dark:bg-surface-darker border border-border-light dark:border-border-dark rounded-lg px-3 h-10 focus-within:ring-2 focus-within:ring-primary transition-all">
                        <input
                            type="number"
                            step="1"
                            min="0"
                            max="100"
                            value={examWeight}
                            onChange={(e) => setExamWeight(Number(e.target.value))}
                            className="bg-transparent border-none text-gray-900 dark:text-white text-sm w-full p-0 focus:ring-0" 
                        />
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">%</span>
                    </div>
                </div>

                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg p-3 my-2 border border-indigo-100 dark:border-indigo-900/30">
                    <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Cálculo:</p>
                    <p className="text-gray-900 dark:text-white text-sm">
                        Para sacar <span className="text-primary font-bold">{targetGrade.toFixed(1)}</span> en total, necesitas al menos <span className="text-accent-red font-bold">{neededScore > 5.0 ? "Imposible" : neededScore.toFixed(1)}</span> en el examen final.
                    </p>
                </div>

                <Button className="w-full shadow-md" type="button" onClick={() => {}}>
                    Recalcular
                </Button>
            </form>
        </div>
    );
}
