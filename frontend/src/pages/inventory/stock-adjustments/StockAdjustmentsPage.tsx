import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Filter } from "lucide-react";
import { toast } from "react-hot-toast";
import { inventoryApi } from "../../../api/inventoryApi";
import { getBranches } from "../../../api/controlApi";
import { useAuth } from "../../../auth/AuthContext";
import DataTable from "../../../components/common/DataTable";
import PermissionGuard from "../../../auth/PermissionGuard";
import { formatDate, formatNumber, formatCurrency } from "../../../lib/utils";
import StockAdjustmentStatusBadge from "../../../components/inventory/StockAdjustmentStatusBadge";
import StockAdjustmentTypeBadge from "../../../components/inventory/StockAdjustmentTypeBadge";
import StockAdjustmentPostedStatusBadge from "../../../components/inventory/StockAdjustmentPostedStatusBadge";
import StockAdjustmentActionButtons from "../../../components/inventory/StockAdjustmentActionButtons";
import SubmitStockAdjustmentModal from "./SubmitStockAdjustmentModal";
import ApproveStockAdjustmentModal from "./ApproveStockAdjustmentModal";
import RejectStockAdjustmentModal from "./RejectStockAdjustmentModal";
import PostStockAdjustmentConfirmModal from "./PostStockAdjustmentConfirmModal";
import { StockAdjustment } from "../../../types/inventory";

