/**
 * Reusable ERP table list page component.
 * Used across all module list pages.
 */
import React, { useState } from "react";
import { MdAdd, MdSearch, MdFilterList, MdDownload } from "react-icons/md";

type Column = { key: string; label: string; render?: (row: any) => React.ReactNode };

type StatusConfig = Record<string, string>;

const defaultStatusColors: StatusConfig = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-gray-100 text-gray-500",
  Draft: "bg-gray-100 text-gray-600",
  "Pending Approval": "bg-yellow-100 text-yellow-700",
  Approved: "bg-blue-100 text-blue-700",
  Posted: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Cancelled: "bg-red-100 text-red-500",
  Paid: "bg-green-100 text-green-700",
  "Partially Paid": "bg-amber-100 text-amber-700",
  Unpaid: "bg-red-100 text-red-700",
  "Near Expiry": "bg-orange-100 text-orange-700",
  "On Hold": "bg-amber-100 text-amber-700",
  Recalled: "bg-red-100 text-red-700",
  Expired: "bg-red-100 text-red-600",
  Success: "bg-green-100 text-green-700",
  "In Progress": "bg-blue-100 text-blue-600",
  Completed: "bg-green-100 text-green-700",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = defaultStatusColors[status] || "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>
      {status}
    </span>
  );
}

type ERPListPageProps = {
  title: string;
  subtitle?: string;
  columns: Column[];
  data: any[];
  onAdd?: () => void;
  addLabel?: string;
  searchKey?: string;
  onRowClick?: (row: any) => void;
  isLoading?: boolean;
};

export function ERPListPage({
  title,
  subtitle,
  columns,
  data,
  onAdd,
  addLabel = "Add New",
  searchKey = "name",
  onRowClick,
  isLoading = false,
}: ERPListPageProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = data.filter((row) =>
    String(row[searchKey] || "").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="flex flex-col gap-4 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy-700 dark:text-white">{title}</h1>
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-all">
            <MdDownload size={16} /> Export
          </button>
          {onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 text-white text-[13px] font-semibold hover:bg-brand-600 transition-all shadow-sm shadow-brand-200"
            >
              <MdAdd size={18} /> {addLabel}
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="px-4 py-3 border-b border-gray-50 flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative flex-1 max-w-xs">
            <MdSearch className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-full bg-lightPrimary text-navy-700 dark:bg-navy-900 dark:text-white placeholder:text-gray-400 focus:outline-none transition-all"
            />
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-lightPrimary text-[13px] font-medium text-navy-700 hover:bg-gray-100 dark:bg-navy-900 dark:text-white dark:hover:bg-white/10 transition-all">
            <MdFilterList size={16} /> Filters
          </button>
          <p className="text-[12px] text-gray-400 ml-auto shrink-0 font-medium">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-navy-700">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500" />
                      <p className="text-sm text-gray-400 font-medium">Loading data...</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-16 text-center">
                    <p className="text-sm text-gray-400 font-medium">No records found.</p>
                  </td>
                </tr>
              ) : (
                paginated.map((row, i) => (
                  <tr key={i} className={`hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`} onClick={() => onRowClick?.(row)}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-[13px] text-gray-700 dark:text-gray-300">
                        {col.render ? col.render(row) : row[col.key] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
            <p className="text-[12px] text-gray-400">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                className="flex items-center justify-center h-8 px-3 rounded-full text-[12px] font-medium bg-lightPrimary text-navy-700 hover:bg-gray-100 disabled:opacity-40 transition-all dark:bg-navy-900 dark:text-white dark:hover:bg-white/10">
                Prev
              </button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="flex items-center justify-center h-8 px-3 rounded-full text-[12px] font-medium bg-lightPrimary text-navy-700 hover:bg-gray-100 disabled:opacity-40 transition-all dark:bg-navy-900 dark:text-white dark:hover:bg-white/10">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ERPListPage;
