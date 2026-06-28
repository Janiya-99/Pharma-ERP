import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationData {
  page: number;
  total_pages: number;
  total: number;
  limit: number;
}

const Pagination = ({
  pagination,
  onPageChange,
}: {
  pagination?: PaginationData;
  onPageChange?: (page: number) => void;
}) => {
  if (!pagination || pagination.total_pages <= 1) return null;

  const { page, total_pages, total, limit } = pagination;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between rounded-b-2xl border-t border-gray-100 bg-gray-50/50 px-5 py-3">
      <p className="text-[12px] font-medium text-gray-500">
        Showing{" "}
        <span className="font-semibold text-gray-700">
          {startItem}–{endItem}
        </span>{" "}
        of <span className="font-semibold text-gray-700">{total}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange?.(page - 1)}
          disabled={page === 1}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="min-w-[52px] rounded-lg bg-indigo-600 px-3 py-0.5 text-center text-[12px] font-semibold text-white">
          {page} / {total_pages}
        </span>
        <button
          onClick={() => onPageChange?.(page + 1)}
          disabled={page === total_pages}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
