import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../api/financeApi";
import PageHeader from "../../../components/common/PageHeader";
import { ArrowLeft, Trash2, Edit, CheckCircle, XCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../auth/AuthContext";
import Modal from "../../../components/common/Modal";
import AssetValueCard from "../../../components/finance/AssetValueCard";
import { DisposalTypeBadge, GainLossBadge } from "../../../components/finance/FixedAssetBadges";
import { ActionDisposalModal, PostDisposalConfirmModal } from "../fixed-assets/shared/FixedAssetActionModals";

const FixedAssetDisposalDetailsPage = () => {
  const { id } = useParams();
  const history = useHistory();
  const { hasPermission } = useAuth();

  const [disposal, setDisposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);

  useEffect(() => {
    fetchDisposal();
  }, [id]);

  const fetchDisposal = async () => {
    try {
      setLoading(true);
      const res = await financeApi.getFixedAssetDisposalById(id);
      setDisposal(res.data?.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load disposal details");
      history.push("/admin/finance/fixed-asset-disposals");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setActionLoading(true);
      await financeApi.deleteFixedAssetDisposal(id);
      toast.success("Asset disposal deleted successfully");
      history.push("/admin/finance/fixed-asset-disposals");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete disposal");
      setDeleteModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (actionFn: unknown, modalSetter: unknown, successMsg: unknown, remarks: unknown = "") => {
    try {
      setActionLoading(true);
      const payload = remarks ? { remarks } : {};
      await actionFn(id, payload);
      toast.success(successMsg);
      modalSetter(false);
      fetchDisposal();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${successMsg.split(" ")[0].toLowerCase()} disposal`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!disposal) return null;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-navy-900 overflow-y-auto pb-10">
      <PageHeader
        title="Disposal Details"
        breadcrumb={[
          { label: "Finance" },
          { label: "Asset Disposals", path: "/admin/finance/fixed-asset-disposals" },
          { label: disposal.disposal_number },
        ]}
      />

      <div className="px-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => history.push("/admin/finance/fixed-asset-disposals")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-navy-700 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to List
          </button>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Draft State Actions */}
            {disposal.status === "draft" && (
              <>
                {hasPermission("finance.fixed_asset_disposal.update") && (
                  <button
                    onClick={() => history.push(`/admin/finance/fixed-asset-disposals/${id}/edit`)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 rounded-xl hover:bg-brand-100 dark:bg-navy-800 dark:text-brand-400 dark:hover:bg-navy-700 transition-all"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                )}
                {hasPermission("finance.fixed_asset_disposal.delete") && (
                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 dark:bg-navy-800 dark:text-red-400 dark:hover:bg-navy-700 transition-all"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                )}
                {hasPermission("finance.fixed_asset_disposal.submit") && (
                  <button
                    onClick={() => setSubmitModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white transition-all bg-blue-500 rounded-xl hover:bg-blue-600 shadow-sm"
                  >
                    <Send className="w-4 h-4" /> Submit
                  </button>
                )}
              </>
            )}

            {/* Submitted State Actions */}
            {disposal.status === "submitted" && (
              <>
                {hasPermission("finance.fixed_asset_disposal.approve") && (
                  <button
                    onClick={() => setRejectModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 dark:bg-navy-800 dark:text-red-400 dark:hover:bg-navy-700 transition-all"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                )}
                {hasPermission("finance.fixed_asset_disposal.approve") && (
                  <button
                    onClick={() => setApproveModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white transition-all bg-green-500 rounded-xl hover:bg-green-600 shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                )}
              </>
            )}

            {/* Approved State Actions */}
            {disposal.status === "approved" && (
              <>
                {hasPermission("finance.fixed_asset_disposal.post") && (
                  <button
                    onClick={() => setPostModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white transition-all bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" /> Post Disposal
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Status Alert for Rejection */}
        {disposal.status === "rejected" && disposal.approved_rejected_remarks && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/30">
            <h4 className="text-sm font-bold text-red-800 dark:text-red-400 mb-1">Rejection Reason</h4>
            <p className="text-sm text-red-700 dark:text-red-300">{disposal.approved_rejected_remarks}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-navy-700 dark:text-white">{disposal.disposal_number}</h2>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Disposal Date: {new Date(disposal.disposal_date).toLocaleDateString()}</p>
                </div>
                {/* Custom Status Badge */}
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border capitalize
                  ${disposal.status === "draft" ? "bg-gray-100 text-gray-700 border-gray-200" :
                    disposal.status === "submitted" ? "bg-blue-100 text-blue-700 border-blue-200" :
                    disposal.status === "approved" ? "bg-green-100 text-green-700 border-green-200" :
                    disposal.status === "rejected" ? "bg-red-100 text-red-700 border-red-200" :
                    "bg-emerald-100 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {disposal.status}
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-navy-900/50 rounded-xl p-4 mb-6 border border-gray-100 dark:border-navy-700">
                <h3 className="text-sm font-bold text-navy-700 dark:text-white mb-3">Asset Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 block">Asset Code</span>
                    <span className="text-sm font-medium text-navy-700 dark:text-white">{disposal.fixed_asset?.asset_code}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Asset Name</span>
                    <span className="text-sm font-medium text-navy-700 dark:text-white">{disposal.fixed_asset?.asset_name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Category</span>
                    <span className="text-sm font-medium text-navy-700 dark:text-white">{disposal.fixed_asset?.category?.category_name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Branch</span>
                    <span className="text-sm font-medium text-navy-700 dark:text-white">{disposal.fixed_asset?.branch?.branch_name}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Disposal Type</span>
                  <div><DisposalTypeBadge type={disposal.disposal_type} /></div>
                </div>
              </div>

              {disposal.remarks && (
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-navy-700">
                  <span className="text-xs text-gray-500 mb-1 block">Remarks</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{disposal.remarks}</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-brand-50 to-white dark:from-navy-800 dark:to-navy-900 rounded-2xl shadow-sm border border-brand-100 dark:border-brand-900/30 p-6">
              <h3 className="text-lg font-bold text-brand-700 dark:text-brand-400 mb-6">
                Financial Impact
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-brand-100 dark:border-brand-900/30 pb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Net Book Value</span>
                  <span className="font-bold text-navy-700 dark:text-white">
                    LKR {Number(disposal.net_book_value_at_disposal || 0).toLocaleString()}
                  </span>
                </div>
                
                {disposal.disposal_type === "sale" && (
                  <div className="flex justify-between items-center border-b border-brand-100 dark:border-brand-900/30 pb-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sale Value</span>
                    <span className="font-medium text-green-600 dark:text-green-500">
                      LKR {Number(disposal.sale_value || 0).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-semibold text-brand-700 dark:text-brand-400">Gain / Loss Amount</span>
                  <div className="flex flex-col items-end">
                    <span className={`text-xl font-bold ${disposal.gain_loss_amount > 0 ? "text-green-600 dark:text-green-400" : disposal.gain_loss_amount < 0 ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}>
                      LKR {Math.abs(Number(disposal.gain_loss_amount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <div className="mt-1">
                      <GainLossBadge amount={disposal.gain_loss_amount} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
              <h3 className="text-sm font-bold text-navy-700 dark:text-white mb-4 border-b border-gray-100 dark:border-navy-700 pb-2">
                Approval Workflow
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Created By</span>
                  <span className="text-xs font-medium text-navy-700 dark:text-white">{disposal.created_by_user?.name || "-"}</span>
                </div>
                {(disposal.status === "approved" || disposal.status === "rejected" || disposal.status === "posted") && (
                  <div className="flex justify-between pt-2 border-t border-gray-50 dark:border-navy-700/50">
                    <span className="text-xs text-gray-500">{disposal.status === "rejected" ? "Rejected By" : "Approved By"}</span>
                    <span className="text-xs font-medium text-navy-700 dark:text-white">{disposal.approved_rejected_by_user?.name || "-"}</span>
                  </div>
                )}
                {disposal.status === "posted" && (
                  <div className="flex justify-between pt-2 border-t border-gray-50 dark:border-navy-700/50">
                    <span className="text-xs text-gray-500">Posted By</span>
                    <span className="text-xs font-medium text-navy-700 dark:text-white">{disposal.posted_by_user?.name || "-"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Asset Disposal">
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Are you sure you want to delete disposal <span className="font-bold text-navy-700 dark:text-white">{disposal.disposal_number}</span>?
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50" disabled={actionLoading}>Cancel</button>
          <button onClick={confirmDelete} className="px-4 py-2 text-sm font-bold text-white transition-all bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50" disabled={actionLoading}>
            {actionLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>

      <ActionDisposalModal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onConfirm={(remarks: unknown) => handleAction(financeApi.submitFixedAssetDisposal, setSubmitModalOpen, "Disposal submitted for approval", remarks)}
        loading={actionLoading}
        title="Submit Disposal for Approval"
        actionLabel="Submit"
        colorClass="bg-blue-500 hover:bg-blue-600"
        requireRemarks={false}
      />

      <ActionDisposalModal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        onConfirm={(remarks: unknown) => handleAction(financeApi.approveFixedAssetDisposal, setApproveModalOpen, "Disposal approved", remarks)}
        loading={actionLoading}
        title="Approve Disposal"
        actionLabel="Approve"
        colorClass="bg-green-500 hover:bg-green-600"
        requireRemarks={false}
      />

      <ActionDisposalModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={(remarks: unknown) => handleAction(financeApi.rejectFixedAssetDisposal, setRejectModalOpen, "Disposal rejected", remarks)}
        loading={actionLoading}
        title="Reject Disposal"
        actionLabel="Reject"
        colorClass="bg-red-500 hover:bg-red-600"
        requireRemarks={true}
      />

      <PostDisposalConfirmModal
        isOpen={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        onConfirm={() => handleAction(financeApi.postFixedAssetDisposal, setPostModalOpen, "Disposal posted successfully", "")}
        loading={actionLoading}
      />
    </div>
  );
};

export default FixedAssetDisposalDetailsPage;
