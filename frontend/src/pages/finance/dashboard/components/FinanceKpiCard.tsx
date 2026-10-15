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
      ? "border-slate-200/80 bg-white/80 backdrop-blur-md hover:border-rose-300"
      : tone === "blue"
      ? "border-slate-200/80 bg-white/80 backdrop-blur-md hover:border-blue-300"
      : tone === "emerald"
      ? "border-slate-200/80 bg-white/80 backdrop-blur-md hover:border-emerald-300"
      : tone === "amber"
      ? "border-slate-200/80 bg-white/80 backdrop-blur-md hover:border-amber-300"
      : "border-slate-200/80 bg-white/80 backdrop-blur-md hover:border-indigo-300";

  const iconBgClass = 
    tone === "rose"
      ? "bg-rose-50 text-rose-600 group-hover:bg-rose-100"
      : tone === "blue"
      ? "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
      : tone === "emerald"
      ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"
      : tone === "amber"
      ? "bg-amber-50 text-amber-600 group-hover:bg-amber-100"
      : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100";

  const textClass = 
    tone === "rose" ? "text-rose-600"
    : tone === "blue" ? "text-blue-600"
    : tone === "emerald" ? "text-emerald-600"
    : tone === "amber" ? "text-amber-600"
    : "text-indigo-600";
    
  return (
    <div className={`group relative flex h-[132px] flex-col justify-between overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${containerClasses}`}>
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
