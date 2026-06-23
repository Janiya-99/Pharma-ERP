import React from "react";
import { Edit2, Trash2, Send, CheckCircle, XCircle, FileCheck } from "lucide-react";
import PermissionGuard from "../../auth/PermissionGuard";

const StockTransferActionButtons = ({
  approvalStatus,
  postedStatus,
  onEdit,
  onDelete,
  onSubmit,
  onApprove,
  onReject,
  onPost,
}) => {
  const isDraftOrRejected = approvalStatus === "draft" || approvalStatus === "rejected";
  const isPending = approvalStatus === "pending";
  const isApprovedAndUnposted = approvalStatus === "approved" && postedStatus === "unposted";
  const isPosted = postedStatus === "posted";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!isPosted && isDraftOrRejected && onEdit && (
        <PermissionGuard permission="inventory.stock_transfer.update">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-navy-800 dark:border-navy-600 dark:text-gray-200 dark:hover:bg-navy-700"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        </PermissionGuard>
      )}

      {!isPosted && isDraftOrRejected && onDelete && (
        <PermissionGuard permission="inventory.stock_transfer.delete">
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </PermissionGuard>
      )}

      {!isPosted && isDraftOrRejected && onSubmit && (
        <PermissionGuard permission="inventory.stock_transfer.submit">
          <button
            onClick={onSubmit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand-700 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 dark:bg-brand-900/20 dark:border-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/40"
          >
            <Send className="w-4 h-4" />
            Submit
          </button>
        </PermissionGuard>
      )}

      {!isPosted && isPending && onApprove && (
        <PermissionGuard permission="inventory.stock_transfer.approve">
          <button
            onClick={onApprove}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400 dark:hover:bg-green-900/40"
          >
            <CheckCircle className="w-4 h-4" />
            Approve
          </button>
        </PermissionGuard>
      )}

      {!isPosted && isPending && onReject && (
        <PermissionGuard permission="inventory.stock_transfer.reject">
          <button
            onClick={onReject}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
        </PermissionGuard>
      )}

      {isApprovedAndUnposted && onPost && (
        <PermissionGuard permission="inventory.stock_transfer.post">
          <button
            onClick={onPost}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900"
          >
            <FileCheck className="w-4 h-4" />
            Post
          </button>
        </PermissionGuard>
      )}
    </div>
  );
};

export default StockTransferActionButtons;
