import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { financeApi } from "../../../api/financeApi";
import { useAuth } from "../../../auth/AuthContext";
import DataTable from "../../../components/common/DataTable";
import PageHeader from "../../../components/common/PageHeader";
import { Plus, Search, Filter, Trash2, Edit, Eye } from "lucide-react";
import { toast } from "sonner";
import { FixedAssetStatusBadge } from "../../../components/finance/FixedAssetBadges";
import Modal from "../../../components/common/Modal";

const FixedAssetsPage = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const history = useHistory();
  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchAssets();
  }, [page, limit, search, statusFilter]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (search) params.search = search;
      if (statusFilter) params.asset_status = statusFilter;

      const res = await financeApi.getFixedAssets(params);
      setAssets(res.data?.data || []);
      setTotalCount(res.data?.meta?.total || 0);
    } catch (err) {
      console.error("Failed to fetch assets:", err);
      toast.error(err.response?.data?.message || "Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (asset: unknown) => {
    setAssetToDelete(asset);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!assetToDelete) return;
    try {
      setDeleting(true);
      await financeApi.deleteFixedAsset(assetToDelete.id);
      toast.success("Fixed asset deleted successfully");
      setDeleteModalOpen(false);
      fetchAssets();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete fixed asset"
      );
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "asset_code",
      label: "Code",
      render: (val: unknown) => (
        <span className="font-bold text-navy-700 dark:text-white">{val}</span>
      ),
    },
    {
      key: "asset_name",
      label: "Asset Name",
      render: (val: unknown) => (
        <span className="font-medium text-gray-800 dark:text-gray-200">
          {val}
        </span>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (_: unknown, row: unknown) => (
        <span>{row.category?.category_name}</span>
      ),
    },
    {
      key: "branch",
      label: "Branch",
      render: (_: unknown, row: unknown) => (
        <span>{row.branch?.branch_name}</span>
      ),
    },
    {
      key: "purchase_date",
      label: "Purchase Date",
      render: (val: unknown) => (
        <span>{new Date(val).toLocaleDateString()}</span>
      ),
    },
    {
      key: "acquisition_cost",
      label: "Acquisition Cost",
      align: "right",
      render: (val: unknown) => (
        <span>LKR {Number(val || 0).toLocaleString()}</span>
      ),
    },
    {
      key: "accumulated_depreciation",
      label: "Acc. Depreciation",
      align: "right",
      render: (val: unknown) => (
        <span>LKR {Number(val || 0).toLocaleString()}</span>
      ),
    },
    {
      key: "net_book_value",
      label: "Net Book Value",
      align: "right",
      render: (val: unknown) => (
        <span className="font-medium text-brand-600 dark:text-brand-400">
          LKR {Number(val || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "asset_status",
      label: "Asset Status",
      align: "center",
      render: (val: unknown) => <FixedAssetStatusBadge status={val} />,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_: unknown, row: unknown) => (
        <div className="flex items-center justify-end gap-2">
          {hasPermission("finance.fixed_asset.view") && (
            <button
              onClick={() =>
                history.push(`/admin/finance/fixed-assets/${row.id}`)
              }
              className="rounded-lg bg-gray-100 p-1.5 text-gray-500 transition-colors hover:bg-gray-200 hover:text-navy-700 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          {hasPermission("finance.fixed_asset.update") &&
            row.asset_status === "active" && (
              <button
                onClick={() =>
                  history.push(`/admin/finance/fixed-assets/${row.id}/edit`)
                }
                className="rounded-lg bg-brand-50 p-1.5 text-brand-600 transition-colors hover:bg-brand-100 dark:bg-navy-700 dark:text-brand-400 dark:hover:bg-navy-600"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
          {hasPermission("finance.fixed_asset.delete") &&
            row.asset_status === "active" &&
            row.accumulated_depreciation === 0 && (
              <button
                onClick={() => handleDeleteClick(row)}
                className="rounded-lg bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-100 dark:bg-navy-700 dark:text-red-400 dark:hover:bg-navy-600"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col bg-gray-50 dark:bg-navy-900">
      <PageHeader
        title="Fixed Assets"
        breadcrumb={[{ label: "Finance" }, { label: "Fixed Assets" }]}
        action={
          hasPermission("finance.fixed_asset.create") && (
            <button
              onClick={() => history.push("/admin/finance/fixed-assets/create")}
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand-500/20 transition-all hover:bg-brand-600"
            >
              <Plus className="h-4 w-4" /> Create Fixed Asset
            </button>
          )
        }
      />

      <div className="flex-1 overflow-hidden p-6">
        <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 p-5 dark:border-navy-700">
            <div className="relative min-w-[250px] max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by code, name or serial..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none transition-all focus:border-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                value={search}
                onChange={(e: any) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-navy-600 dark:bg-navy-900">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  className="bg-transparent text-sm text-gray-700 outline-none dark:text-gray-300"
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="fully_depreciated">Fully Depreciated</option>
                  <option value="disposed">Disposed</option>
                  <option value="written_off">Written Off</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <DataTable
              columns={columns}
              data={assets}
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
        title="Delete Fixed Asset"
      >
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          Are you sure you want to delete fixed asset{" "}
          <span className="font-bold text-navy-700 dark:text-white">
            {assetToDelete?.asset_code}
          </span>
          ?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteModalOpen(false)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700"
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-red-600 disabled:opacity-50"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default FixedAssetsPage;
