import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

  useEffect(() => {
    if (clientPageIndex > 0 && clientPageIndex * clientPageSize >= rows.length) {
      setClientPageIndex(0);
    }
  }, [rows, clientPageIndex, clientPageSize]);

  if (isLoading) {
    return (
      <ReportLoadingState type="table" columns={columns.length} rows={5} />
    );
  }

  if (rows.length === 0) {
    return <ReportEmptyState message={emptyMessage} />;
  }

  const isControlled = Boolean(pagination && onPageChange);

  const displayRows = useMemo(() => {
    if (disablePagination || isControlled) {
      return rows;
    }
    const start = clientPageIndex * clientPageSize;
    return rows.slice(start, start + clientPageSize);
  }, [disablePagination, isControlled, rows, clientPageIndex, clientPageSize]);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 sticky top-0">
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
