import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormLabelProps {
  /** Label text */
  children: ReactNode;
  /** HTML for attribute */
  htmlFor?: string;
  /** Whether field is required */
  required?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Standardized form label with required indicator.
 * Typography: text-sm font-medium
 */
export function FormLabel({
  children,
  htmlFor,
  required,
  className,
}: FormLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("text-sm font-medium text-foreground", className)}
    >
      {children}
      {required && (
        <span className="ml-0.5 text-red-500" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
