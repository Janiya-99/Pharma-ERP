import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: ReactNode;
  className?: string;
  /** Max-width constraint. Defaults to "max-w-screen-2xl" */
  maxWidth?: string;
}

/**
 * Consistent page container with responsive padding.
 * Wraps every page to enforce the 8px spacing system.
 *
 * Mobile:  px-3 (12px)
 * Tablet:  px-4 (16px)
 * Desktop: px-5/6 (20-24px)
 */
export function PageShell({
  children,
  className,
  maxWidth = "",
}: PageShellProps) {
  return (
    <div
      className={cn(
        "page-content flex flex-col gap-8 pb-32 font-sans",
        maxWidth,
        className
      )}
    >
      {children}
    </div>
  );
}
