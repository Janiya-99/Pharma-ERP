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
        "text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900",
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
    <p className={cn("mt-1 text-xs sm:text-sm font-medium text-slate-500 leading-relaxed", className)}>
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
        "flex shrink-0 flex-wrap items-center gap-2.5",
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
 * Renders title, optional description, badge, and right-aligned actions
 * inside a modern covered card with light glassmorphism and subtle watermark.
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
        "relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-gradient-to-r from-white/95 via-slate-50/90 to-blue-50/30 backdrop-blur-xl p-5 sm:p-6 shadow-xs mb-6 transition-all duration-300",
        className
      )}
    >
      {/* Subtle ambient light */}
      <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

      {/* Subtle geometric SVG watermark */}
      <div className="absolute right-0 top-0 bottom-0 w-64 opacity-[0.035] pointer-events-none select-none text-slate-900 overflow-hidden">
        <svg viewBox="0 0 200 100" className="w-full h-full object-cover" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M 20,20 L 50,5 L 80,20 L 80,50 L 50,65 L 20,50 Z" />
          <path d="M 80,20 L 110,5 L 140,20 L 140,50 L 110,65 L 80,50 Z" />
          <path d="M 50,65 L 80,50 L 110,65 L 110,95 L 80,110 L 50,95 Z" />
          <circle cx="50" cy="5" r="2.5" fill="currentColor" />
          <circle cx="110" cy="5" r="2.5" fill="currentColor" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
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
    </div>
  );
}
