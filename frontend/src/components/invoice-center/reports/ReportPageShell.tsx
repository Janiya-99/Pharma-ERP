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
    <div className="bg-slate-50 min-h-screen flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col justify-between space-y-2 border-b pb-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy-900">
            {title}
          </h2>
          {description && (
            <p className="text-slate-500 mt-1 text-sm">{description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">{actions}</div>
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
