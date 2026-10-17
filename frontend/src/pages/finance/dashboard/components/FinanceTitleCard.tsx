import React, { useState } from "react";
import { Landmark, Calendar, RefreshCw, ChevronDown, ChevronRight, Check } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import toast from "react-hot-toast";

interface FinanceTitleCardProps {
  onRefresh: () => void;
  isLoading?: boolean;
  selectedPeriod?: string;
  onPeriodChange?: (period: string) => void;
}

export const FinanceTitleCard: React.FC<FinanceTitleCardProps> = ({
  onRefresh,
  isLoading = false,
  selectedPeriod = "Today Oct 16, 2026",
  onPeriodChange,
}) => {
  const [currentPeriod, setCurrentPeriod] = useState(selectedPeriod);

  const periodOptions = [
    "Today Oct 16, 2026",
    "Yesterday Oct 15, 2026",
    "This Week (12-18 Oct)",
    "This Month (October 2026)",
    "Q3 FY 2026/27",
    "Fiscal Year 2026/27",
  ];

  const handleSelectPeriod = (period: string) => {
    setCurrentPeriod(period);
    if (onPeriodChange) onPeriodChange(period);
    toast.success(`Filter set to: ${period}`);
  };

  const handleRefreshClick = () => {
    onRefresh();
    toast.success("Financial metrics refreshed");
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all">
      {/* Breadcrumb row */}
      <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-slate-400">
        <span className="hover:text-slate-600 transition-colors">Financials</span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="font-semibold text-indigo-600">Overview</span>
      </div>

      {/* Main title & controls row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Icon + Title + Subtitle */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-blue-500/10 text-indigo-600 border border-indigo-100 shadow-2xs">
            <Landmark className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Financial Operations & Treasury
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              Monitor financial health, cash flow, receivables, payables, and statutory compliance in real-time.
            </p>
          </div>
        </div>

        {/* Right: Date Picker Dropdown + Refresh Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50/80 cursor-pointer"
              >
                <Calendar className="h-4 w-4 text-slate-500" />
                <span>{currentPeriod}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 opacity-80" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5 shadow-xl border-slate-200/80 bg-white z-50">
              {periodOptions.map((opt) => (
                <DropdownMenuItem
                  key={opt}
                  onClick={() => handleSelectPeriod(opt)}
                  className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer transition-colors ${
                    currentPeriod === opt
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{opt}</span>
                  {currentPeriod === opt && <Check className="h-3.5 w-3.5 text-indigo-600" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={handleRefreshClick}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
