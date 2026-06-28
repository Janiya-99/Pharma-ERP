import React from 'react';
import { FileSearch } from 'lucide-react';

interface ReportEmptyStateProps {
  title?: string;
  message?: string;
}

export const ReportEmptyState: React.FC<ReportEmptyStateProps> = ({
  title = "No Data Found",
  message = "No records match the selected criteria. Try adjusting your filters.",
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-md border shadow-sm text-center">
      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <FileSearch className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">{message}</p>
    </div>
  );
};
