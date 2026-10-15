import React from "react";
import { FileText } from "lucide-react";
import { PageTitleCard } from "@/components/common/PageTitleCard";

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
      <PageTitleCard
        title={title}
        description={description}
        moduleTag="Commercial Invoice Center & Risk Analytics"
        icon={FileText}
        accent="blue"
        quote={{
          text: "Real-time receivables, liquidity exposure tracking, and automated credit risk compliance.",
          author: "Credit Control & Collection Policy"
        }}
        actions={actions}
      />

      <div className="space-y-6">
        {filters && <div className="print:hidden">{filters}</div>}

        {summary && <div>{summary}</div>}

        {table && (
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            {table}
          </div>
        )}
      </div>
    </div>
  );
};
