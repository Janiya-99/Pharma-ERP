import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  /** Section heading */
  title?: string;
  /** Section description */
  description?: string;
  /** Number of grid columns on desktop */
  columns?: 1 | 2 | 3;
  /** Gap between fields */
  gap?: "gap-3" | "gap-4" | "gap-5";
  /** Child form fields */
  children: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Standard ERP form section with responsive grid layout.
 * Uses card wrapper with title/description and auto-responsive grid.
 *
 * Desktop: 2 columns (or custom).
 * Mobile: 1 column.
 */
export function FormSection({
  title,
  description,
  columns = 2,
  gap = "gap-4",
  children,
  className,
}: FormSectionProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-[0_8px_30px_rgba(2,62,138,0.08)] backdrop-blur-xl md:p-5",
        className
      )}
    >
      {(title || description) && (
        <div className="mb-5">
          {title && (
            <h3 className="text-lg font-semibold text-[#111827]">{title}</h3>
          )}
          {description && (
            <p className="mt-0.5 text-sm text-[#6B7280]">
              {description}
            </p>
          )}
        </div>
      )}
      <div className={cn("grid", gridCols[columns], gap)}>
        {children}
      </div>
    </div>
  );
}
