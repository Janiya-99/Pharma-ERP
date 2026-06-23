import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Filter } from "lucide-react";
import { inventoryApi } from "../../../api/inventoryApi";
import DataTable from "../../../components/common/DataTable";
import PermissionGuard from "../../../auth/PermissionGuard";
import StockTransferStatusBadge from "../../../components/inventory/StockTransferStatusBadge";
import StockTransferPostedStatusBadge from "../../../components/inventory/StockTransferPostedStatusBadge";
import { formatNumber, formatDate } from "../../../lib/utils";

const StockTransfersPage = () => {
  const [transfers, setTransfers] = useState([]);
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
      const params = {
        page,
        limit,
        search,
      };
      if (statusFilter !== "all") {
        params.approval_status = statusFilter;
      }
      
      const res = await inventoryApi.getStockTransfers(params);
      if (res.success !== false) {
        setTransfers(res.data?.data || res.data || []);
        setTotal(res.data?.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch stock transfers", err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: "Reference No", accessorKey: "reference_no", cell: ({ row }) => (
      <span className="font-medium text-brand-600 dark:text-brand-400">
        {row.original.reference_no || "DRAFT"}
      </span>
    )},
    { header: "Date", accessorKey: "transfer_date", cell: ({ row }) => formatDate(row.original.transfer_date) },
    { header: "Source", accessorKey: "source_warehouse_id", cell: ({ row }) => row.original.source_warehouse?.warehouse_name },
    { header: "Destination", accessorKey: "destination_warehouse_id", cell: ({ row }) => row.original.destination_warehouse?.warehouse_name },
    { header: "Total Qty", accessorKey: "total_quantity", cell: ({ row }) => formatNumber(row.original.total_quantity, 3) },
    { header: "Status", accessorKey: "approval_status", cell: ({ row }) => <StockTransferStatusBadge status={row.original.approval_status} /> },
    { header: "Posted", accessorKey: "posted_status", cell: ({ row }) => <StockTransferPostedStatusBadge status={row.original.posted_status} /> },
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stock Transfers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage warehouse stock transfers and their approval process.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PermissionGuard permission="inventory.stock_transfer.create">
            <Link
              to="/inventory/stock-transfers/create"
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors font-medium shadow-sm shadow-brand-500/20"
            >
              <Plus className="h-5 w-5" />
              New Transfer
            </Link>
          </PermissionGuard>
        </div>
      </div>

      <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-navy-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-navy-800/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-navy-600 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 dark:bg-navy-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 dark:bg-navy-900 dark:text-white outline-none"
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
          onRowClick={(row) => navigate(`/inventory/stock-transfers/${row.id}`)}
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
