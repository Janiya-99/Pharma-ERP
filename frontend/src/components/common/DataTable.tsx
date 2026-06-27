import React from "react";
import { Loader2, Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export interface Column<TData = any> {
  header: string;
  accessor?: string;
  accessorKey?: string;
  id?: string;
  cell?: (info: { row: { original: TData } }) => React.ReactNode;
  cellClassName?: string;
  className?: string;
}

export interface DataTableProps<TData = any> {
  columns: Column<TData>[];
  data: TData[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  pagination?: any;
  onPaginationChange?: any;
  pageCount?: number;
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  onRowClick?: (row: TData) => void;
}

function DataTable<TData = any>({
  columns,
  data,
  loading,
  emptyTitle = "No records found",
  emptyDescription = "",
  pagination,
  onPaginationChange,
  pageCount,
  onEdit,
  onDelete,
  onRowClick,
}: DataTableProps<TData>) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm gap-3">
        <div className="relative">
          <div className="h-10 w-10 rounded-full border-2 border-slate-100" />
          <Loader2 className="absolute inset-0 h-10 w-10 animate-spin text-slate-900" />
        </div>
        <p className="text-sm text-slate-500 font-semibold">Loading data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100">
          <Inbox className="h-6 w-6 text-slate-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-900">{emptyTitle}</p>
          {emptyDescription && (
            <p className="text-xs text-slate-400 mt-1">{emptyDescription}</p>
          )}
        </div>
      </div>
    );
  }

  // Resolve a dotted accessor path like "branch.branch_name"
  const resolveAccessor = (row: any, key: string) => {
    return key.split(".").reduce((obj: any, k: string) => obj?.[k], row);
  };

  // Determine whether we need an actions column
  const hasActions = onEdit || onDelete;

  return (
    <div>
      <div className="overflow-hidden bg-white rounded-2xl border border-slate-150 shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/75 border-b border-slate-100">
            <TableRow className="hover:bg-transparent">
              {columns.map((col, index) => (
                <TableHead
                  key={col.id || col.accessorKey || col.accessor || index}
                  className={`px-5 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap h-auto border-none ${col.className || ""}`}
                >
                  {col.header}
                </TableHead>
              ))}
              {hasActions && (
                <TableHead className="px-5 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap h-auto border-none">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100">
            {data.map((row, rowIndex) => (
              <TableRow
                key={(row as any).id as string || rowIndex}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`hover:bg-slate-50/50 transition-colors duration-150 border-none group ${onRowClick ? "cursor-pointer" : ""}`}
              >
                {columns.map((col, colIndex) => {
                  const accessorPath = col.accessorKey || col.accessor;
                  return (
                    <TableCell
                      key={col.id || col.accessorKey || col.accessor || colIndex}
                      className={`px-5 py-4 text-sm text-slate-900 border-none font-medium ${col.cellClassName || ""}`}
                    >
                      {col.cell
                        ? col.cell(row)
                        : accessorPath
                        ? String(resolveAccessor(row, accessorPath) ?? "—")
                        : "—"}
                    </TableCell>
                  );
                })}
                {hasActions && (
                  <TableCell className="px-5 py-4 text-sm border-none">
                    <div className="flex items-center gap-1">
                      {onEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(row);
                          }}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(row);
                          }}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && onPaginationChange && pageCount != null && pageCount > 1 && (
        <div className="flex items-center justify-between px-2 py-3 mt-3">
          <p className="text-xs text-slate-500 font-medium">
            Page {pagination.pageIndex + 1} of {pageCount}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={pagination.pageIndex === 0}
              onClick={() => onPaginationChange({ ...pagination, pageIndex: pagination.pageIndex - 1 })}
              className="inline-flex items-center justify-center h-8 w-8 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={pagination.pageIndex >= pageCount - 1}
              onClick={() => onPaginationChange({ ...pagination, pageIndex: pagination.pageIndex + 1 })}
              className="inline-flex items-center justify-center h-8 w-8 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
