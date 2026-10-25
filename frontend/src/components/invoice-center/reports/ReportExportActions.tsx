import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  exportToCsv,
  exportToPdf,
  printFullReport,
} from "@/utils/reportExportUtils";

export interface ExportColumnDef {
  header: string;
  accessorKey?: string;
  accessor?: (row: any) => any;
  exportValue?: (row: any) => any;
  cell?: (row: any) => any;
  align?: "left" | "center" | "right";
}

export interface ReportExportActionsProps {
  data: any;
  filename: string;
  title?: string;
  subtitle?: string;
  columns?: ExportColumnDef[];
  disabled?: boolean;
  onFetchAll?: () => Promise<any[]>;
  summaryCards?: Array<{ title: string; value: string | number }>;
}

export const ReportExportActions: React.FC<ReportExportActionsProps> = ({
  data,
  filename,
  title,
  subtitle,
  columns,
  disabled = false,
  onFetchAll,
  summaryCards,
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Helper to extract all rows across all pages if onFetchAll is provided
  const getAllRows = async (): Promise<any[]> => {
    if (onFetchAll) {
      try {
        const all = await onFetchAll();
        if (Array.isArray(all)) {
          return all;
        }
      } catch (err) {
        console.warn("onFetchAll error, falling back to local page data:", err);
      }
    }

    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.rows)) {
      return data.rows;
    }
    if (data && Array.isArray(data.lines)) {
      return data.lines;
    }
    return [];
  };

  // Helper to extract a clean string value from a row for a given column definition
  const extractValue = (row: any, col: ExportColumnDef): string => {
    if (!row) return "";

    // 1. Explicit exportValue extractor
    if (col.exportValue) {
      try {
        const val = col.exportValue(row);
        if (val !== null && val !== undefined) return String(val);
      } catch (e) {
        // fallback
      }
    }

    // 2. Custom accessor function
    if (col.accessor) {
      try {
        const val = col.accessor(row);
        if (val !== null && val !== undefined) return String(val);
      } catch (e) {
        // fallback
      }
    }

    // 3. Accessor Key (supports dotted paths like "customer.name")
    if (col.accessorKey) {
      const key = String(col.accessorKey);
      const val = key.includes(".")
        ? key.split(".").reduce((acc: any, part: string) => acc?.[part], row)
        : row[key];
      if (val !== null && val !== undefined && val !== "") {
        return String(val);
      }
    }

    // 4. Try matching normalized header name to row keys (e.g. "Total Outstanding" -> "total_outstanding")
    if (col.header) {
      const cleanHeader = col.header.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
      const candidateKeys = [
        cleanHeader,
        cleanHeader.replace(/_+/g, "_").replace(/^_|_$/g, ""),
        col.header.toLowerCase().replace(/\s+/g, ""),
      ];
      for (const ck of candidateKeys) {
        if (row[ck] !== undefined && row[ck] !== null && row[ck] !== "") {
          return String(row[ck]);
        }
      }
    }

    // 5. If cell function returns primitive or simple text
    if (col.cell) {
      try {
        const cellVal = col.cell(row);
        if (typeof cellVal === "string" || typeof cellVal === "number") {
          return String(cellVal);
        }
        if (cellVal && typeof cellVal === "object" && "props" in cellVal) {
          const children = cellVal.props?.children;
          if (typeof children === "string" || typeof children === "number") {
            return String(children);
          }
        }
      } catch (e) {
        // fallback
      }
    }

    return "";
  };

  const getHeadersAndMatrix = (
    rows: any[]
  ): {
    headers: string[];
    matrix: (string | number)[][];
    alignments: ("left" | "center" | "right")[];
  } => {
    let headers: string[] = [];
    let alignments: ("left" | "center" | "right")[] = [];

    if (columns && columns.length > 0) {
      headers = columns.map((col) => col.header);
      alignments = columns.map((col) => col.align || "left");

      const matrix = rows.map((row) =>
        columns.map((col) => extractValue(row, col))
      );
      return { headers, matrix, alignments };
    }

    // Fallback: extract keys from first row if no columns defined
    if (rows.length > 0 && rows[0] && typeof rows[0] === "object") {
      const keys = Object.keys(rows[0]);
      headers = keys.map((key) =>
        key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase())
      );
      alignments = keys.map(() => "left");
      const matrix = rows.map((row) =>
        keys.map((k) => (row[k] !== undefined && row[k] !== null ? String(row[k]) : ""))
      );
      return { headers, matrix, alignments };
    }

    return { headers: [], matrix: [], alignments: [] };
  };

  const handleExcelExport = async () => {
    try {
      setLoadingAction("excel");
      const rows = await getAllRows();

      if (!rows || rows.length === 0) {
        toast.error("No data available to export to Excel");
        return;
      }

      const { headers, matrix } = getHeadersAndMatrix(rows);
      exportToCsv(filename, headers, matrix);

      toast.success(`Exported ${rows.length} rows to Excel successfully`);
    } catch (error) {
      console.error("Excel export error", error);
      toast.error("Failed to export Excel report");
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePdfExport = async () => {
    try {
      setLoadingAction("pdf");
      const rows = await getAllRows();

      if (!rows || rows.length === 0) {
        toast.error("No data available to generate PDF");
        return;
      }

      const reportTitle =
        title ||
        filename
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

      const { headers, matrix, alignments } = getHeadersAndMatrix(rows);

      exportToPdf({
        title: reportTitle,
        filename,
        subtitle: subtitle || `Total Records: ${rows.length}`,
        headers,
        rows: matrix,
        alignments,
        summary: summaryCards,
      });

      toast.success(`Generated PDF for ${rows.length} records successfully`);
    } catch (error) {
      console.error("PDF export error", error);
      toast.error("Failed to generate PDF report");
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePrint = async () => {
    try {
      setLoadingAction("print");
      const rows = await getAllRows();

      if (!rows || rows.length === 0) {
        // fallback to standard window.print() if no rows
        window.print();
        return;
      }

      const reportTitle =
        title ||
        filename
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

      const { headers, matrix, alignments } = getHeadersAndMatrix(rows);

      printFullReport({
        title: reportTitle,
        subtitle: subtitle || `Total Records: ${rows.length}`,
        headers,
        rows: matrix,
        alignments,
        summary: summaryCards,
      });
    } catch (err) {
      console.error("Print error", err);
      // Fallback
      window.print();
    } finally {
      setLoadingAction(null);
    }
  };

  const handleJsonExport = async () => {
    try {
      setLoadingAction("json");
      const rows = await getAllRows();

      if (!rows || rows.length === 0) {
        toast.error("No data available to export");
        return;
      }

      const exportPayload = {
        title: title || filename,
        generated_at: new Date().toISOString(),
        total_records: rows.length,
        summary: summaryCards || null,
        data: rows,
      };

      const jsonString = JSON.stringify(exportPayload, null, 2);
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
    } finally {
      setLoadingAction(null);
    }
  };

  const isBusy = Boolean(loadingAction);

  return (
    <div className="flex items-center space-x-2 print:hidden flex-wrap gap-y-1.5">
      {/* 1. Export Excel Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleExcelExport}
        disabled={disabled || isBusy}
        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 shadow-2xs cursor-pointer"
        title="Export all pages and records to Excel / CSV"
      >
        {loadingAction === "excel" ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin text-emerald-600" />
        ) : (
          <FileSpreadsheet className="mr-1.5 h-4 w-4 text-emerald-600" />
        )}
        Export Excel
      </Button>

      {/* 2. Export PDF Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handlePdfExport}
        disabled={disabled || isBusy}
        className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 shadow-2xs cursor-pointer"
        title="Generate and download complete PDF report with all pages"
      >
        {loadingAction === "pdf" ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin text-rose-600" />
        ) : (
          <FileText className="mr-1.5 h-4 w-4 text-rose-600" />
        )}
        Export PDF
      </Button>

      {/* 3. Print / PDF Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        disabled={disabled || isBusy}
        className="border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
        title="Print full report with all pages"
      >
        {loadingAction === "print" ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin text-slate-600" />
        ) : (
          <Printer className="mr-1.5 h-4 w-4 text-slate-600" />
        )}
        Print
      </Button>

      {/* 4. JSON Export Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleJsonExport}
        disabled={disabled || isBusy}
        className="border-slate-200 text-slate-600 hover:bg-slate-50 shadow-2xs cursor-pointer"
        title="Export raw report data as JSON"
      >
        {loadingAction === "json" ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin text-slate-600" />
        ) : (
          <Download className="mr-1.5 h-4 w-4" />
        )}
        JSON
      </Button>
    </div>
  );
};
