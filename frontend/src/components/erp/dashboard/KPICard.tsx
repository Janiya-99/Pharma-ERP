import type { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  /** KPI label */
  title: string;
  /** KPI value (formatted) */
  value: string | number;
  /** Trend direction */
  trend?: "up" | "down" | "neutral";
  /** Trend percentage or label */
  trendValue?: string;
  /** Icon to display */
  icon?: ReactNode;
  /** Icon background color class */
  iconBg?: string;
  /** Additional className */
  className?: string;
}

/**
 * Glass-style KPI card for dashboards.
 *
 * Features:
 * - Semi-transparent background with ocean-blue border
 * - rounded-2xl radius
 * - Trend indicator with up/down/neutral
 * - Responsive sizing
 */
export function KPICard({
  title,
  value,
  trend,
  trendValue,
  icon,
  iconBg = "bg-erp-800/10 ",
  className,
}: KPICardProps) {
  const trendColors = {
    up: "text-green-600 ",
    down: "text-red-500 ",
    neutral: "text-muted-foreground",
  };

  const TrendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-erp-border-soft p-5 md:p-6",
        "bg-card/70 backdrop-blur-md shadow-erp-sm",
        "transition-all duration-200 hover:shadow-erp-md hover:border-erp-500/30",
        "glass-card",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {value}
          </p>
          {trend && trendValue && (
            <div className="mt-2 flex items-center gap-1.5">
              {(() => {
                const Icon = TrendIcon[trend];
                return <Icon className={cn("h-3.5 w-3.5", trendColors[trend])} />;
              })()}
              <span
                className={cn("text-xs font-semibold", trendColors[trend])}
              >
                {trendValue}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              iconBg
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
