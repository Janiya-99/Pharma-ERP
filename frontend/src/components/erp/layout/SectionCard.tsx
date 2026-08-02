import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  /** Card title */
  title?: string;
  /** Card description */
  description?: string;
  /** Right-side header actions */
  actions?: ReactNode;
  /** Content */
  children: ReactNode;
  /** Additional className for the card */
  className?: string;
  /** Inner content padding override */
  contentClassName?: string;
  /** Whether to show glassmorphism effect */
  glass?: boolean;
}

/**
 * Standard ERP section card with optional title, description, and actions.
 * Uses consistent border, radius, and padding from the design system.
 */
export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
  glass = true,
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white/70 shadow-[0_8px_30px_rgba(2,62,138,0.08)] backdrop-blur-xl transition-all duration-200",
        glass && "glass-card",
        className
      )}
    >
      {(title || actions) && (
        <div className="flex flex-col gap-1 px-4 pb-4 pt-4 sm:flex-row sm:items-center sm:justify-between md:px-5 md:pt-5">
          <div className="min-w-0">
            {title && (
              <h3 className="text-base font-semibold text-[#1F2937]">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-0.5 text-xs text-[#6B7280]">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-2 mt-2 sm:mt-0">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className={cn("px-4 pb-4 md:px-5 md:pb-5", !title && "pt-4 md:pt-5", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
