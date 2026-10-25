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

  return (
    <div className={`flex items-center gap-2 flex-wrap print:hidden ${className}`}>
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 h-8.5 px-3 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          title="Refresh Report Data"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      )}
      {onExportCsv && (
        <button
          type="button"
          onClick={onExportCsv}
          disabled={isBtnDisabled}
          className="inline-flex items-center gap-1.5 h-8.5 px-3 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs hover:bg-emerald-50/60 hover:text-emerald-700 hover:border-emerald-300 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          title="Export to Excel Spreadsheet"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
          <span>Export Excel</span>
        </button>
      )}
      {onExportPdf && (
        <button
          type="button"
          onClick={onExportPdf}
          disabled={isBtnDisabled || isExportingPdf}
          className="inline-flex items-center gap-1.5 h-8.5 px-3 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs hover:bg-rose-50/60 hover:text-rose-700 hover:border-rose-300 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          title="Export Statutory PDF Document"
        >
          {isExportingPdf ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-600" />
          ) : (
            <FileText className="h-3.5 w-3.5 text-rose-600" />
          )}
          <span>Export PDF</span>
        </button>
      )}
      {onExportJson && (
        <button
          type="button"
          onClick={onExportJson}
          disabled={isBtnDisabled}
          className="inline-flex items-center gap-1.5 h-8.5 px-3 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs hover:bg-blue-50/60 hover:text-blue-700 hover:border-blue-300 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          title="Export JSON Data"
        >
          <FileJson className="h-3.5 w-3.5 text-blue-600" />
          <span>Export JSON</span>
        </button>
      )}
      {showPrint && (
        <button
          type="button"
          onClick={handlePrint}
          disabled={isBtnDisabled}
          className="hidden sm:inline-flex items-center gap-1.5 h-8.5 px-3 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          title="Print Report"
        >
          <Printer className="h-3.5 w-3.5 text-slate-500" />
          <span>Print</span>
        </button>
      )}
      {extraActions}
    </div>
  );
};

export default ReportActions;
