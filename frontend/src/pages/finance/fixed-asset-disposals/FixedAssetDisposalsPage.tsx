import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { financeApi } from "../../../api/financeApi";
import { useAuth } from "../../../auth/AuthContext";
import DataTable from "../../../components/common/DataTable";
import PageHeader from "../../../components/common/PageHeader";
import { Plus, Search, Filter, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { DisposalTypeBadge, GainLossBadge } from "../../../components/finance/FixedAssetBadges";
import Modal from "../../../components/common/Modal";

const FixedAssetDisposalsPage = () => {
  const [disposals, setDisposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [disposalToDelete, setDisposalToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const history = useHistory();
  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchDisposals();
  }, [page, limit, search, statusFilter]);

  const fetchDisposals = async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await financeApi.getFixedAssetDisposals(params);
      setDisposals((Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []));
      setTotalCount(res.data?.meta?.total || 0);
    } catch (err) {
      console.error("Failed to fetch disposals:", err);
      toast.error(err.response?.data?.message || "Failed to load asset disposals");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (disposal: unknown) => {
    setDisposalToDelete(disposal);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!disposalToDelete) return;
    try {
      setDeleting(true);
      await financeApi.deleteFixedAssetDisposal(disposalToDelete.id);
      toast.success("Asset disposal deleted successfully");
      setDeleteModalOpen(false);
      fetchDisposals();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete disposal");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "disposal_number",
      label: "Disposal No.",
      render: (val: unknown) => <span className="font-bold text-navy-700 ">{val}</span>,
    },
    {
      key: "disposal_date",
      label: "Disposal Date",
      render: (val: unknown) => <span>{new Date(val).toLocaleDateString()}</span>,
    },
    {
      key: "fixed_asset",
      label: "Asset",
      render: (_: unknown, row: unknown) => (
        <div>
          <span className="font-medium text-navy-700  block">{row.fixed_asset?.asset_code}</span>
          <span className="text-xs text-gray-500">{row.fixed_asset?.asset_name}</span>
        </div>
      ),
    },
    {
      key: "disposal_type",
      label: "Type",
      render: (val: unknown) => <DisposalTypeBadge type={val} />,
    },
    {
      key: "sale_value",
      label: "Sale Value",
      align: "right",
      render: (val: unknown) => <span>LKR {Number(val || 0).toLocaleString()}</span>,
    },
    {
      key: "net_book_value_at_disposal",
      label: "NBV at Disposal",
      align: "right",
      render: (val: unknown) => <span>LKR {Number(val || 0).toLocaleString()}</span>,
    },
    {
      key: "gain_loss_amount",
      label: "Gain/Loss",
      align: "right",
      render: (val: unknown) => (
        <div className="flex flex-col items-end">
          <span className={`font-medium ${val > 0 ? "text-green-600 " : val < 0 ? "text-red-600 " : ""}`}>
            LKR {Math.abs(Number(val || 0)).toLocaleString()}
          </span>
          <GainLossBadge amount={val} />
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (val: unknown) => {
        const colors = {
          draft: "bg-gray-100 text-gray-700 border-gray-200",
          submitted: "bg-indigo-100 text-indigo-700 border-indigo-200",
          approved: "bg-green-100 text-green-700 border-green-200",
          rejected: "bg-red-100 text-red-700 border-red-200",
          posted: "bg-emerald-100 text-emerald-700 border-emerald-200",
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${colors[val] || colors.draft}`}>
            {val}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_: unknown, row: unknown) => (
        <div className="flex items-center justify-end gap-2">
          {hasPermission("finance.fixed_asset_disposal.view") && (
            <button
              onClick={() => history.push(`/admin/finance/fixed-asset-disposals/${row.id}`)}
              className="p-1.5 text-gray-500 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 hover:text-navy-700   "
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          {hasPermission("finance.fixed_asset_disposal.delete") && row.status === "draft" && (
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
        title="Asset Disposals"
        breadcrumb={[{ label: "Finance" }, { label: "Asset Disposals" }]}
        action={
          hasPermission("finance.fixed_asset_disposal.create") && (
            <button
              onClick={() => history.push("/admin/finance/fixed-asset-disposals/create")}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all bg-brand-500 rounded-xl hover:bg-brand-600 shadow-sm shadow-brand-500/20"
            >
              <Plus className="w-4 h-4" /> Record Disposal
            </button>
          )
        }
      />

      <div className="flex-1 p-6 overflow-hidden">
        <div className="flex flex-col h-full bg-white border border-gray-100 shadow-sm   rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-gray-100 ">
            <div className="relative flex-1 min-w-[250px] max-w-md">
              <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search by disposal number or asset code..."
                className="w-full py-2 pl-9 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-500    transition-all"
                value={search}
                onChange={(e: any) => setSearch(e.target.value)}
              />
            </div>
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
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="posted">Posted</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <DataTable
              columns={columns}
              data={disposals}
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
        title="Delete Asset Disposal"
      >
        <p className="text-gray-700  mb-6">
          Are you sure you want to delete asset disposal{" "}
          <span className="font-bold text-navy-700 ">
            {disposalToDelete?.disposal_number}
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

export default FixedAssetDisposalsPage;
