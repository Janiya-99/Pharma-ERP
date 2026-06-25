import React from "react";
import { Loader2, Inbox, ChevronLeft, ChevronRight } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm gap-3">
        <div className="relative">
          <div className="h-10 w-10 rounded-full border-2 border-indigo-100" />
          <Loader2 className="absolute inset-0 h-10 w-10 animate-spin text-indigo-600" />
        </div>
        <p className="text-sm text-gray-400 font-medium">Loading data…</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 border border-gray-100">
          <Inbox className="h-6 w-6 text-gray-300" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700">{emptyTitle}</p>
          {emptyDescription && (
            <p className="text-xs text-gray-400 mt-0.5">{emptyDescription}</p>
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
      <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="bg-gray-50/80">
              {columns.map((col, index) => (
                <th
                  key={col.id || col.accessorKey || col.accessor || index}
                  scope="col"
                  className={`px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
              {hasActions && (
                <th scope="col" className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {data.map((row, rowIndex) => (
              <tr
                key={(row as any).id as string || rowIndex}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`hover:bg-indigo-50/30 transition-colors duration-100 group ${onRowClick ? "cursor-pointer" : ""}`}
              >
                {columns.map((col, colIndex) => {
                  const accessorPath = col.accessorKey || col.accessor;
                  return (
                    <td
                      key={col.id || col.accessorKey || col.accessor || colIndex}
                      className={`px-5 py-3.5 text-sm text-gray-700 ${col.cellClassName || ""}`}
                    >
                      {col.cell
                        ? col.cell({ row: { original: row } })
                        : accessorPath
                        ? String(resolveAccessor(row, accessorPath) ?? "—")
                        : "—"}
                    </td>
                  );
                })}
                {hasActions && (
                  <td className="px-5 py-3.5 text-sm">
                    <div className="flex items-center gap-1">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors duration-150"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && onPaginationChange && pageCount != null && pageCount > 1 && (
        <div className="flex items-center justify-between px-2 py-3 mt-3">
          <p className="text-xs text-gray-500">
            Page {pagination.pageIndex + 1} of {pageCount}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={pagination.pageIndex === 0}
              onClick={() => onPaginationChange({ ...pagination, pageIndex: pagination.pageIndex - 1 })}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={pagination.pageIndex >= pageCount - 1}
              onClick={() => onPaginationChange({ ...pagination, pageIndex: pagination.pageIndex + 1 })}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
