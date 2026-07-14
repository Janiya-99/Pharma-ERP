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
    <div className="flex h-[132px] flex-col justify-between rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-xl p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-indigo-500/30 ring-1 ring-inset ring-slate-900/5 hover:ring-indigo-50  ">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500 ">
          {label}
        </span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${iconBgClass}`}>
          <Icon className={`h-4 w-4 ${iconColorClass}`} />
        </div>
      </div>
      <div>
        <div className="text-2xl font-semibold tracking-tight text-gray-900 ">
          {money(metric.value)}
        </div>
        <div className="mt-1 flex items-center text-xs">
          {metric.trend !== 0 && (
            <span
              className={`mr-2 font-medium ${
                isPositive ? "text-green-600 " : "text-red-600 "
              }`}
            >
              {isPositive ? "+" : ""}
              {metric.trend}%
            </span>
          )}
          <span className="text-gray-400 ">{metric.comparison_text}</span>
        </div>
      </div>
    </div>
  );
}
