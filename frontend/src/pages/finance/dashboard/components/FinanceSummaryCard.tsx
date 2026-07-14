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
    <div className="flex flex-col justify-between rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-xl p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-indigo-500/30 ring-1 ring-inset ring-slate-900/5 hover:ring-indigo-50  ">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500 ">
          {label}
        </span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBgClass}`}>
          <Icon className={`h-5 w-5 ${iconColorClass}`} />
        </div>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-semibold tracking-tight text-gray-900 ">
          {money(metric.value)}
        </div>
        <div className="mt-1 text-sm font-medium text-indigo-600 ">
          {metric.secondary}
        </div>
      </div>
    </div>
  );
}
