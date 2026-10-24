import React from "react";
import { AlertTriangle, RefreshCw, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportErrorStateProps {
  title?: string;
  message?: string;
  errorDetails?: string;
  onRetry?: () => void;
  onResetFilters?: () => void;
}

export const ReportErrorState: React.FC<ReportErrorStateProps> = ({
  title = "Failed to Generate Report",
  message = "An error occurred while generating this report from the server. This may be due to an unexpected database error or invalid query parameters.",
  errorDetails,
  onRetry,
  onResetFilters,
}) => {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50/40 p-8 text-center shadow-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 ring-8 ring-rose-50">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-slate-600">{message}</p>

      {errorDetails && (
        <div className="mt-4 max-w-xl rounded-lg border border-rose-200/80 bg-white/80 p-3 text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">Error Details:</p>
          <p className="mt-1 font-mono text-xs text-rose-800 break-words">{errorDetails}</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button
            variant="default"
            size="sm"
            onClick={onRetry}
            className="bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Report
          </Button>
        )}
        {onResetFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          >
            <FilterX className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );
};
