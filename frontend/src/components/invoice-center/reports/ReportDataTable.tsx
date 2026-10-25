import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { ReportEmptyState } from "./ReportEmptyState";
import { ReportLoadingState } from "./ReportLoadingState";
import { TablePagination } from "@/components/common/TablePagination";

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T | string;
  cell?: (row: T) => React.ReactNode;
  align?: "left" | "center" | "right";
}

interface ReportDataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  disablePagination?: boolean;
  defaultPageSize?: number;
}

export function ReportDataTable<T>({
  columns,
  data,
  isLoading = false,
  pagination,
  onPageChange,
  emptyMessage = "No data found for the selected criteria.",
  disablePagination = false,
  defaultPageSize = 10,
}: ReportDataTableProps<T>) {
  const [clientPageIndex, setClientPageIndex] = useState(0);
  const [clientPageSize, setClientPageSize] = useState(defaultPageSize);

  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const isControlled = Boolean(pagination && onPageChange);

  const displayRows = useMemo(() => {
    if (disablePagination || isControlled) {
      return rows;
    }
    const start = clientPageIndex * clientPageSize;
    return rows.slice(start, start + clientPageSize);
  }, [disablePagination, isControlled, rows, clientPageIndex, clientPageSize]);

  useEffect(() => {
    setClientPageIndex(0);
  }, [data]);

  useEffect(() => {
    if (clientPageIndex > 0 && clientPageIndex * clientPageSize >= rows.length) {
      setClientPageIndex(0);
    }
  }, [rows, clientPageIndex, clientPageSize]);

  if (isLoading && rows.length === 0) {
    return (
      <ReportLoadingState
        type="table"
        columns={columns.length}
        columnHeaders={columns.map((c) => c.header)}
        rows={6}
        message="Loading report records..."
      />
    );
  }

  if (!isLoading && rows.length === 0) {
    return <ReportEmptyState message={emptyMessage} />;
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
        {/* Top loading progress bar during refresh */}
        {isLoading && (
          <div className="absolute top-0 inset-x-0 h-0.5 bg-slate-100 overflow-hidden z-20">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-600 animate-pulse w-full" />
          </div>
        )}

        {/* Floating loading badge if updating with data */}
        {isLoading && (
          <div className="absolute inset-0 top-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] z-20 pointer-events-none transition-all">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-5 py-2.5 shadow-xl ring-1 ring-slate-900/5">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600 shrink-0" />
              <span className="text-xs font-bold text-slate-800">Updating report data...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 sticky top-0 border-b border-slate-100">
              <TableRow>
                {columns.map((col, index) => (
                  <TableHead
                    key={index}
                    className={`text-slate-600 text-xs uppercase tracking-wider whitespace-nowrap font-semibold px-4 py-3.5 ${
                      col.align === "right"
                        ? "text-right"
                        : col.align === "center"
                        ? "text-center"
                        : "text-left"
                    }`}
                  >
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {displayRows.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-slate-50/60 transition-colors">
                  {columns.map((col, colIndex) => (
                    <TableCell
                      key={colIndex}
                      className={`whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-700 ${
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                          ? "text-center"
                          : "text-left"
                      }`}
                    >
                      {col.cell
                        ? col.cell(row)
                        : String((row as any)[col.accessorKey as string] || "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination bar */}
        {!disablePagination && isControlled && pagination && onPageChange && (
          <TablePagination
            pageIndex={pagination.page - 1}
            pageSize={pagination.limit}
            totalItems={pagination.total}
            pageCount={pagination.totalPages}
            onPageChange={(zeroBasedPage) => onPageChange(zeroBasedPage + 1)}
            showPageSize={false}
          />
        )}

        {!disablePagination && !isControlled && rows.length > 0 && (
          <TablePagination
            pageIndex={clientPageIndex}
            pageSize={clientPageSize}
            totalItems={rows.length}
            onPageChange={setClientPageIndex}
            onPageSizeChange={(newSize) => {
              setClientPageSize(newSize);
              setClientPageIndex(0);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default ReportDataTable;
