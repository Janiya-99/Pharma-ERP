import React from "react";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatLKR } from "../utils";

export interface FinanceKpiCardProps {
  label: string;
  value: number;
  trendText: string;
  trendValue?: number;
  isPositive?: boolean;
  subtitle?: string;
  icon: LucideIcon;
  tone: "emerald" | "blue" | "purple" | "amber" | "rose" | "violet";
  to?: string;
  onClick?: () => void;
}

export const FinanceKpiCard: React.FC<FinanceKpiCardProps> = ({
  label,
  value,
  trendText,
  trendValue,
  isPositive = true,
  subtitle,
  icon: Icon,
  tone,
  to,
  onClick,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick();
    else if (to) navigate(to);
  };

  // Color mappings
  const themeStyles = {
    emerald: {
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      stroke: "#10B981",
      fill: "url(#sparkline-emerald)",
      trendBg: "bg-emerald-50 text-emerald-700",
      hoverBorder: "hover:border-emerald-300",
    },
    blue: {
      iconBg: "bg-blue-50 text-blue-600 border border-blue-100",
      stroke: "#3B82F6",
      fill: "url(#sparkline-blue)",
      trendBg: "bg-blue-50 text-blue-700",
      hoverBorder: "hover:border-blue-300",
    },
    purple: {
      iconBg: "bg-purple-50 text-purple-600 border border-purple-100",
      stroke: "#8B5CF6",
      fill: "url(#sparkline-purple)",
      trendBg: "bg-purple-50 text-purple-700",
      hoverBorder: "hover:border-purple-300",
    },
    amber: {
      iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
      stroke: "#F59E0B",
      fill: "url(#sparkline-amber)",
      trendBg: "bg-amber-50 text-amber-700",
      hoverBorder: "hover:border-amber-300",
    },
    rose: {
      iconBg: "bg-rose-50 text-rose-600 border border-rose-100",
      stroke: "#EF4444",
      fill: "url(#sparkline-rose)",
      trendBg: "bg-rose-50 text-rose-700",
      hoverBorder: "hover:border-rose-300",
    },
    violet: {
      iconBg: "bg-violet-50 text-violet-600 border border-violet-100",
      stroke: "#7C3AED",
      fill: "url(#sparkline-violet)",
      trendBg: "bg-violet-50 text-violet-700",
      hoverBorder: "hover:border-violet-300",
    },
  }[tone];

  // Bezier sparkline paths for realistic visual trend
  const sparklinePaths = {
    up: "M 0 28 Q 20 26, 35 18 T 70 12 T 100 4",
    down: "M 0 8 Q 25 10, 45 22 T 75 24 T 100 32",
    volatile: "M 0 20 Q 20 8, 40 24 T 70 10 T 100 16",
  };

  const selectedPath = isPositive ? sparklinePaths.up : sparklinePaths.down;
  const areaPath = `${selectedPath} L 100 36 L 0 36 Z`;

  return (
    <div
      onClick={handleClick}
      className={`group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${themeStyles.hoverBorder}`}
    >
      {/* Top row: Icon + Label */}
      <div className="flex items-center gap-2.5">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themeStyles.iconBg}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors truncate">
          {label}
        </span>
      </div>

      {/* Middle: Large Amount Value */}
      <div className="my-2.5">
        <div className="text-xl sm:text-[22px] font-bold tracking-tight text-slate-900">
          {formatLKR(value)}
        </div>
      </div>

      {/* Bottom row: Trend badge/text on left, Sparkline wave on right */}
      <div className="flex items-end justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${
              isPositive ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5 stroke-[2.5]" />
            )}
            {trendText}
          </span>
          {subtitle && (
            <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
              {subtitle}
            </span>
          )}
        </div>

        {/* Smooth SVG Sparkline */}
        <div className="w-16 h-8 shrink-0 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 100 36" fill="none">
            <defs>
              <linearGradient id={`sparkline-${tone}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={themeStyles.stroke} stopOpacity="0.25" />
                <stop offset="100%" stopColor={themeStyles.stroke} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill={themeStyles.fill} />
            <path
              d={selectedPath}
              stroke={themeStyles.stroke}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
