import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** Icon to display (defaults to Inbox) */
  icon?: ReactNode;
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Optional action button */
  action?: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Consistent empty state for tables and lists.
 */
export function EmptyState({
  icon,
  title = "No records found",
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-erp-border-soft bg-card py-16 md:py-20 shadow-erp-sm",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-erp-border-soft bg-muted">
        {icon || <Inbox className="h-6 w-6 text-muted-foreground" />}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
