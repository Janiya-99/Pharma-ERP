import React from 'react';
import { Button } from '../../ui/button';
import { Printer, RefreshCw, Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';

export interface ReportToolbarProps {
  onRefresh?: () => void;
  onExportJson?: () => void;
  onExportCsv?: () => void;
  onExportPdf?: () => void;
  onPrint?: () => void;
  showPrint?: boolean;
  isExportingPdf?: boolean;
  isRefreshing?: boolean;
  extraActions?: React.ReactNode;
}

const ReportToolbar: React.FC<ReportToolbarProps> = ({
  onRefresh,
  onExportJson,
  onExportCsv,
  onExportPdf,
  onPrint,
  showPrint = false,
  isExportingPdf,
  isRefreshing,
  extraActions,
}) => {
  const handlePrint = () => {
    if (onPrint) onPrint();
    else window.print();
  };

  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap print:hidden">
      {onRefresh && (
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing} className="h-8 gap-1.5 text-xs shadow-2xs cursor-pointer">
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      )}
      {onExportCsv && (
        <Button variant="outline" size="sm" onClick={onExportCsv} className="h-8 gap-1.5 text-xs shadow-2xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200 cursor-pointer font-semibold">
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          Export Excel
        </Button>
      )}
      {onExportPdf && (
        <Button variant="outline" size="sm" onClick={onExportPdf} disabled={isExportingPdf} className="h-8 gap-1.5 text-xs shadow-2xs text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200 cursor-pointer font-semibold">
          {isExportingPdf ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
          ) : (
            <FileText className="w-3.5 h-3.5 text-rose-600" />
          )}
          Export PDF
        </Button>
      )}
      {showPrint && (
        <Button variant="outline" size="sm" onClick={handlePrint} className="h-8 gap-1.5 text-xs shadow-2xs cursor-pointer">
          <Printer className="w-3.5 h-3.5" />
          Print
        </Button>
      )}
      {onExportJson && (
        <Button variant="outline" size="sm" onClick={onExportJson} className="h-8 gap-1.5 text-xs shadow-2xs cursor-pointer text-slate-600">
          <Download className="w-3.5 h-3.5" />
          Export JSON
        </Button>
      )}
      {extraActions}
    </div>
  );
};

export default ReportToolbar;
