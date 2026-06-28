import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../api/financeApi";
import PageHeader from "../../../components/common/PageHeader";
import { ArrowLeft, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../auth/AuthContext";
import Modal from "../../../components/common/Modal";
import { DepreciationPostedStatusBadge } from "../../../components/finance/FixedAssetBadges";
import DepreciationLinesTable from "../../../components/finance/DepreciationLinesTable";
import { PostDepreciationConfirmModal } from "../fixed-assets/shared/FixedAssetActionModals";

const FixedAssetDepreciationRunDetailsPage = () => {
  const { id } = useParams();
  const history = useHistory();
  const { hasPermission } = useAuth();

  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRun();
  }, [id]);

  const fetchRun = async () => {
    try {
      setLoading(true);
      const res = await financeApi.getFixedAssetDepreciationRunById(id);
      setRun(res.data?.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to load depreciation run details"
      );
      history.push("/admin/finance/fixed-asset-depreciation-runs");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setActionLoading(true);
      await financeApi.deleteFixedAssetDepreciationRun(id);
      toast.success("Depreciation run deleted successfully");
      history.push("/admin/finance/fixed-asset-depreciation-runs");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete depreciation run"
      );
      setDeleteModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmPost = async () => {
    try {
      setActionLoading(true);
      await financeApi.postFixedAssetDepreciationRun(id);
      toast.success("Depreciation run posted successfully");
      setPostModalOpen(false);
      fetchRun();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to post depreciation run"
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!run) return null;

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-gray-50 pb-10 dark:bg-navy-900">
      <PageHeader
        title="Depreciation Run Details"
        breadcrumb={[
          { label: "Finance" },
          {
            label: "Depreciation Runs",
            path: "/admin/finance/fixed-asset-depreciation-runs",
          },
          { label: run.run_number },
        ]}
      />

      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() =>
              history.push("/admin/finance/fixed-asset-depreciation-runs")
            }
            className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-navy-700 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to List
          </button>

          <div className="flex items-center gap-3">
            {hasPermission("finance.fixed_asset_depreciation.delete") &&
              run.posted_status === "draft" && (
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-100 dark:bg-navy-800 dark:text-red-400 dark:hover:bg-navy-700"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              )}
            {hasPermission("finance.fixed_asset_depreciation.post") &&
              run.posted_status === "draft" && (
                <button
                  onClick={() => setPostModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-600"
                >
                  <CheckCircle className="h-4 w-4" /> Post Depreciation
                </button>
              )}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
                    {run.run_number}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Run Date: {new Date(run.run_date).toLocaleDateString()}
                  </p>
                </div>
                <DepreciationPostedStatusBadge status={run.posted_status} />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-gray-100 pt-6 dark:border-navy-700 md:grid-cols-3">
                <div className="flex flex-col">
                  <span className="mb-1 text-xs text-gray-500">
                    Financial Year
                  </span>
                  <span className="text-sm font-medium text-navy-700 dark:text-white">
                    {run.financial_year?.year_name}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="mb-1 text-xs text-gray-500">
                    Accounting Period
                  </span>
                  <span className="text-sm font-medium text-navy-700 dark:text-white">
                    {run.accounting_period?.period_name}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="mb-1 text-xs text-gray-500">
                    Branch Scope
                  </span>
                  <span className="text-sm font-medium text-navy-700 dark:text-white">
                    {run.branch?.branch_name || "All Branches"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="mb-1 text-xs text-gray-500">From Date</span>
                  <span className="text-sm font-medium text-navy-700 dark:text-white">
                    {new Date(run.depreciation_from_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="mb-1 text-xs text-gray-500">To Date</span>
                  <span className="text-sm font-medium text-navy-700 dark:text-white">
                    {new Date(run.depreciation_to_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {run.remarks && (
                <div className="mt-6 border-t border-gray-100 pt-4 dark:border-navy-700">
                  <span className="mb-1 block text-xs text-gray-500">
                    Remarks
                  </span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {run.remarks}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-6 shadow-sm dark:border-brand-900/30 dark:from-navy-800 dark:to-navy-900">
              <h3 className="mb-6 text-lg font-bold text-brand-700 dark:text-brand-400">
                Run Summary
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-brand-100 pb-3 dark:border-brand-900/30">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Assets Depreciated
                  </span>
                  <span className="font-bold text-navy-700 dark:text-white">
                    {run.lines?.length || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-brand-700 dark:text-brand-400">
                    Total Depreciation
                  </span>
                  <span className="text-xl font-bold text-red-600 dark:text-red-400">
                    LKR{" "}
                    {Number(run.total_depreciation_amount || 0).toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
              <h3 className="mb-4 border-b border-gray-100 pb-2 text-sm font-bold text-navy-700 dark:border-navy-700 dark:text-white">
                System Info
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Created By</span>
                  <span className="text-xs font-medium text-navy-700 dark:text-white">
                    {run.created_by_user?.name || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Created At</span>
                  <span className="text-xs font-medium text-navy-700 dark:text-white">
                    {new Date(run.created_at).toLocaleString()}
                  </span>
                </div>
                {run.posted_status === "posted" && (
                  <>
                    <div className="mt-2 flex justify-between border-t border-gray-100 pt-2 dark:border-navy-700">
                      <span className="text-xs text-gray-500">Posted By</span>
                      <span className="text-xs font-medium text-navy-700 dark:text-white">
                        {run.posted_by_user?.name || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Posted At</span>
                      <span className="text-xs font-medium text-navy-700 dark:text-white">
                        {new Date(run.posted_at).toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
            Depreciation Lines
          </h3>
          <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-navy-700">
            <DepreciationLinesTable lines={run.lines} />
          </div>
        </div>
      </div>

      <PostDepreciationConfirmModal
        isOpen={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        onConfirm={confirmPost}
        loading={actionLoading}
      />

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Depreciation Run"
      >
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          Are you sure you want to delete depreciation run{" "}
          <span className="font-bold text-navy-700 dark:text-white">
            {run.run_number}
          </span>
          ?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteModalOpen(false)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700"
            disabled={actionLoading}
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-red-600 disabled:opacity-50"
            disabled={actionLoading}
          >
            {actionLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default FixedAssetDepreciationRunDetailsPage;
