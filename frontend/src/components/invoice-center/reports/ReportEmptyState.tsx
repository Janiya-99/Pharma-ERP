import React from "react";
import { FileSearch } from "lucide-react";

interface ReportEmptyStateProps {
  title?: string;
  message?: string;
}

export const ReportEmptyState: React.FC<ReportEmptyStateProps> = ({
  title = "No Data Found",
  message = "No records match the selected criteria. Try adjusting your filters.",
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border bg-white p-12 text-center shadow-sm">
      <div className="bg-slate-100 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
        <FileSearch className="text-slate-400 h-6 w-6" />
      </div>
      <h3 className="text-slate-900 text-lg font-medium">{title}</h3>
      <p className="text-slate-500 mt-1 max-w-sm text-sm">{message}</p>
    </div>
  );
};