const StockAdjustmentsPage = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalRecords, setTotalRecords] = useState(0);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [postedStatusFilter, setPostedStatusFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [branches, setBranches] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  const [selectedAdjustment, setSelectedAdjustment] =
    useState<StockAdjustment | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [branchesRes, warehousesRes] = await Promise.all([
          getBranches({ limit: 100 }),
          inventoryApi.getWarehouses({ limit: 100 }),
        ]);
        if (branchesRes.success !== false) {
          setBranches(branchesRes.data?.data || branchesRes.data || []);
        }
        if (warehousesRes.success !== false) {
          setWarehouses(warehousesRes.data?.data || warehousesRes.data || []);
        }
      } catch (err) {
        console.error("Failed to load filter options", err);
      }
    };
    loadFilters();
  }, []);

  useEffect(() => {
    fetchAdjustments();
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    search,
    typeFilter,
    statusFilter,
    postedStatusFilter,
    branchFilter,
    warehouseFilter,
    startDate,
    endDate,
  ]);

  const fetchAdjustments = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search,
      };

      if (typeFilter) params.adjustment_type = typeFilter;
      if (statusFilter) params.approval_status = statusFilter;
      if (postedStatusFilter) params.posted_status = postedStatusFilter;
      if (branchFilter) params.branch_id = branchFilter;
      if (warehouseFilter) params.warehouse_id = warehouseFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await inventoryApi.getStockAdjustments(params);
      if (res.success !== false) {
        if (res.data && "data" in res.data && Array.isArray(res.data.data)) {
          setAdjustments(res.data.data);
          setTotalRecords(res.data.total || 0);
        } else if (Array.isArray(res.data)) {
          setAdjustments(res.data);
          setTotalRecords(res.data.length);
        } else {
          setAdjustments([]);
          setTotalRecords(0);
        }
      }
    } catch (err) {
      toast.error("Failed to fetch stock adjustments");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adjustment: StockAdjustment) => {
    if (
      window.confirm(
        `Are you sure you want to delete adjustment ${adjustment.adjustment_number}?`
      )
    ) {
      try {
        await inventoryApi.deleteStockAdjustment(adjustment.id);
        toast.success("Adjustment deleted successfully");
        fetchAdjustments();
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to delete adjustment"
        );
      }
    }
  };

  const openSubmitModal = (adjustment: StockAdjustment) => {
    setSelectedAdjustment(adjustment);
    setIsSubmitModalOpen(true);
  };

  const openApproveModal = (adjustment: StockAdjustment) => {
    setSelectedAdjustment(adjustment);
    setIsApproveModalOpen(true);
  };

  const openRejectModal = (adjustment: StockAdjustment) => {
    setSelectedAdjustment(adjustment);
    setIsRejectModalOpen(true);
  };

  const openPostModal = (adjustment: StockAdjustment) => {
    setSelectedAdjustment(adjustment);
    setIsPostModalOpen(true);
  };

  const columns = [
    {
      header: "Adjustment No",
      accessorKey: "adjustment_number",
      cell: ({ row }: { row: { original: StockAdjustment } }) => (
        <Link
          to={`/inventory/stock-adjustments/${row.original.id}`}
          onClick={(e) => e.stopPropagation()}
          className="font-semibold text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
        >
          {row.original.adjustment_number}
        </Link>
      ),
    },
    {
      header: "Date",
      accessorKey: "adjustment_date",
      cell: ({ row }: { row: { original: StockAdjustment } }) =>
        formatDate(row.original.adjustment_date),
    },
    {
      header: "Branch",
      accessorKey: "branch.branch_name",
      cell: ({ row }: { row: { original: StockAdjustment } }) =>
        row.original.branch?.branch_name || "—",
    },
    {
      header: "Warehouse",
      accessorKey: "warehouse.warehouse_name",
      cell: ({ row }: { row: { original: StockAdjustment } }) =>
        row.original.warehouse?.warehouse_name || "—",
    },
    {
      header: "Reference No",
      accessorKey: "reference_number",
      cell: ({ row }: { row: { original: StockAdjustment } }) =>
        row.original.reference_number || row.original.reference_no || "—",
    },
    {
      header: "Type",
      accessorKey: "adjustment_type",
      cell: ({ row }: { row: { original: StockAdjustment } }) => (
        <StockAdjustmentTypeBadge type={row.original.adjustment_type} />
      ),
    },
    {
      header: "Qty In",
      accessorKey: "total_quantity_in",
      cell: ({ row }: { row: { original: StockAdjustment } }) =>
        formatNumber(row.original.total_quantity_in || 0, 3),
    },
    {
      header: "Qty Out",
      accessorKey: "total_quantity_out",
      cell: ({ row }: { row: { original: StockAdjustment } }) =>
        formatNumber(row.original.total_quantity_out || 0, 3),
    },
    {
      header: "Total Value",
      accessorKey: "total_stock_value",
      cell: ({ row }: { row: { original: StockAdjustment } }) =>
        formatCurrency(row.original.total_stock_value || 0),
    },
    {
      header: "Status",
      accessorKey: "approval_status",
      cell: ({ row }: { row: { original: StockAdjustment } }) => (
        <StockAdjustmentStatusBadge status={row.original.approval_status} />
      ),
    },
    {
      header: "Posting",
      accessorKey: "posted_status",
      cell: ({ row }: { row: { original: StockAdjustment } }) => (
        <StockAdjustmentPostedStatusBadge status={row.original.posted_status} />
      ),
    },
    {
      header: "Created By",
      accessorKey: "created_by_user.name",
      cell: ({ row }: { row: { original: StockAdjustment } }) =>
        row.original.created_by_user?.name || "—",
    },
    {
      header: "Created At",
      accessorKey: "created_at",
      cell: ({ row }: { row: { original: StockAdjustment } }) =>
        formatDate(row.original.created_at || ""),
    },
    {
      header: "Actions",
      cell: ({ row }: { row: { original: StockAdjustment } }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <StockAdjustmentActionButtons
            adjustment={row.original}
            onDelete={handleDelete}
            onSubmit={openSubmitModal}
            onApprove={openApproveModal}
            onReject={openRejectModal}
            onPost={openPostModal}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] p-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Stock Adjustments
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage physical counts, damages, expirations, and stock corrections
          </p>
        </div>
        <PermissionGuard permission="inventory.stock_adjustment.create">
          <Link
            to="/inventory/stock-adjustments/create"
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-white shadow-sm shadow-brand-500/20 transition-colors hover:bg-brand-700"
          >
            <Plus className="h-5 w-5" />
            New Adjustment
          </Link>
        </PermissionGuard>
      </div>

      <div className="mb-6 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
        {/* Filters Grid */}
        <div className="grid grid-cols-1 gap-3 border-b border-gray-100 bg-gray-50/50 p-4 dark:border-navy-700 dark:bg-navy-800/50 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
          <div className="relative col-span-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search ref/no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
            />
          </div>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.branch_name}
              </option>
            ))}
          </select>

          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.warehouse_name}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
          >
            <option value="">All Types</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="physical_count">Physical Count</option>
            <option value="damage">Damage</option>
            <option value="expiry">Expiry</option>
            <option value="mixed">Mixed</option>
            <option value="correction">Correction</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
          >
            <option value="">All Approval Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={postedStatusFilter}
            onChange={(e) => setPostedStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
          >
            <option value="">All Posting Statuses</option>
            <option value="unposted">Unposted</option>
            <option value="posted">Posted</option>
          </select>

          <div className="relative">
            <input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
            />
          </div>

          <div className="relative">
            <input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={adjustments}
          loading={loading}
          onRowClick={(row: StockAdjustment) =>
            navigate(`/inventory/stock-adjustments/${row.id}`)
          }
          pagination={pagination}
          onPaginationChange={setPagination}
          pageCount={Math.ceil(totalRecords / pagination.pageSize)}
        />
      </div>

      <SubmitStockAdjustmentModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        adjustment={selectedAdjustment}
        onSuccess={fetchAdjustments}
      />

      <ApproveStockAdjustmentModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        adjustment={selectedAdjustment}
        onSuccess={fetchAdjustments}
      />

      <RejectStockAdjustmentModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        adjustment={selectedAdjustment}
        onSuccess={fetchAdjustments}
      />

      <PostStockAdjustmentConfirmModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        adjustment={selectedAdjustment}
        onSuccess={fetchAdjustments}
      />
    </div>
  );
};

export default StockAdjustmentsPage;
