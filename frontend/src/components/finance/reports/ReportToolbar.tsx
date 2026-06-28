import React from "react";
import { Button } from "../../ui/button";
import { Printer, RefreshCw, Download } from "lucide-react";

const ReportToolbar = ({
  onRefresh,
  onExportJson,
  isRefreshing,
}: {
  onRefresh?: unknown;
  onExportJson?: unknown;
  isRefreshing?: boolean;
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mb-4 flex items-center gap-2 print:hidden">
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw
          className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
        />
        Refresh
      </Button>
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" />
        Print
      </Button>
      {onExportJson && (
        <Button variant="outline" size="sm" onClick={onExportJson}>
          <Download className="mr-2 h-4 w-4" />
          Export JSON
        </Button>
      )}
    </div>
  );
};
export default ReportToolbar;
