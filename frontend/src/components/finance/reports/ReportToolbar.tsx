import React from 'react';
import { Button } from '../../ui/button';
import { Printer, RefreshCw, Download } from 'lucide-react';

const ReportToolbar = ({ onRefresh, onExportJson, isRefreshing }: { onRefresh?: unknown; onExportJson?: unknown; isRefreshing?: boolean }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2 mb-4 print:hidden">
      <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}>
        <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <Printer className="w-4 h-4 mr-2" />
        Print
      </Button>
      {onExportJson && (
        <Button variant="outline" size="sm" onClick={onExportJson}>
          <Download className="w-4 h-4 mr-2" />
          Export JSON
        </Button>
      )}
    </div>
  );
};
export default ReportToolbar;
