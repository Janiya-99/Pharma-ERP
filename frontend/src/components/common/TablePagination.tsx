import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export interface TablePaginationProps {
  /** 0-based page index */
  pageIndex?: number;
  /** 1-based page number (alternative to pageIndex) */
  page?: number;
  /** Number of items per page */
  pageSize: number;
  /** Total count of items */
  totalItems: number;
  /** Optional override for total page count */
  pageCount?: number;
  /** Callback when page changes (returns 0-based pageIndex) */
  onPageChange: (pageIndex: number) => void;
  /** Callback when page size changes */
  onPageSizeChange?: (pageSize: number) => void;
  /** Options for rows per page */
  pageSizeOptions?: number[];
  /** Optional class name */
  className?: string;
  /** Whether to show the page size selector (default true) */
  showPageSize?: boolean;
  /** Whether to show the 'Showing X to Y of Z entries' summary (default true) */
  showSummary?: boolean;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  pageIndex,
  page,
  pageSize,
  totalItems,
  pageCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className = "",
  showPageSize = true,
  showSummary = true,
}) => {
  const activePageIndex = pageIndex ?? (page != null ? page - 1 : 0);
  const totalPages = Math.max(
    1,
    pageCount ?? Math.ceil((totalItems || 0) / (pageSize || 10))
  );

  const safePageIndex = Math.min(Math.max(0, activePageIndex), totalPages - 1);
  const from = totalItems === 0 ? 0 : safePageIndex * pageSize + 1;
  const to = Math.min((safePageIndex + 1) * pageSize, totalItems);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const pages: (number | "ellipsis-left" | "ellipsis-right")[] = [0];

    const startWindow = Math.max(1, safePageIndex - 1);
    const endWindow = Math.min(totalPages - 2, safePageIndex + 1);

    if (startWindow > 1) {
      pages.push("ellipsis-left");
    }

    for (let i = startWindow; i <= endWindow; i++) {
      pages.push(i);
    }

    if (endWindow < totalPages - 2) {
      pages.push("ellipsis-right");
    }

    pages.push(totalPages - 1);
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-slate-100 bg-white/60 text-xs text-slate-500 select-none ${className}`}
    >
      {/* Left side: Item count summary & Page size selector */}
      <div className="flex flex-wrap items-center gap-3">
        {showSummary && (
          <p className="font-medium text-slate-600">
            Showing <span className="font-semibold text-slate-900">{from}</span>{" "}
            to <span className="font-semibold text-slate-900">{to}</span> of{" "}
            <span className="font-semibold text-slate-900">{totalItems}</span>{" "}
            entries
          </p>
        )}

        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-slate-400">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right side: Navigation Controls */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <button
          type="button"
          disabled={safePageIndex <= 0}
          onClick={() => onPageChange(0)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-35"
          title="First page"
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* Previous page */}
        <button
          type="button"
          disabled={safePageIndex <= 0}
          onClick={() => onPageChange(safePageIndex - 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-35"
          title="Previous page"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 px-1">
          {pageNumbers.map((item, idx) => {
            if (typeof item === "string") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="inline-flex h-8 w-6 items-center justify-center text-slate-400 font-bold"
                >
                  ...
                </span>
              );
            }

            const isCurrent = item === safePageIndex;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={isCurrent ? "page" : undefined}
                className={`inline-flex h-8 min-w-[32px] px-2 items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                  isCurrent
                    ? "bg-indigo-600 text-white shadow-xs shadow-indigo-200 pointer-events-none"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {item + 1}
              </button>
            );
          })}
        </div>

        {/* Next page */}
        <button
          type="button"
          disabled={safePageIndex >= totalPages - 1}
          onClick={() => onPageChange(safePageIndex + 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-35"
          title="Next page"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Last page */}
        <button
          type="button"
          disabled={safePageIndex >= totalPages - 1}
          onClick={() => onPageChange(totalPages - 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-35"
          title="Last page"
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default TablePagination;
