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
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
      <p className="text-[12px] text-gray-500 font-medium">
        Showing{" "}
        <span className="font-semibold text-gray-700">{startItem}–{endItem}</span>{" "}
        of{" "}
        <span className="font-semibold text-gray-700">{total}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange?.(page - 1)}
          disabled={page === 1}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="px-3 py-0.5 rounded-lg bg-indigo-600 text-white text-[12px] font-semibold min-w-[52px] text-center">
          {page} / {total_pages}
        </span>
        <button
          onClick={() => onPageChange?.(page + 1)}
          disabled={page === total_pages}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
