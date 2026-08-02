import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { financeApi } from "../../../api/financeApi";
import { useAuth } from "../../../auth/AuthContext";
import DataTable from "../../../components/common/DataTable";
import PageHeader from "../../../components/common/PageHeader";
import { Plus, Filter, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { DepreciationPostedStatusBadge } from "../../../components/finance/FixedAssetBadges";
import Modal from "../../../components/common/Modal";

const FixedAssetDepreciationRunsPage = () => {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [runToDelete, setRunToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const history = useHistory();
  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchRuns();
  }, [page, limit, statusFilter]);

  const fetchRuns = async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (statusFilter) params.posted_status = statusFilter;

      const res = await financeApi.getFixedAssetDepreciationRuns(params);
      setRuns((Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []));
      setTotalCount(res.data?.meta?.total || 0);
    } catch (err) {
      console.error("Failed to fetch depreciation runs:", err);
      toast.error(err.response?.data?.message || "Failed to load depreciation runs");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (run: unknown) => {
    setRunToDelete(run);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!runToDelete) return;
    try {
      setDeleting(true);
      await financeApi.deleteFixedAssetDepreciationRun(runToDelete.id);
      toast.success("Depreciation run deleted successfully");
      setDeleteModalOpen(false);
      fetchRuns();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete depreciation run");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "run_number",
      label: "Run Number",
      render: (val: unknown) => <span className="font-bold text-navy-700 ">{val}</span>,
    },
    {
      key: "run_date",
      label: "Run Date",
      render: (val: unknown) => <span>{new Date(val).toLocaleDateString()}</span>,
    },
    {
      key: "branch",
      label: "Branch",
      render: (_: unknown, row: unknown) => <span>{row.branch?.branch_name}</span>,
    },
    {
      key: "financial_year",
      label: "Financial Year",
      render: (_: unknown, row: unknown) => <span>{row.financial_year?.year_name}</span>,
    },
    {
      key: "accounting_period",
      label: "Accounting Period",
      render: (_: unknown, row: unknown) => <span>{row.accounting_period?.period_name}</span>,
    },
    {
      key: "depreciation_from_date",
      label: "From",
      render: (val: unknown) => <span>{new Date(val).toLocaleDateString()}</span>,
    },
    {
      key: "depreciation_to_date",
      label: "To",
      render: (val: unknown) => <span>{new Date(val).toLocaleDateString()}</span>,
    },
    {
      key: "total_depreciation_amount",
      label: "Total Depreciation",
      align: "right",
      render: (val: unknown) => <span className="font-bold text-red-600 ">LKR {Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>,
    },
    {
      key: "posted_status",
      label: "Status",
      align: "center",
      render: (val: unknown) => <DepreciationPostedStatusBadge status={val} />,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_: unknown, row: unknown) => (
        <div className="flex items-center justify-end gap-2">
          {hasPermission("finance.fixed_asset_depreciation.view") && (
            <button
              onClick={() => history.push(`/admin/finance/fixed-asset-depreciation-runs/${row.id}`)}
              className="p-1.5 text-gray-500 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 hover:text-navy-700   "
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          {hasPermission("finance.fixed_asset_depreciation.delete") && row.posted_status === "draft" && (
            <button
              onClick={() => handleDeleteClick(row)}
              className="p-1.5 text-red-600 transition-colors bg-red-50 rounded-lg hover:bg-red-100   "
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 ">
      <PageHeader
        title="Depreciation Runs"
        breadcrumb={[{ label: "Finance" }, { label: "Depreciation Runs" }]}
        action={
          hasPermission("finance.fixed_asset_depreciation.create") && (
            <button
              onClick={() => history.push("/admin/finance/fixed-asset-depreciation-runs/create")}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all bg-brand-500 rounded-xl hover:bg-brand-600 shadow-sm shadow-brand-500/20"
            >
              <Plus className="w-4 h-4" /> Create Run
            </button>
          )
        }
      />

      <div className="flex-1 p-6 overflow-hidden">
        <div className="flex flex-col h-full bg-white border border-gray-100 shadow-sm   rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-gray-100 ">
            <div className="relative flex-1 min-w-[250px] max-w-md"></div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl  ">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  className="text-sm bg-transparent outline-none text-gray-700 "
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="posted">Posted</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <DataTable
              columns={columns}
              data={runs}
              loading={loading}
              totalCount={totalCount}
              page={page}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          </div>
        </div>
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Depreciation Run"
      >
        <p className="text-gray-700  mb-6">
          Are you sure you want to delete depreciation run{" "}
          <span className="font-bold text-navy-700 ">
            {runToDelete?.run_number}
          </span>
          ?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50    "
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 text-sm font-bold text-white transition-all bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default FixedAssetDepreciationRunsPage;
