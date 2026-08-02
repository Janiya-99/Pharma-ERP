import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ── Sub-components ── */

interface PageTitleProps {
  children: ReactNode;
  className?: string;
}

export function PageTitle({ children, className }: PageTitleProps) {
  return (
    <h1
      className={cn(
        "text-2xl md:text-3xl font-semibold tracking-tight text-[#111827]",
        className
      )}
    >
      {children}
    </h1>
  );
}

interface PageDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function PageDescription({ children, className }: PageDescriptionProps) {
  return (
    <p className={cn("mt-1 text-sm text-[#6B7280]", className)}>
      {children}
    </p>
  );
}

interface PageActionsProps {
  children: ReactNode;
  className?: string;
}

export function PageActions({ children, className }: PageActionsProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-wrap items-center gap-2",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ── Main PageHeader ── */

interface PageHeaderProps {
  /** Page title text or ReactNode */
  title: ReactNode;
  /** Optional description below the title */
  description?: ReactNode;
  /** Badge or indicator next to the title */
  badge?: ReactNode;
  /** Right-aligned action buttons */
  actions?: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Standardized ERP page header.
 * Renders title, optional description, badge, and right-aligned actions.
 * Stacks vertically on mobile and horizontally on larger screens.
 */
export function PageHeader({
  title,
  description,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            {typeof title === "string" ? (
              <PageTitle>{title}</PageTitle>
            ) : (
              title
            )}
            {badge}
          </div>
          {description && (
            typeof description === "string" ? (
              <PageDescription>{description}</PageDescription>
            ) : (
              description
            )
          )}
        </div>
      </div>
      {actions && <PageActions>{actions}</PageActions>}
    </div>
  );
}
