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
      <div className="glass-card flex flex-col items-center justify-center gap-3 py-20">
        <div className="relative">
          <div className="h-10 w-10 rounded-full border-2" style={{ borderColor: 'rgba(148,163,184,0.2)' }} />
          <Loader2 className="text-slate-900 absolute inset-0 h-10 w-10 animate-spin" />
        </div>
        <p className="text-slate-500 text-sm font-semibold">Loading data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center gap-3 py-20">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'rgba(238,242,255,0.5)', border: '1px solid rgba(148,163,184,0.15)' }}>
          <Inbox className="text-slate-400 h-6 w-6" />
        </div>
        <div className="text-center">
          <p className="text-slate-900 text-sm font-semibold">{emptyTitle}</p>
          {emptyDescription && (
            <p className="text-slate-400 mt-1 text-xs">{emptyDescription}</p>
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
      <div className="glass-table overflow-hidden bg-white border border-slate-100 shadow-sm rounded-xl">
        <Table>
          <TableHeader className="border-b border-slate-100 bg-slate-50/30">
            <TableRow className="hover:bg-transparent">
              {columns.map((col, index) => (
                <TableHead
                  key={col.id || col.accessorKey || col.accessor || index}
                  className={`text-slate-500 h-auto whitespace-nowrap border-none px-6 py-4.5 text-left text-xs font-semibold uppercase tracking-wider ${
                    col.className || ""
                  }`}
                >
                  {col.header}
                </TableHead>
              ))}
              {hasActions && (
                <TableHead className="text-slate-500 h-auto whitespace-nowrap border-none px-6 py-4.5 text-right text-xs font-semibold uppercase tracking-wider">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-slate-100 divide-y">
            {data.map((row, rowIndex) => (
              <TableRow
                key={((row as any).id as string) || rowIndex}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`group border-none transition-colors duration-150 hover:bg-slate-50/50 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((col, colIndex) => {
                  const accessorPath = col.accessorKey || col.accessor;
                  return (
                    <TableCell
                      key={
                        col.id || col.accessorKey || col.accessor || colIndex
                      }
                      className={`text-slate-600 border-none px-6 py-4.5 text-sm font-medium ${
                        col.cellClassName || ""
                      }`}
                    >
                      {col.cell
                        ? col.cell(row)
                        : accessorPath
                        ? (() => {
                            const val = resolveAccessor(row, accessorPath);
                            if (val === null || val === undefined || val === "") {
                              return <span className="text-slate-300 select-none">—</span>;
                            }
                            return String(val);
                          })()
                        : <span className="text-slate-300 select-none">—</span>}
                    </TableCell>
                  );
                })}
                {hasActions && (
                  <TableCell className="border-none px-6 py-4.5 text-sm">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      {onEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(row);
                          }}
                          className="text-slate-400 hover:bg-slate-100 hover:text-slate-900 inline-flex h-8 w-8 items-center justify-center rounded-xl transition-colors opacity-80 hover:opacity-100"
                          title="Edit"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                          </svg>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(row);
                          }}
                          className="text-slate-400 hover:bg-rose-50 hover:text-rose-600 inline-flex h-8 w-8 items-center justify-center rounded-xl transition-colors opacity-80 hover:opacity-100"
                          title="Delete"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
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
      {pagination &&
        onPaginationChange &&
        pageCount != null &&
        pageCount > 1 && (
          <div className="mt-3 flex items-center justify-between px-2 py-3">
            <p className="text-slate-500 text-xs font-medium">
              Page {pagination.pageIndex + 1} of {pageCount}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={pagination.pageIndex === 0}
                onClick={() =>
                  onPaginationChange({
                    ...pagination,
                    pageIndex: pagination.pageIndex - 1,
                  })
                }
                className="border-slate-200 text-slate-500 hover:bg-slate-50 inline-flex h-8 w-8 items-center justify-center rounded-xl border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={pagination.pageIndex >= pageCount - 1}
                onClick={() =>
                  onPaginationChange({
                    ...pagination,
                    pageIndex: pagination.pageIndex + 1,
                  })
                }
                className="border-slate-200 text-slate-500 hover:bg-slate-50 inline-flex h-8 w-8 items-center justify-center rounded-xl border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
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
