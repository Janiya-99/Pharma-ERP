import React from 'react';
import { Button } from '../../ui/button';
import { Printer, RefreshCw, Download, FileSpreadsheet } from 'lucide-react';

interface ReportToolbarProps {
  onRefresh?: () => void;
  onExportJson?: () => void;
  onExportCsv?: () => void;
  isRefreshing?: boolean;
  extraActions?: React.ReactNode;
}

const ReportToolbar: React.FC<ReportToolbarProps> = ({
  onRefresh,
  onExportJson,
  onExportCsv,
  isRefreshing,
  extraActions,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap print:hidden">
      {onRefresh && (
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing} className="h-8 gap-1.5 text-xs shadow-2xs">
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={handlePrint} className="h-8 gap-1.5 text-xs shadow-2xs">
        <Printer className="w-3.5 h-3.5" />
        Print
      </Button>
      {onExportCsv && (
        <Button variant="outline" size="sm" onClick={onExportCsv} className="h-8 gap-1.5 text-xs shadow-2xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50">
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          Export CSV
        </Button>
      )}
      {onExportJson && (
        <Button variant="outline" size="sm" onClick={onExportJson} className="h-8 gap-1.5 text-xs shadow-2xs">
          <Download className="w-3.5 h-3.5" />
          Export JSON
        </Button>
      )}
      {extraActions}
    </div>
  );
};

export default ReportToolbar;
