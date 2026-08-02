import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardGridProps {
  /** Number of columns (responsive) */
  columns?: 2 | 3 | 4;
  /** Gap between items */
  gap?: "gap-4" | "gap-5" | "gap-6";
  /** Children (KPICard, charts, etc.) */
  children: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Responsive dashboard grid wrapper.
 * Default: 1 col on mobile, 2 on tablet, 4 on desktop.
 */
export function DashboardGrid({
  columns = 4,
  gap = "gap-5",
  children,
  className,
}: DashboardGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid", gridCols[columns], gap, className)}>
      {children}
    </div>
  );
}
