import React, { useState } from "react";
import {
  Calendar,
  Globe,
  ChevronDown,
  Quote,
  Sparkles,
  LucideIcon,
  Check,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface DashboardHeroCardProps {
  title: string | React.ReactNode;
  subtitle: string;
  moduleTag?: string;
  breadcrumb?: {
    parent: string;
    current: string;
  };
  icon?: LucideIcon;
  quote?: {
    text: string;
    author?: string;
  };
  accent?: "blue" | "indigo" | "emerald" | "amber" | "purple" | "cyan";
  dateFilter?: string;
  onDateFilterChange?: (value: string) => void;
  dateFilterOptions?: string[];
  branchFilter?: string;
  onBranchFilterChange?: (value: string) => void;
  branchFilterOptions?: string[];
  actions?: React.ReactNode;
  onRefresh?: () => void;
  isLoading?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const defaultDateOptions = [
  "Today",
  "This Week",
  "This Month",
  "This Quarter",
  "This Year",
];

const defaultBranchOptions = [
  "All Branches (Global)",
  "Colombo Central HQ (Main)",
  "Kandy Regional Distribution",
  "Galle Maritime Warehouse",
  "Biyagama Cold Chain Facility",
];

const accentStyles = {
  blue: {
    tagBg: "bg-blue-50/90 text-blue-700 border-blue-200/70",
    glow1: "bg-blue-400/15",
    glow2: "bg-indigo-400/10",
    iconBg: "bg-blue-600 text-white shadow-blue-500/25",
    iconColor: "text-white",
    quoteIcon: "text-blue-500",
    activeText: "text-blue-600",
    btnBg: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20",
    borderFocus: "focus:ring-blue-500",
  },
  indigo: {
    tagBg: "bg-indigo-50/90 text-indigo-700 border-indigo-200/70",
    glow1: "bg-indigo-400/15",
    glow2: "bg-purple-400/10",
    iconBg: "bg-indigo-600 text-white shadow-indigo-500/25",
    iconColor: "text-white",
    quoteIcon: "text-indigo-500",
    activeText: "text-indigo-600",
    btnBg: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20",
    borderFocus: "focus:ring-indigo-500",
  },
  emerald: {
    tagBg: "bg-emerald-50/90 text-emerald-700 border-emerald-200/70",
    glow1: "bg-emerald-400/15",
    glow2: "bg-teal-400/10",
    iconBg: "bg-emerald-600 text-white shadow-emerald-500/25",
    iconColor: "text-white",
    quoteIcon: "text-emerald-500",
    activeText: "text-emerald-600",
    btnBg: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20",
    borderFocus: "focus:ring-emerald-500",
  },
  amber: {
    tagBg: "bg-amber-50/90 text-amber-700 border-amber-200/70",
    glow1: "bg-amber-400/15",
    glow2: "bg-orange-400/10",
    iconBg: "bg-amber-600 text-white shadow-amber-500/25",
    iconColor: "text-white",
    quoteIcon: "text-amber-500",
    activeText: "text-amber-600",
    btnBg: "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20",
    borderFocus: "focus:ring-amber-500",
  },
  purple: {
    tagBg: "bg-purple-50/90 text-purple-700 border-purple-200/70",
    glow1: "bg-purple-400/15",
    glow2: "bg-pink-400/10",
    iconBg: "bg-purple-600 text-white shadow-purple-500/25",
    iconColor: "text-white",
    quoteIcon: "text-purple-500",
    activeText: "text-purple-600",
    btnBg: "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20",
    borderFocus: "focus:ring-purple-500",
  },
  cyan: {
    tagBg: "bg-cyan-50/90 text-cyan-700 border-cyan-200/70",
    glow1: "bg-cyan-400/15",
    glow2: "bg-blue-400/10",
    iconBg: "bg-cyan-600 text-white shadow-cyan-500/25",
    iconColor: "text-white",
    quoteIcon: "text-cyan-500",
    activeText: "text-cyan-600",
    btnBg: "bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/20",
    borderFocus: "focus:ring-cyan-500",
  },
};

export const DashboardHeroCard: React.FC<DashboardHeroCardProps> = ({
  title,
  subtitle,
  moduleTag,
  breadcrumb,
  icon: Icon,
  quote,
  accent = "blue",
  dateFilter: controlledDate,
  onDateFilterChange,
  dateFilterOptions = defaultDateOptions,
  branchFilter: controlledBranch,
  onBranchFilterChange,
  branchFilterOptions = defaultBranchOptions,
  actions,
  onRefresh,
  isLoading = false,
  children,
  className = "",
}) => {
  const [internalDate, setInternalDate] = useState("Today");
  const [internalBranch, setInternalBranch] = useState("All Branches (Global)");

  const selectedDate = controlledDate ?? internalDate;
  const selectedBranch = controlledBranch ?? internalBranch;

  const handleDateSelect = (val: string) => {
    if (onDateFilterChange) {
      onDateFilterChange(val);
    } else {
      setInternalDate(val);
    }
  };

  const handleBranchSelect = (val: string) => {
    if (onBranchFilterChange) {
      onBranchFilterChange(val);
    } else {
      setInternalBranch(val);
    }
  };

  const currentAccent = accentStyles[accent] || accentStyles.blue;

  // Infer clean breadcrumb parent
  const parentName =
    breadcrumb?.parent ||
    (() => {
      if (!moduleTag) return "Workspace";
      if (moduleTag.toLowerCase().includes("inventory")) return "Inventory";
      if (
        moduleTag.toLowerCase().includes("fiscal") ||
        moduleTag.toLowerCase().includes("finance")
      )
        return "Finance";
      if (
        moduleTag.toLowerCase().includes("control") ||
        moduleTag.toLowerCase().includes("administration")
      )
        return "Control Center";
      if (
        moduleTag.toLowerCase().includes("bill") ||
        moduleTag.toLowerCase().includes("receivable") ||
        moduleTag.toLowerCase().includes("invoice")
      )
        return "Invoice Center";
      if (
        moduleTag.toLowerCase().includes("regulat") ||
        moduleTag.toLowerCase().includes("compliance") ||
        moduleTag.toLowerCase().includes("nmra")
      )
        return "Compliance Center";
      return moduleTag;
    })();

  const currentName = breadcrumb?.current || "Dashboard";

  // Dynamic formatted date string e.g. "Oct 16, 2026"
  const formattedToday = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const isToday = selectedDate === "Today";
  const dateSubLabel = isToday ? "Today" : "Date Range";
  const dateMainLabel = isToday ? formattedToday : selectedDate;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white/95 via-slate-50/90 to-blue-50/30 backdrop-blur-xl p-5 sm:p-6 lg:p-7 shadow-xs transition-all duration-300 mb-6 ${className}`}
    >
      {/* ── AMBIENT GLOW EFFECTS ── */}
      <div
        className={`absolute -right-16 -top-16 w-80 h-80 rounded-full ${currentAccent.glow1} blur-3xl pointer-events-none`}
      />
      <div
        className={`absolute -right-8 -bottom-16 w-64 h-64 rounded-full ${currentAccent.glow2} blur-2xl pointer-events-none`}
      />

      {/* ── SUBTLE GEOMETRIC / PHARMACEUTICAL SVG WATERMARK ── */}
      <div className="absolute right-0 top-0 bottom-0 w-80 lg:w-96 opacity-[0.04] pointer-events-none select-none text-slate-900 overflow-hidden">
        <svg
          viewBox="0 0 400 200"
          className="w-full h-full object-cover -mr-10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          {/* Hexagonal molecular lattice grid */}
          <path d="M 50,30 L 80,10 L 110,30 L 110,60 L 80,80 L 50,60 Z" />
          <path d="M 110,30 L 140,10 L 170,30 L 170,60 L 140,80 L 110,60 Z" />
          <path d="M 80,80 L 110,60 L 140,80 L 140,110 L 110,130 L 80,110 Z" />
          <path d="M 170,30 L 200,10 L 230,30 L 230,60 L 200,80 L 170,60 Z" />
          <path d="M 140,80 L 170,60 L 200,80 L 200,110 L 170,130 L 140,110 Z" />
          <path d="M 200,80 L 230,60 L 260,80 L 260,110 L 230,130 L 200,110 Z" />
          <path d="M 230,30 L 260,10 L 290,30 L 290,60 L 260,80 L 230,60 Z" />
          <circle cx="80" cy="10" r="3" fill="currentColor" />
          <circle cx="140" cy="10" r="3" fill="currentColor" />
          <circle cx="200" cy="10" r="3" fill="currentColor" />
          <circle cx="260" cy="10" r="3" fill="currentColor" />
          <circle cx="110" cy="60" r="3" fill="currentColor" />
          <circle cx="170" cy="60" r="3" fill="currentColor" />
          <circle cx="230" cy="60" r="3" fill="currentColor" />
          {/* Subtle pulse wave line */}
          <path
            d="M 10,160 Q 60,160 80,140 T 110,160 T 140,120 T 170,180 T 200,160 L 390,160"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </svg>
      </div>

      {/* ── HEADER CONTENT CONTAINER ── */}
      <div className="relative z-10">
        {/* Breadcrumb & Module Tag */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2.5">
          {moduleTag && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border shadow-2xs mr-1 ${currentAccent.tagBg}`}
            >
              <Sparkles className="h-3 w-3" />
              {moduleTag}
            </span>
          )}
          <span>{parentName}</span>
          <span>›</span>
          <span className={`${currentAccent.activeText} font-bold`}>
            {currentName}
          </span>
        </div>

        {/* Section Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Icon Badge & Title / Subtitle */}
          <div className="flex items-center gap-3.5">
            {Icon && (
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${currentAccent.iconBg} shadow-md`}
              >
                <Icon className="h-6 w-6 stroke-[2.2]" />
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Date Picker, Branch Picker, & Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Date Selector Pill */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/90 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[10px] text-slate-400">
                      {dateSubLabel}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {dateMainLabel}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 rounded-xl p-1 shadow-lg border-slate-200/80 bg-white/95 backdrop-blur-md z-50"
              >
                {dateFilterOptions.map((opt) => (
                  <DropdownMenuItem
                    key={opt}
                    onClick={() => handleDateSelect(opt)}
                    className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg cursor-pointer ${
                      selectedDate === opt
                        ? "bg-slate-100 font-bold text-slate-900"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedDate === opt && (
                      <Check
                        className={`h-3.5 w-3.5 ${currentAccent.activeText}`}
                      />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Optional Branch Selector Pill */}
            {onBranchFilterChange && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/90 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Globe className="h-4 w-4 text-slate-400" />
                    <div className="flex flex-col text-left leading-none">
                      <span className="text-[10px] text-slate-400">Branch</span>
                      <span className="text-xs font-bold text-slate-800 max-w-[130px] truncate">
                        {selectedBranch}
                      </span>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 rounded-xl p-1 shadow-lg border-slate-200/80 bg-white/95 backdrop-blur-md z-50"
                >
                  {branchFilterOptions.map((opt) => (
                    <DropdownMenuItem
                      key={opt}
                      onClick={() => handleBranchSelect(opt)}
                      className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg cursor-pointer ${
                        selectedBranch === opt
                          ? "bg-slate-100 font-bold text-slate-900"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate">{opt}</span>
                      {selectedBranch === opt && (
                        <Check
                          className={`h-3.5 w-3.5 ${currentAccent.activeText} shrink-0 ml-2`}
                        />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Module-specific action buttons or default Refresh */}
            {actions ? (
              actions
            ) : onRefresh ? (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                className={`flex items-center gap-2 rounded-xl ${currentAccent.btnBg} text-white font-bold text-xs px-4 py-2.5 shadow-md transition-all active:scale-[0.98] cursor-pointer`}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Inspirational Pharmaceutical/Quality Quote or Slogan */}
        {quote && (
          <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200/70 shadow-2xs text-xs text-slate-600">
            <Quote
              className={`h-3.5 w-3.5 shrink-0 ${currentAccent.quoteIcon} opacity-90`}
            />
            <span className="italic font-medium">"{quote.text}"</span>
            {quote.author && (
              <span className="font-semibold text-slate-400 not-italic text-[11px] ml-1">
                — {quote.author}
              </span>
            )}
          </div>
        )}

        {/* Optional sub-row for tabs or inline summaries */}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
};

export default DashboardHeroCard;
