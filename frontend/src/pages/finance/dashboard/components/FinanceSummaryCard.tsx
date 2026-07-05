import { LucideIcon } from "lucide-react";
import { SummaryMetric } from "../types";
import { money } from "../utils";

interface FinanceSummaryCardProps {
  label: string;
  metric: SummaryMetric;
  icon: LucideIcon;
  iconBgClass: string;
  iconColorClass: string;
}

export function FinanceSummaryCard({
  label,
  metric,
  icon: Icon,
  iconBgClass,
  iconColorClass,
}: FinanceSummaryCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white/88 p-5 shadow-[0_2px_8px_rgb(0,0,0,0.04)] backdrop-blur-sm transition-all hover:shadow-[0_4px_12px_rgb(0,0,0,0.06)] dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBgClass}`}>
          <Icon className={`h-5 w-5 ${iconColorClass}`} />
        </div>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {money(metric.value)}
        </div>
        <div className="mt-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
          {metric.secondary}
        </div>
      </div>
    </div>
  );
}
