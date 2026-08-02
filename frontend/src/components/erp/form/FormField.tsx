import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FormLabel } from "./FormLabel";
import { FormError } from "./FormError";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Field label */
  label?: string;
  /** Whether field is required */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Helper text below input */
  helperText?: string;
  /** Render custom input (overrides default <input>) */
  children?: ReactNode;
  /** Container className */
  containerClassName?: string;
}

/**
 * Standardized form field with label, input, error, and helper text.
 * Uses the ERP design system input styling.
 */
export function FormField({
  label,
  required,
  error,
  helperText,
  children,
  containerClassName,
  className,
  id,
  ...inputProps
}: FormFieldProps) {
  const fieldId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <FormLabel htmlFor={fieldId} required={required}>
          {label}
        </FormLabel>
      )}

      {children || (
        <input
          id={fieldId}
          className={cn(
            "w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground shadow-sm transition-all duration-150",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-[#4854CC]/20",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
              : "border-slate-300 focus:border-slate-500",
            className
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            error
              ? `${fieldId}-error`
              : helperText
                ? `${fieldId}-helper`
                : undefined
          }
          {...inputProps}
        />
      )}

      {error && <FormError message={error} />}
      {!error && helperText && (
        <p
          id={`${fieldId}-helper`}
          className="text-xs text-muted-foreground"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
