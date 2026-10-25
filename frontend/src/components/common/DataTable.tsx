import React, { useState, useEffect } from "react";
import { Loader2, Inbox } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { TablePagination } from "./TablePagination";

export interface Column<TData = any> {
  header: string;
  accessor?: string;
  accessorKey?: string;
  id?: string;
  cell?: (info: { row: { original: TData } } | any) => React.ReactNode;
  cellClassName?: string;
  className?: string;
}

export interface DataTableProps<TData = any> {
  columns: Column<TData>[];
  data: TData[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyMessage?: string;
  pagination?:
    | {
        pageIndex?: number;
        pageSize?: number;
        page?: number;
        limit?: number;
        [key: string]: any;
      }
    | false;
  onPaginationChange?: (pagination: any) => void;
  pageCount?: number;
  totalRecords?: number;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  disablePagination?: boolean;
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
  emptyMessage,
  pagination,
  onPaginationChange,
  pageCount,
  totalRecords,
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 10,
  disablePagination = false,
  onEdit,
  onDelete,
  onRowClick,
}: DataTableProps<TData>) {
  const hasActions = Boolean(onEdit || onDelete);
  const displayEmptyTitle = emptyMessage || emptyTitle;

  // Uncontrolled (client-side) pagination state
  const [clientPageIndex, setClientPageIndex] = useState(0);
  const [clientPageSize, setClientPageSize] = useState(defaultPageSize);

  // When data changes or shrinks, ensure clientPageIndex remains in range
  useEffect(() => {
    if (data && clientPageIndex > 0 && clientPageIndex * clientPageSize >= data.length) {
      setClientPageIndex(0);
    }
  }, [data, clientPageIndex, clientPageSize]);

  if (loading && (!data || data.length === 0)) {
    return (
      <div className="glass-table overflow-hidden bg-white border border-slate-100 shadow-xs rounded-xl">
        <Table>
          <TableHeader className="border-b border-slate-100 bg-slate-50/50">
            <TableRow className="hover:bg-transparent">
              {columns.map((col, index) => (
                <TableHead
                  key={col.id || col.accessorKey || col.accessor || index}
                  className={`text-slate-500 h-auto whitespace-nowrap border-none px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    col.className || ""
                  }`}
                >
                  {col.header}
                </TableHead>
              ))}
              {hasActions && (
                <TableHead className="text-slate-500 h-auto whitespace-nowrap border-none px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-slate-100 divide-y">
            {Array.from({ length: 6 }).map((_, rIdx) => (
              <TableRow key={rIdx} className="border-none animate-pulse">
                {columns.map((col, cIdx) => (
                  <TableCell
                    key={col.id || col.accessorKey || col.accessor || cIdx}
                    className="border-none px-6 py-4"
                  >
                    <div
                      className="h-4 rounded-md bg-slate-200/80"
                      style={{
                        width: `${Math.max(45, ((rIdx + cIdx) * 23 + 45) % 85)}%`,
                      }}
                    />
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell className="border-none px-6 py-4 text-right">
                    <div className="inline-block h-6 w-16 rounded-md bg-slate-200/80" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center gap-3 py-20">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            background: "rgba(238,242,255,0.5)",
            border: "1px solid rgba(148,163,184,0.15)",
          }}
        >
          <Inbox className="text-slate-400 h-6 w-6" />
        </div>
        <div className="text-center">
          <p className="text-slate-900 text-sm font-semibold">{displayEmptyTitle}</p>
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

  // Determine whether pagination is controlled (server-side) or uncontrolled (client-side)
  const isControlled = Boolean(pagination && onPaginationChange && pagination !== false);
  const isPaginationDisabled = disablePagination || pagination === false;

  let activePageIndex = 0;
  let activePageSize = defaultPageSize;
  let activeTotalItems = data.length;
  let activePageCount = 1;
  let rowsToDisplay = data;

  if (isPaginationDisabled) {
    rowsToDisplay = data;
  } else if (isControlled && typeof pagination === "object" && pagination !== null) {
    activePageIndex =
      pagination.pageIndex ?? (pagination.page != null ? pagination.page - 1 : 0);
    activePageSize =
      pagination.pageSize ?? (pagination.limit != null ? pagination.limit : 10);
    activeTotalItems =
      totalRecords ??
      (pageCount != null ? pageCount * activePageSize : data.length);
    activePageCount =
      pageCount ?? Math.max(1, Math.ceil(activeTotalItems / activePageSize));
    rowsToDisplay = data;
  } else {
    activePageIndex = clientPageIndex;
    activePageSize = clientPageSize;
    activeTotalItems = data.length;
    activePageCount = Math.max(1, Math.ceil(activeTotalItems / activePageSize));
    const start = clientPageIndex * clientPageSize;
    rowsToDisplay = data.slice(start, start + clientPageSize);
  }

  const handlePageChange = (newPageIndex: number) => {
    if (isControlled && typeof pagination === "object" && pagination !== null) {
      onPaginationChange?.({
        ...pagination,
        pageIndex: newPageIndex,
        page: newPageIndex + 1,
      });
    } else {
      setClientPageIndex(newPageIndex);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (isControlled && typeof pagination === "object" && pagination !== null) {
      onPaginationChange?.({
        ...pagination,
        pageIndex: 0,
        page: 1,
        pageSize: newPageSize,
        limit: newPageSize,
      });
    } else {
      setClientPageSize(newPageSize);
      setClientPageIndex(0);
    }
  };

  const renderCellContent = (col: Column<TData>, row: any) => {
    if (col.cell) {
      const context = {
        row: {
          original: row,
          ...row,
        },
        ...row,
        original: row,
      };
      try {
        return (col.cell as any)(context);
      } catch {
        return (col.cell as any)(row);
      }
    }

    const accessorPath = col.accessorKey || col.accessor;
    if (accessorPath) {
      const val = resolveAccessor(row, accessorPath);
      if (val === null || val === undefined || val === "") {
        return <span className="text-slate-300 select-none">—</span>;
      }
      return String(val);
    }

    return <span className="text-slate-300 select-none">—</span>;
  };

  return (
    <div className="w-full">
      <div className="glass-table overflow-hidden bg-white border border-slate-100 shadow-xs rounded-xl">
        <Table>
          <TableHeader className="border-b border-slate-100 bg-slate-50/40">
            <TableRow className="hover:bg-transparent">
              {columns.map((col, index) => (
                <TableHead
                  key={col.id || col.accessorKey || col.accessor || index}
                  className={`text-slate-500 h-auto whitespace-nowrap border-none px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    col.className || ""
                  }`}
                >
                  {col.header}
                </TableHead>
              ))}
              {hasActions && (
                <TableHead className="text-slate-500 h-auto whitespace-nowrap border-none px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-slate-100 divide-y">
            {rowsToDisplay.map((row, rowIndex) => (
              <TableRow
                key={((row as any).id as string) || rowIndex}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`group border-none transition-colors duration-150 hover:bg-slate-50/60 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((col, colIndex) => (
                  <TableCell
                    key={col.id || col.accessorKey || col.accessor || colIndex}
                    className={`text-slate-600 border-none px-6 py-4 text-sm font-medium ${
                      col.cellClassName || ""
                    }`}
                  >
                    {renderCellContent(col, row)}
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell className="border-none px-6 py-4 text-sm">
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

        {/* Integrated Pagination */}
        {!isPaginationDisabled && data.length > 0 && (
          <TablePagination
            pageIndex={activePageIndex}
            pageSize={activePageSize}
            totalItems={activeTotalItems}
            pageCount={activePageCount}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={pageSizeOptions}
          />
        )}
      </div>
    </div>
  );
}

export default DataTable;
