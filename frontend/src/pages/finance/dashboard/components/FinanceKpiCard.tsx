import { LucideIcon } from "lucide-react";
import { KpiMetric } from "../types";
import { money } from "../utils";

interface FinanceKpiCardProps {
  label: string;
  metric: KpiMetric;
  icon: LucideIcon;
  tone?: "rose" | "blue" | "emerald" | "indigo" | "amber";
}

export function FinanceKpiCard({
  label,
  metric,
  icon: Icon,
  tone = "indigo",
}: FinanceKpiCardProps) {
  const isPositive = metric.trend > 0;
  
  const containerClasses = 
    tone === "rose"
      ? "border-rose-100 bg-gradient-to-br from-rose-50/80 to-white shadow-md ring-1 ring-inset ring-rose-100"
      : tone === "blue"
      ? "border-blue-100 bg-gradient-to-br from-blue-50/80 to-white shadow-md ring-1 ring-inset ring-blue-100"
      : tone === "emerald"
      ? "border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white shadow-md ring-1 ring-inset ring-emerald-100"
      : tone === "amber"
      ? "border-amber-100 bg-gradient-to-br from-amber-50/80 to-white shadow-md ring-1 ring-inset ring-amber-100"
      : "border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white shadow-md ring-1 ring-inset ring-indigo-100";

  const iconBgClass = 
    tone === "rose"
      ? "bg-rose-100 text-rose-600 group-hover:bg-rose-200"
      : tone === "blue"
      ? "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
      : tone === "emerald"
      ? "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200"
      : tone === "amber"
      ? "bg-amber-100 text-amber-600 group-hover:bg-amber-200"
      : "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200";

  const textClass = 
    tone === "rose" ? "text-rose-600"
    : tone === "blue" ? "text-blue-600"
    : tone === "emerald" ? "text-emerald-600"
    : tone === "amber" ? "text-amber-600"
    : "text-indigo-600";
    
  return (
    <div className={`group relative flex h-[132px] flex-col justify-between overflow-hidden rounded-3xl border p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${containerClasses}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
          {label}
        </span>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${iconBgClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <div className={`text-2xl font-semibold tracking-tight truncate ${textClass}`}>
          {money(metric.value)}
        </div>
        <div className="mt-1 flex items-center text-xs">
          {metric.trend !== 0 && (
            <span
              className={`mr-2 font-medium ${
                isPositive ? "text-emerald-600 " : "text-rose-600 "
              }`}
            >
              {isPositive ? "+" : ""}
              {metric.trend}%
            </span>
          )}
          <span className="text-slate-400 ">{metric.comparison_text}</span>
        </div>
      </div>
    </div>
  );
}
