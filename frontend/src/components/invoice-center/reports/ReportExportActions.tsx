import React from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

export interface ExportColumnDef {
  header: string;
  accessorKey?: string;
  accessor?: (row: any) => any;
}

interface ReportExportActionsProps {
  data: any;
  filename: string;
  columns?: ExportColumnDef[];
  disabled?: boolean;
}

export const ReportExportActions: React.FC<ReportExportActionsProps> = ({
  data,
  filename,
  columns,
  disabled = false,
}) => {
  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.error("Print error", err);
      toast.error("Failed to trigger print dialog");
    }
  };

  const handleExcelExport = () => {
    try {
      let rows: any[] = [];
      if (Array.isArray(data)) {
        rows = data;
      } else if (data && Array.isArray(data.rows)) {
        rows = data.rows;
      }

      if (!rows || rows.length === 0) {
        toast.error("No data available to export to Excel");
        return;
      }

      let headerNames: string[] = [];
      let rowExtractors: ((row: any) => any)[] = [];

      if (columns && columns.length > 0) {
        headerNames = columns.map((col) => col.header);
        rowExtractors = columns.map((col) => {
          if (col.accessor) return col.accessor;
          if (col.accessorKey) return (row: any) => row[col.accessorKey as string];
          return () => "";
        });
      } else {
        const keys = Object.keys(rows[0]);
        headerNames = keys.map((key) =>
          key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase())
        );
        rowExtractors = keys.map((key) => (row: any) => row[key]);
      }

      const csvLines: string[] = [
        headerNames.map((h) => `"${h.replace(/"/g, '""')}"`).join(","),
      ];

      for (const row of rows) {
        const line = rowExtractors
          .map((extract) => {
            const rawVal = extract(row);
            if (rawVal === null || rawVal === undefined) return '""';
            if (typeof rawVal === "object") {
              return `"${JSON.stringify(rawVal).replace(/"/g, '""')}"`;
            }
            const stringVal = String(rawVal);
            return `"${stringVal.replace(/"/g, '""')}"`;
          })
          .join(",");
        csvLines.push(line);
      }

      const csvBlobContent = "\uFEFF" + csvLines.join("\r\n");
      const blob = new Blob([csvBlobContent], {
        type: "text/csv;charset=utf-8;",
      });
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `${filename}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(downloadUrl);

      toast.success("Excel / CSV exported successfully");
    } catch (error) {
      console.error("Excel export error", error);
      toast.error("Failed to export Excel report");
    }
  };

  const handleJsonExport = () => {
    try {
      if (!data || (Array.isArray(data) && data.length === 0)) {
        toast.error("No data available to export");
        return;
      }

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = href;
      link.download = `${filename}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);

      toast.success("JSON exported successfully");
    } catch (error) {
      console.error("Export error", error);
      toast.error("Failed to export data");
    }
  };

  return (
    <div className="flex items-center space-x-2 print:hidden">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExcelExport}
        disabled={disabled}
        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
      >
        <FileSpreadsheet className="mr-1.5 h-4 w-4 text-emerald-600" />
        Export Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        disabled={disabled}
        className="border-slate-200 text-slate-700 hover:bg-slate-50"
      >
        <Printer className="mr-1.5 h-4 w-4 text-slate-600" />
        Print / PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleJsonExport}
        disabled={disabled}
        className="border-slate-200 text-slate-600 hover:bg-slate-50"
      >
        <Download className="mr-1.5 h-4 w-4" />
        JSON
      </Button>
    </div>
  );
};
