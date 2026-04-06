/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
/**
 * EvaluationCriteriaForm Organism Component.
 *
 * Form to add new evaluation criteria to a subject.
 * Following Atomic Design methodology.
 */

"use client";

import { useState, FormEvent } from "react";
import { Button } from "../atoms/Button";
import { FormField } from "../molecules/FormField";
import { PlusIcon } from "../atoms/Icon";

export interface EvaluationCriteriaFormData {
    name: string;
    weight: number;
}

export interface EvaluationCriteriaFormProps {
    totalWeight: number; // For validation (can't exceed 100)
    onSubmit: (data: EvaluationCriteriaFormData) => void;
    loading?: boolean;
}

const MAX_WEIGHT = 100;

export function EvaluationCriteriaForm({
    totalWeight,
    onSubmit,
    loading = false,
}: EvaluationCriteriaFormProps) {
    const [name, setName] = useState("");
    const [weight, setWeight] = useState<number | "">("");

    const remainingWeight = MAX_WEIGHT - totalWeight;
    const isFull = remainingWeight <= 0;

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        
        if (!name.trim()) return;
        
        const weightValue = Number(weight);
        if (isNaN(weightValue) || weightValue <= 0) return;
        
        // Don't allow submission if it exceeds remaining weight (with small epsilon for float precision)
        if (weightValue > remainingWeight + 0.01) return;

        onSubmit({ name: name.trim(), weight: weightValue });
        
        // Reset form
        setName("");
        setWeight("");
    }

    return (
        <form 
            onSubmit={handleSubmit}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <FormField
                        label="Nuevo Criterio"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Parcial 1"
                        required
                        disabled={isFull || loading}
                    />
                </div>
                
                <div className="w-full sm:w-32">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Peso (%)
                    </label>
                    <input
                        type="number"
                        min="1"
                        max={remainingWeight > 0 ? remainingWeight : 100}
                        step="0.1"
                        required
                        value={weight}
                        onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
                        className={`
                            w-full rounded-lg border border-gray-300 dark:border-gray-600 
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm 
                            focus:outline-none focus:ring-2 focus:ring-blue-500
                            ${isFull ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                        placeholder={`Máx ${remainingWeight.toFixed(1)}%`}
                        disabled={isFull || loading}
                    />
                </div>

                <div className="w-full sm:w-auto">
                    <Button 
                        type="submit" 
                        disabled={isFull || loading || !name.trim() || weight === ""}
                        className="w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                        <PlusIcon size="sm" />
                        <span>Agregar</span>
                    </Button>
                </div>
            </div>
            
            {isFull && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                    Se ha completado el 100% de la evaluación para esta materia.
                </p>
            )}
            {!isFull && totalWeight > 0 && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Peso acumulado: <span className="font-medium text-gray-700 dark:text-gray-300">{totalWeight.toFixed(1)}%</span> — Resta: <span className="font-medium text-gray-700 dark:text-gray-300">{remainingWeight.toFixed(1)}%</span>
                </p>
            )}
        </form>
    );
}
