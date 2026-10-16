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
    iconBg: "bg-blue-600/10",
    iconColor: "text-blue-600",
    activeText: "text-blue-600",
    btnBg: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20",
  },
  indigo: {
    iconBg: "bg-indigo-600/10",
    iconColor: "text-indigo-600",
    activeText: "text-indigo-600",
    btnBg: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20",
  },
  emerald: {
    iconBg: "bg-emerald-600/10",
    iconColor: "text-emerald-600",
    activeText: "text-emerald-600",
    btnBg: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20",
  },
  amber: {
    iconBg: "bg-amber-600/10",
    iconColor: "text-amber-600",
    activeText: "text-amber-600",
    btnBg: "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20",
  },
  purple: {
    iconBg: "bg-purple-600/10",
    iconColor: "text-purple-600",
    activeText: "text-purple-600",
    btnBg: "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20",
  },
  cyan: {
    iconBg: "bg-cyan-600/10",
    iconColor: "text-cyan-600",
    activeText: "text-cyan-600",
    btnBg: "bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/20",
  },
};

export const DashboardHeroCard: React.FC<DashboardHeroCardProps> = ({
  title,
  subtitle,
  moduleTag,
  breadcrumb,
  icon: Icon,
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
    <div className={`w-full ${className}`}>
      {/* ── BREADCRUMB ── */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
        <span>{parentName}</span>
        <span>›</span>
        <span className={`${currentAccent.activeText} font-bold`}>
          {currentName}
        </span>
      </div>

      {/* ── SECTION TITLE BAR ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Left: Icon Badge & Title / Subtitle */}
        <div className="flex items-center gap-3.5">
          {Icon && (
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${currentAccent.iconBg} ${currentAccent.iconColor} shadow-2xs`}
            >
              <Icon className="h-6 w-6 stroke-[2.2]" />
            </div>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Date Picker & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Date Selector Pill */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
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
                  className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
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

      {/* Optional sub-row for tabs or inline summaries */}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default DashboardHeroCard;
