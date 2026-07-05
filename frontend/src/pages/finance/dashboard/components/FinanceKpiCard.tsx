import { LucideIcon } from "lucide-react";
import { KpiMetric } from "../types";
import { money } from "../utils";

interface FinanceKpiCardProps {
  label: string;
  metric: KpiMetric;
  icon: LucideIcon;
  iconBgClass: string;
  iconColorClass: string;
}

export function FinanceKpiCard({
  label,
  metric,
  icon: Icon,
  iconBgClass,
  iconColorClass,
}: FinanceKpiCardProps) {
  const isPositive = metric.trend > 0;
  const isNegative = metric.trend < 0;

  return (
    <div className="flex h-[132px] flex-col justify-between rounded-2xl border border-gray-200 bg-white/88 p-4 shadow-[0_2px_8px_rgb(0,0,0,0.04)] backdrop-blur-sm transition-all hover:shadow-[0_4px_12px_rgb(0,0,0,0.06)] dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${iconBgClass}`}>
          <Icon className={`h-4 w-4 ${iconColorClass}`} />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {money(metric.value)}
        </div>
        <div className="mt-1 flex items-center text-xs">
          {metric.trend !== 0 && (
            <span
              className={`mr-2 font-medium ${
                isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {isPositive ? "+" : ""}
              {metric.trend}%
            </span>
          )}
          <span className="text-gray-400 dark:text-gray-500">{metric.comparison_text}</span>
        </div>
      </div>
    </div>
  );
}
