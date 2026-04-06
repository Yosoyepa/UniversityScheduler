/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
/**
 * FormField Molecule Component.
 *
 * Combines Label + Input with error handling.
 * Following Atomic Design - molecule composed of atoms.
 */

import { InputHTMLAttributes, forwardRef, useId } from "react";
import { Label } from "../atoms/Label";
import { Input } from "../atoms/Input";

// =============================================================================
// Types
// =============================================================================

export interface FormFieldProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
    label: string;
    error?: string;
    helperText?: string;
}

// =============================================================================
// Component
// =============================================================================

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
    ({ label, error, helperText, required, className = "", ...props }, ref) => {
        const id = useId();

        return (
            <div className={`w-full ${className}`}>
                <Label htmlFor={id} required={required}>
                    {label}
                </Label>
                <Input
                    ref={ref}
                    id={id}
                    error={!!error}
                    errorMessage={error}
                    required={required}
                    {...props}
                />
                {helperText && !error && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

FormField.displayName = "FormField";
