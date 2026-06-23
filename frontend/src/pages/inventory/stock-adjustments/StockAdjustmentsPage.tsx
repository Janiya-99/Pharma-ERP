import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Filter } from "lucide-react";
import { toast } from "react-hot-toast";
import { inventoryApi } from "../../../api/inventoryApi";
import { useAuth } from "../../../auth/AuthContext";
import DataTable from "../../../components/common/DataTable";
import { formatDate } from "../../../lib/utils";
import StockAdjustmentStatusBadge from "../../../components/inventory/StockAdjustmentStatusBadge";
import StockAdjustmentTypeBadge from "../../../components/inventory/StockAdjustmentTypeBadge";
import StockAdjustmentPostedStatusBadge from "../../../components/inventory/StockAdjustmentPostedStatusBadge";
import StockAdjustmentActionButtons from "../../../components/inventory/StockAdjustmentActionButtons";
import SubmitStockAdjustmentModal from "./SubmitStockAdjustmentModal";
import ApproveStockAdjustmentModal from "./ApproveStockAdjustmentModal";
import RejectStockAdjustmentModal from "./RejectStockAdjustmentModal";
import PostStockAdjustmentConfirmModal from "./PostStockAdjustmentConfirmModal";

const StockAdjustmentsPage = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    fetchAdjustments();
  }, [page, limit, search, typeFilter, statusFilter]);

  const fetchAdjustments = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search,
        adjustment_type: typeFilter,
        approval_status: statusFilter,
      };
      const res = await inventoryApi.getStockAdjustments(params);
      if (res.success !== false) {
        setAdjustments(res.data?.data || res.data || []);
        setTotalRows(res.data?.meta?.total || res.meta?.total || 0);
      }
    } catch (err) {
      toast.error("Failed to fetch stock adjustments");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adjustment: unknown) => {
    if (window.confirm(`Are you sure you want to delete adjustment ${adjustment.adjustment_number}?`)) {
      try {
        await inventoryApi.deleteStockAdjustment(adjustment.id);
        toast.success("Adjustment deleted successfully");
        fetchAdjustments();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete adjustment");
      }
    }
  };

  const openSubmitModal = (adjustment: unknown) => {
    setSelectedAdjustment(adjustment);
    setIsSubmitModalOpen(true);
  };

  const openApproveModal = (adjustment: unknown) => {
    setSelectedAdjustment(adjustment);
    setIsApproveModalOpen(true);
  };

  const openRejectModal = (adjustment: unknown) => {
    setSelectedAdjustment(adjustment);
    setIsRejectModalOpen(true);
  };

  const openPostModal = (adjustment: unknown) => {
    setSelectedAdjustment(adjustment);
    setIsPostModalOpen(true);
  };

  const columns = [
    {
      name: "Date",
      selector: (row: unknown) => formatDate(row.adjustment_date),
      sortable: true,
      width: "120px",
    },
    {
      name: "Adjustment No",
      selector: (row: unknown) => row.adjustment_number,
      sortable: true,
      cell: (row: unknown) => (
        <Link
          to={`/inventory/stock-adjustments/${row.id}`}
          className="text-brand-600 hover:text-brand-800 font-medium dark:text-brand-400 dark:hover:text-brand-300"
        >
          {row.adjustment_number}
        </Link>
      ),
      width: "150px",
    },
    {
      name: "Warehouse",
      selector: (row: unknown) => row.warehouse?.warehouse_name || "N/A",
      sortable: true,
    },
    {
      name: "Type",
      selector: (row: unknown) => row.adjustment_type,
      cell: (row: unknown) => <StockAdjustmentTypeBadge type={row.adjustment_type} />,
      width: "140px",
    },
    {
      name: "Status",
      selector: (row: unknown) => row.approval_status,
      cell: (row: unknown) => <StockAdjustmentStatusBadge status={row.approval_status} />,
      width: "130px",
    },
    {
      name: "Posting",
      selector: (row: unknown) => row.posted_status,
      cell: (row: unknown) => <StockAdjustmentPostedStatusBadge status={row.posted_status} />,
      width: "130px",
    },
    {
      name: "Actions",
      cell: (row: unknown) => (
        <StockAdjustmentActionButtons
          adjustment={row}
          onDelete={handleDelete}
          onSubmit={openSubmitModal}
          onApprove={openApproveModal}
          onReject={openRejectModal}
          onPost={openPostModal}
        />
      ),
      width: "220px",
      right: true,
    },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stock Adjustments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage physical counts, damages, expirations, and stock corrections
          </p>
        </div>
        {hasPermission("inventory.stock_adjustment.create") && (
          <Link
            to="/inventory/stock-adjustments/create"
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/20"
          >
            <Plus className="w-5 h-5" />
            New Adjustment
          </Link>
        )}
      </div>

      <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 dark:border-navy-700 bg-gray-50/50 dark:bg-navy-800/50 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search adjustments..."
                value={search}
                onChange={(e: any) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e: any) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 text-gray-900 dark:text-white"
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
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 text-gray-900 dark:text-white"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={adjustments}
          loading={loading}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          onChangePage={(p: unknown) => setPage(p)}
          onChangeRowsPerPage={(newLimit: unknown, p: unknown) => {
            setLimit(newLimit);
            setPage(1);
          }}
          paginationPerPage={limit}
          onRowClicked={(row: unknown) => navigate(`/inventory/stock-adjustments/${row.id}`)}
          pointerOnHover
          highlightOnHover
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
