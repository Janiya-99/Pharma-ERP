import { cn } from "@/lib/utils";

interface FormErrorProps {
  /** Error message */
  message?: string;
  /** Additional className */
  className?: string;
}

/**
 * Standardized form error message.
 * Typography: text-xs font-medium text-red-500
 */
export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <p
      className={cn("text-xs font-medium text-red-500 mt-1", className)}
      role="alert"
    >
      {message}
    </p>
  );
}
