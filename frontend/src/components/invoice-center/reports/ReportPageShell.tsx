import React from "react";

interface ReportPageShellProps {
  title: string;
  description?: string;
  filters?: React.ReactNode;
  summary?: React.ReactNode;
  table?: React.ReactNode;
  actions?: React.ReactNode;
}

export const ReportPageShell: React.FC<ReportPageShellProps> = ({
  title,
  description,
  filters,
  summary,
  table,
  actions,
}) => {
  return (
    <div className="min-h-screen flex-1 space-y-6 p-6 sm:p-8 bg-slate-50/50">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white/95 via-slate-50/90 to-blue-50/30 backdrop-blur-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {title}
          </h2>
          {description && (
            <p className="text-slate-500 mt-1 text-xs sm:text-sm font-medium">{description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2 shrink-0">{actions}</div>
      </div>

      <div className="space-y-6">
        {filters && <div className="print:hidden">{filters}</div>}

        {summary && <div>{summary}</div>}

        {table && (
          <div className="rounded-md border bg-white shadow-sm">{table}</div>
        )}
      </div>
    </div>
  );
};
