import React from "react";
import { Button } from "@/components/ui/button";
import { Filter, RotateCcw, SlidersHorizontal } from "lucide-react";

interface ReportFilterBarProps {
  children: React.ReactNode;
  onApply?: () => void;
  onReset: () => void;
  isLoading?: boolean;
  showApplyButton?: boolean;
}

export const ReportFilterBar: React.FC<ReportFilterBarProps> = ({
  children,
  onApply,
  onReset,
  isLoading = false,
  showApplyButton = false,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs p-5 transition-all">
      {/* Header Strip */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/80 shadow-2xs">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Filter Criteria
            </span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
          Filter records and analytics by period
        </div>
      </div>

      <div className="flex flex-col items-start gap-4 md:flex-row md:items-end">
        <div className="grid w-full flex-1 grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {children}
        </div>
        <div className="flex shrink-0 space-x-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={isLoading}
            className="h-9 w-full md:w-auto gap-1.5 border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold text-xs rounded-xl transition-all shadow-2xs group"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400 group-hover:rotate-[-45deg] group-hover:text-slate-700 transition-transform" />
            <span>Reset</span>
          </Button>
          {showApplyButton && onApply ? (
            <Button
              onClick={onApply}
              disabled={isLoading}
              size="sm"
              className="h-9 w-full md:w-auto bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-xs rounded-xl shadow-xs gap-1.5"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Apply Filters</span>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

