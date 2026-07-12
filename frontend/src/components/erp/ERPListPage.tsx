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

type Column = {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
};

type StatusConfig = Record<string, string>;

const defaultStatusColors: StatusConfig = {
  Active: "bg-green-500 text-white ",
  Inactive: "bg-gray-500 text-white ",
  Draft: "bg-gray-500 text-white ",
  "Pending Approval": "bg-yellow-500 text-white ",
  Approved: "bg-indigo-500 text-white ",
  Posted: "bg-green-500 text-white ",
  Rejected: "bg-red-500 text-white ",
  Cancelled: "bg-red-500 text-white ",
  Paid: "bg-green-500 text-white ",
  "Partially Paid": "bg-amber-500 text-white ",
  Unpaid: "bg-red-500 text-white ",
  "Near Expiry": "bg-orange-500 text-white ",
  "On Hold": "bg-amber-500 text-white ",
  Recalled: "bg-red-500 text-white ",
  Expired: "bg-red-600 text-white ",
  Success: "bg-green-500 text-white ",
  "In Progress": "bg-indigo-500 text-white ",
  Completed: "bg-green-500 text-white ",
};

export function StatusBadge({ status }: { status: string }) {
  const cls =
    defaultStatusColors[status] || "bg-gray-500 text-white ";
  return (
    <span
      className={`inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-[11px] font-semibold  ${cls}`}
    >
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
    return data.filter((row: unknown) =>
      String(row[searchKey] || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [data, search, searchKey]);

  const columnHelper = createColumnHelper<any>();

  const tableColumns = React.useMemo(() => {
    const cols = columns.map((col: unknown) =>
      columnHelper.accessor(col.key, {
        id: col.key,
        header: () => (
          <p className="text-[12px] font-bold text-gray-400 ">
            {col.label.toUpperCase()}
          </p>
        ),
        cell: (info: unknown) => (
          <div className="text-[13px] font-bold text-navy-700 ">
            {col.render
              ? col.render(info.row.original)
              : info.getValue() ?? "—"}
          </div>
        ),
      })
    );

    if (onRowClick || onEdit || onDelete) {
      cols.push(
        columnHelper.display({
          id: "actions",
          header: () => (
            <p className="text-right text-[12px] font-bold text-gray-400 ">
              ACTIONS
            </p>
          ),
          cell: (info: unknown) => (
            <div className="flex items-center justify-end gap-2">
              {onRowClick && (
                <button
                  onClick={(e: any) => {
                    e.stopPropagation();
                    onRowClick(info.row.original);
                  }}
                  className="rounded-lg bg-brand-50 px-3 py-1.5 text-[12px] font-bold text-brand-600 transition-colors hover:bg-brand-100"
                >
                  View
                </button>
              )}
              {onEdit && (
                <button
                  onClick={(e: any) => {
                    e.stopPropagation();
                    onEdit(info.row.original);
                  }}
                  className="rounded-lg bg-amber-50 px-3 py-1.5 text-[12px] font-bold text-amber-600 transition-colors hover:bg-amber-100"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e: any) => {
                    e.stopPropagation();
                    onDelete(info.row.original);
                  }}
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-[12px] font-bold text-red-600 transition-colors hover:bg-red-100"
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
    <div className="flex h-full flex-col gap-4 py-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy-700 ">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-400 ">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-[13px] font-medium text-gray-600 transition-all hover:bg-gray-50   ">
            <MdDownload size={16} /> Export
          </button>
          {onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-[13px] font-semibold text-white shadow-sm shadow-brand-200 transition-all hover:bg-brand-600 "
            >
              <MdAdd size={18} /> {addLabel}
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200  ">
        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-2 border-b border-gray-50 bg-white px-4 py-3   sm:flex-row sm:items-center">
          <div className="relative max-w-xs flex-1">
            <MdSearch className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 " />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e: any) => {
                setSearch(e.target.value);
                table.setPageIndex(0);
              }}
              className="w-full rounded-full border border-transparent bg-lightPrimary py-2 pl-9 pr-4 text-sm text-navy-700 transition-all placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500    "
            />
          </div>
          <button className="flex items-center gap-1.5 rounded-full border border-transparent bg-lightPrimary px-4 py-2 text-[13px] font-medium text-navy-700 transition-all hover:bg-gray-100    ">
            <MdFilterList size={16} /> Filters
          </button>
          <p className="ml-auto shrink-0 text-[12px] font-medium text-gray-400 ">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Table */}
        <div className="w-full flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup: unknown) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-gray-200 "
                >
                  {headerGroup.headers.map((header: unknown) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="cursor-pointer px-4 py-4 text-left transition-colors hover:bg-gray-50 "
                    >
                      <div
                        className={`flex items-center gap-2 ${
                          header.id === "actions" ? "justify-end" : ""
                        }`}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <span className="text-gray-400 ">
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
            <tbody className="bg-white ">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-4 py-16 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500  " />
                      <p className="text-sm font-medium text-gray-400 ">
                        Loading data...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-4 py-16 text-center"
                  >
                    <p className="text-sm font-medium text-gray-400 ">
                      No records found.
                    </p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row: unknown) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-50 transition-colors hover:bg-gray-50/50  "
                  >
                    {row.getVisibleCells().map((cell: unknown) => (
                      <td key={cell.id} className="px-4 py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
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
          <div className="flex items-center justify-between border-t border-gray-50 bg-white px-4 py-3  ">
            <p className="text-[12px] text-gray-400 ">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="flex h-8 items-center justify-center rounded-full border border-transparent bg-lightPrimary px-3 text-[12px] font-medium text-navy-700 transition-all hover:bg-gray-100 disabled:opacity-40    "
              >
                Prev
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="flex h-8 items-center justify-center rounded-full border border-transparent bg-lightPrimary px-3 text-[12px] font-medium text-navy-700 transition-all hover:bg-gray-100 disabled:opacity-40    "
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
