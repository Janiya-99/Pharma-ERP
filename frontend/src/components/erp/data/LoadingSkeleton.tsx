import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  /** Number of rows to render */
  rows?: number;
  /** Number of columns to render */
  columns?: number;
  /** Additional className */
  className?: string;
}

/**
 * Table loading skeleton using shadcn/ui Skeleton.
 * Renders a realistic table placeholder while data is loading.
 */
export function LoadingSkeleton({
  rows = 5,
  columns = 4,
  className,
}: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-erp-border-soft bg-card shadow-erp-sm overflow-hidden",
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-4 border-b border-erp-border-soft px-5 py-4 bg-muted/30">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={`header-${i}`}
            className="h-3 flex-1 rounded"
          />
        ))}
      </div>

      {/* Data rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={`row-${rowIdx}`}
          className="flex items-center gap-4 border-b border-erp-border-soft/50 px-5 py-4 last:border-b-0"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={`cell-${rowIdx}-${colIdx}`}
              className={cn(
                "h-4 rounded",
                colIdx === 0 ? "w-1/4" : "flex-1"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
