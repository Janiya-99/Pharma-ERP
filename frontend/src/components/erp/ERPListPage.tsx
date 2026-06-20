/**
 * Reusable ERP table list page component.
 * Used across all module list pages.
 * Powered by @tanstack/react-table
 */
import React, { useState } from "react";
import { MdAdd, MdSearch, MdFilterList, MdDownload } from "react-icons/md";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";

type Column = { key: string; label: string; render?: (row: any) => React.ReactNode };

type StatusConfig = Record<string, string>;

const defaultStatusColors: StatusConfig = {
  Active: "bg-green-500 text-white dark:bg-green-600",
  Inactive: "bg-gray-500 text-white dark:bg-gray-600",
  Draft: "bg-gray-500 text-white dark:bg-gray-600",
  "Pending Approval": "bg-yellow-500 text-white dark:bg-yellow-600",
  Approved: "bg-blue-500 text-white dark:bg-blue-600",
  Posted: "bg-green-500 text-white dark:bg-green-600",
  Rejected: "bg-red-500 text-white dark:bg-red-600",
  Cancelled: "bg-red-500 text-white dark:bg-red-600",
  Paid: "bg-green-500 text-white dark:bg-green-600",
  "Partially Paid": "bg-amber-500 text-white dark:bg-amber-600",
  Unpaid: "bg-red-500 text-white dark:bg-red-600",
  "Near Expiry": "bg-orange-500 text-white dark:bg-orange-600",
  "On Hold": "bg-amber-500 text-white dark:bg-amber-600",
  Recalled: "bg-red-500 text-white dark:bg-red-600",
  Expired: "bg-red-600 text-white dark:bg-red-700",
  Success: "bg-green-500 text-white dark:bg-green-600",
  "In Progress": "bg-blue-500 text-white dark:bg-blue-600",
  Completed: "bg-green-500 text-white dark:bg-green-600",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = defaultStatusColors[status] || "bg-gray-500 text-white dark:bg-gray-600";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-transparent dark:border-white/5 ${cls}`}>
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
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
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
  onEdit,
  onDelete,
  isLoading = false,
}: ERPListPageProps) {
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const filtered = React.useMemo(() => {
    return data.filter((row) =>
      String(row[searchKey] || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search, searchKey]);

  const columnHelper = createColumnHelper<any>();

  const tableColumns = React.useMemo(() => {
    const cols = columns.map((col) =>
      columnHelper.accessor(col.key, {
        id: col.key,
        header: () => (
          <p className="text-[12px] font-bold text-gray-400 dark:text-gray-300">
            {col.label.toUpperCase()}
          </p>
        ),
        cell: (info) => (
          <div className="text-[13px] font-bold text-navy-700 dark:text-white">
            {col.render ? col.render(info.row.original) : info.getValue() ?? "—"}
          </div>
        ),
      })
    );

    if (onRowClick || onEdit || onDelete) {
      cols.push(
        columnHelper.display({
          id: "actions",
          header: () => (
            <p className="text-[12px] font-bold text-gray-400 dark:text-gray-300 text-right">
              ACTIONS
            </p>
          ),
          cell: (info) => (
            <div className="flex items-center justify-end gap-2">
              {onRowClick && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRowClick(info.row.original); }}
                  className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 text-[12px] font-bold hover:bg-brand-100 transition-colors"
                >
                  View
                </button>
              )}
              {onEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(info.row.original); }}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 text-[12px] font-bold hover:bg-amber-100 transition-colors"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(info.row.original); }}
                  className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-[12px] font-bold hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          ),
        })
      );
    }
    return cols;
  }, [columns, onRowClick, onEdit, onDelete]);

  const table = useReactTable({
    data: filtered,
    columns: tableColumns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="flex flex-col gap-4 py-4 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy-700 dark:text-white">{title}</h1>
          {subtitle && <p className="text-sm text-gray-400 dark:text-gray-400">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-navy-600 text-[13px] font-medium text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
            <MdDownload size={16} /> Export
          </button>
          {onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 text-white text-[13px] font-semibold hover:bg-brand-600 transition-all shadow-sm shadow-brand-200 dark:shadow-none"
            >
              <MdAdd size={18} /> {addLabel}
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:!bg-navy-800 rounded-xl border border-gray-100 dark:border-navy-700 shadow-sm overflow-hidden transition-all duration-200">
        {/* Search & Filter Bar */}
        <div className="px-4 py-3 border-b border-gray-50 dark:border-navy-700 flex flex-col sm:flex-row gap-2 sm:items-center bg-white dark:bg-navy-800">
          <div className="relative flex-1 max-w-xs">
            <MdSearch className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); table.setPageIndex(0); }}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-full bg-lightPrimary dark:bg-navy-900 text-navy-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all border border-transparent dark:border-navy-700"
            />
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-lightPrimary dark:bg-navy-900 text-[13px] font-medium text-navy-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all border border-transparent dark:border-navy-700">
            <MdFilterList size={16} /> Filters
          </button>
          <p className="text-[12px] text-gray-400 dark:text-gray-500 ml-auto shrink-0 font-medium">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto w-full">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-200 dark:border-navy-700">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-4 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors text-left"
                    >
                      <div className={`flex items-center gap-2 ${header.id === "actions" ? "justify-end" : ""}`}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <span className="text-gray-400 dark:text-gray-500">
                          {{
                            asc: "▲",
                            desc: "▼",
                          }[header.column.getIsSorted() as string] ?? null}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white dark:bg-navy-800">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500 dark:border-navy-600 dark:border-t-brand-400" />
                      <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Loading data...</p>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-16 text-center">
                    <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">No records found.</p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-50 dark:border-navy-700 hover:bg-gray-50/50 dark:hover:bg-navy-700/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50 dark:border-navy-700 bg-white dark:bg-navy-800">
            <p className="text-[12px] text-gray-400 dark:text-gray-500">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="flex items-center justify-center h-8 px-3 rounded-full text-[12px] font-medium bg-lightPrimary dark:bg-navy-900 text-navy-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-40 transition-all border border-transparent dark:border-navy-700"
              >
                Prev
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="flex items-center justify-center h-8 px-3 rounded-full text-[12px] font-medium bg-lightPrimary dark:bg-navy-900 text-navy-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-40 transition-all border border-transparent dark:border-navy-700"
              >
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
