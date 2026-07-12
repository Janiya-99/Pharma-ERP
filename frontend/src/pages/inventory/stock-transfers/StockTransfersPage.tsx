import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Filter } from "lucide-react";
import { inventoryApi } from "../../../api/inventoryApi";
import DataTable from "../../../components/common/DataTable";
import PermissionGuard from "../../../auth/PermissionGuard";
import StockTransferStatusBadge from "../../../components/inventory/StockTransferStatusBadge";
import StockTransferPostedStatusBadge from "../../../components/inventory/StockTransferPostedStatusBadge";
import { formatNumber, formatDate } from "../../../lib/utils";
import {
  StockTransfer,
  PaginatedData,
  ApiResponse,
} from "../../../types/inventory";

const StockTransfersPage = () => {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const limit = 10;

  useEffect(() => {
    fetchTransfers();
  }, [page, search, statusFilter]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page,
        limit,
        search,
      };
      if (statusFilter !== "all") {
        params.approval_status = statusFilter;
      }

      const res = (await inventoryApi.getStockTransfers(
        params
      )) as unknown as ApiResponse<
        PaginatedData<StockTransfer> | StockTransfer[]
      >;
      if (res.success !== false) {
        // Handle both paginated and unpaginated responses
        if (res.data && "data" in res.data && Array.isArray(res.data.data)) {
          setTransfers(res.data.data);
          setTotal(res.data.total || 0);
        } else if (Array.isArray(res.data)) {
          setTransfers(res.data);
          setTotal(res.data.length);
        } else {
          setTransfers([]);
          setTotal(0);
        }
      }
    } catch (err) {
      console.error("Failed to fetch stock transfers", err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: "Reference No",
      accessorKey: "reference_no",
      cell: ({ row }: { row: { original: StockTransfer } }) => (
        <span className="font-medium text-brand-600 ">
          {row.original.reference_no || "DRAFT"}
        </span>
      ),
    },
    {
      header: "Date",
      accessorKey: "transfer_date",
      cell: ({ row }: { row: { original: StockTransfer } }) =>
        formatDate(row.original.transfer_date),
    },
    {
      header: "Source",
      accessorKey: "source_warehouse_id",
      cell: ({ row }: { row: { original: StockTransfer } }) =>
        row.original.source_warehouse?.warehouse_name,
    },
    {
      header: "Destination",
      accessorKey: "destination_warehouse_id",
      cell: ({ row }: { row: { original: StockTransfer } }) =>
        row.original.destination_warehouse?.warehouse_name,
    },
    {
      header: "Total Qty",
      accessorKey: "total_quantity",
      cell: ({ row }: { row: { original: StockTransfer } }) =>
        formatNumber(row.original.total_quantity, 3),
    },
    {
      header: "Status",
      accessorKey: "approval_status",
      cell: ({ row }: { row: { original: StockTransfer } }) => (
        <StockTransferStatusBadge status={row.original.approval_status} />
      ),
    },
    {
      header: "Posted",
      accessorKey: "posted_status",
      cell: ({ row }: { row: { original: StockTransfer } }) => (
        <StockTransferPostedStatusBadge status={row.original.posted_status} />
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 ">
            Stock Transfers
          </h1>
          <p className="mt-1 text-sm text-gray-500 ">
            Manage warehouse stock transfers and their approval process.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PermissionGuard permission="inventory.stock_transfer.create">
            <Link
              to="/inventory/stock-transfers/create"
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 font-medium text-white shadow-sm shadow-brand-500/20 transition-colors hover:bg-brand-700"
            >
              <Plus className="h-5 w-5" />
              New Transfer
            </Link>
          </PermissionGuard>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm  ">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/50 p-4   sm:flex-row">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reference..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-brand-500   "
            />
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setStatusFilter(e.target.value)
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500   "
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={transfers}
          loading={loading}
          onRowClick={(row: StockTransfer) =>
            navigate(`/inventory/stock-transfers/${row.id}`)
          }
          pagination={{
            page,
            limit,
            total,
            onPageChange: setPage,
          }}
        />
      </div>
    </div>
  );
};

export default StockTransfersPage;
