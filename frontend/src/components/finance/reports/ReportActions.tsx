import React from 'react';
import { RefreshCw, FileSpreadsheet, FileText, FileJson, Printer, Loader2 } from 'lucide-react';

export interface ReportActionsProps {
  onRefresh?: () => void;
  onExportCsv?: () => void;
  onExportPdf?: () => void;
  onExportJson?: () => void;
  onPrint?: () => void;
  loading?: boolean;
  disabled?: boolean;
  isExportingPdf?: boolean;
  showPrint?: boolean;
  extraActions?: React.ReactNode;
  className?: string;
}

export const ReportActions: React.FC<ReportActionsProps> = ({
  onRefresh,
  onExportCsv,
  onExportPdf,
  onExportJson,
  onPrint,
  loading = false,
  disabled = false,
  isExportingPdf = false,
  showPrint = true,
  extraActions,
  className = "",
}) => {
  const handlePrint = () => {
    if (onPrint) onPrint();
    else window.print();
  };

  const isBtnDisabled = disabled || loading;

  const btnBaseClass =
    "inline-flex items-center gap-2 h-9 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  return (
    <div className={`flex items-center gap-2.5 flex-wrap print:hidden ${className}`}>
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className={`${btnBaseClass} bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 hover:shadow-sm`}
          title="Refresh Report Data"
        >
          <RefreshCw className={`h-4 w-4 text-slate-500 shrink-0 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      )}
      {onExportCsv && (
        <button
          type="button"
          onClick={onExportCsv}
          disabled={isBtnDisabled}
          className={`${btnBaseClass} bg-white border border-slate-200/90 text-slate-700 hover:bg-emerald-50/80 hover:text-emerald-700 hover:border-emerald-300 hover:shadow-sm`}
          title="Export to Excel Spreadsheet"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Export Excel</span>
        </button>
      )}
      {onExportPdf && (
        <button
          type="button"
          onClick={onExportPdf}
          disabled={isBtnDisabled || isExportingPdf}
          className={`${btnBaseClass} bg-white border border-slate-200/90 text-slate-700 hover:bg-rose-50/80 hover:text-rose-700 hover:border-rose-300 hover:shadow-sm`}
          title="Export Statutory PDF Document"
        >
          {isExportingPdf ? (
            <Loader2 className="h-4 w-4 animate-spin text-rose-600 shrink-0" />
          ) : (
            <FileText className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>Export PDF</span>
        </button>
      )}
      {onExportJson && (
        <button
          type="button"
          onClick={onExportJson}
          disabled={isBtnDisabled}
          className={`${btnBaseClass} bg-white border border-slate-200/90 text-slate-700 hover:bg-blue-50/80 hover:text-blue-700 hover:border-blue-300 hover:shadow-sm`}
          title="Export JSON Data"
        >
          <FileJson className="h-4 w-4 text-blue-600 shrink-0" />
          <span>Export JSON</span>
        </button>
      )}
      {showPrint && (
        <button
          type="button"
          onClick={handlePrint}
          disabled={isBtnDisabled}
          className={`hidden sm:inline-flex ${btnBaseClass} bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 hover:shadow-sm`}
          title="Print Report"
        >
          <Printer className="h-4 w-4 text-slate-500 shrink-0" />
          <span>Print</span>
        </button>
      )}
      {extraActions}
    </div>
  );
};

export default ReportActions;
