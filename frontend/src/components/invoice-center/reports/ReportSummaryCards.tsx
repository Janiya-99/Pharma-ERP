import React from "react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";

export interface SummaryCardItem {
  title: string;
  value: string | number;
  format?: "currency" | "number" | "text";
  icon?: React.ReactNode;
  subtitle?: string;
  path?: string;
  onClick?: () => void;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface ReportSummaryCardsProps {
  items: SummaryCardItem[];
  isLoading?: boolean;
}

export const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({
  items,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  const formatValue = (
    value: string | number,
    format?: "currency" | "number" | "text"
  ) => {
    if (format === "currency") {
      return new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
      }).format(Number(value));
    }
    if (format === "number") {
      return new Intl.NumberFormat("en-US").format(Number(value));
    }
    return value;
  };

  const getGridCols = () => {
    if (!items || items.length === 0) return "grid-cols-1";
    if (items.length === 1) return "grid-cols-1";
    if (items.length === 2) return "grid-cols-1 sm:grid-cols-2";
    if (items.length === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  };

  if (isLoading) {
    const count = Math.max(items?.length || 4, 4);
    return (
      <div className={`grid gap-4 ${getGridCols()}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-32 rounded-md" />
            <Skeleton className="h-3 w-40 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <div className={`grid gap-4 ${getGridCols()}`}>
      {items.map((item, index) => {
        const isClickable = Boolean(item.path || item.onClick);
        const handleClick = () => {
          if (item.onClick) item.onClick();
          else if (item.path) navigate(item.path);
        };

        return (
          <div
            key={index}
            onClick={isClickable ? handleClick : undefined}
            className={`relative rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white backdrop-blur-xs p-4 sm:p-5 transition-all duration-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 group overflow-hidden flex flex-col justify-between ${
              isClickable
                ? "cursor-pointer hover:border-indigo-300 hover:ring-2 hover:ring-indigo-100/60"
                : ""
            }`}
          >
            {/* Top ambient hover accent line */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover:via-indigo-500/80 transition-all duration-500" />

            <div>
              {/* Header: Title and Icon */}
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-800 transition-colors leading-tight line-clamp-1">
                  {item.title}
                </span>
                <div className="shrink-0 h-8 w-8 rounded-lg bg-white border border-slate-200/70 flex items-center justify-center text-slate-500 group-hover:scale-105 group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all shadow-2xs">
                  {item.icon}
                </div>
              </div>

              {/* Main Metric Value */}
              <div
                className={`text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight leading-none mt-3 ${
                  item.format === "currency" ? "font-mono" : ""
                }`}
              >
                {formatValue(item.value, item.format)}
              </div>
            </div>

            {/* Subtitle / Interactive Footer */}
            {isClickable ? (
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[11px] font-medium text-slate-400 group-hover:text-indigo-600 transition-colors">
                <span className="truncate">{item.subtitle || "Inspect details"}</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
            ) : item.subtitle ? (
              <p className="text-[11px] text-slate-400 font-medium mt-2 pt-2 border-t border-slate-100/60 truncate">
                {item.subtitle}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
