import React from "react";
import { useAuth } from "../../auth/AuthContext";
import { Edit, Trash2, Send, CheckCircle, XCircle, FileCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StockAdjustmentActionButtons = ({
  adjustment,
  onDelete,
  onSubmit,
  onApprove,
  onReject,
  onPost,
}) => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  if (!adjustment) return null;

  const isDraftOrRejected = adjustment.approval_status === "draft" || adjustment.approval_status === "rejected";
  const isPending = adjustment.approval_status === "pending";
  const isApprovedAndUnposted = adjustment.approval_status === "approved" && adjustment.posted_status === "unposted";

  return (
    <div className="flex items-center gap-2">
      {/* Edit Button */}
      {isDraftOrRejected && hasPermission("inventory.stock_adjustment.update") && (
        <button
          onClick={() => navigate(`/inventory/stock-adjustments/${adjustment.id}/edit`)}
          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-800"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
      )}

      {/* Delete Button */}
      {isDraftOrRejected && hasPermission("inventory.stock_adjustment.delete") && onDelete && (
        <button
          onClick={() => onDelete(adjustment)}
          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-800"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {/* Submit Button */}
      {isDraftOrRejected && hasPermission("inventory.stock_adjustment.submit") && onSubmit && (
        <button
          onClick={() => onSubmit(adjustment)}
          className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800"
          title="Submit for Approval"
        >
          <Send className="w-4 h-4" />
        </button>
      )}

      {/* Approve Button */}
      {isPending && hasPermission("inventory.stock_adjustment.approve") && onApprove && (
        <button
          onClick={() => onApprove(adjustment)}
          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors border border-transparent hover:border-green-100 dark:hover:border-green-800"
          title="Approve"
        >
          <CheckCircle className="w-4 h-4" />
        </button>
      )}

      {/* Reject Button */}
      {isPending && hasPermission("inventory.stock_adjustment.reject") && onReject && (
        <button
          onClick={() => onReject(adjustment)}
          className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors border border-transparent hover:border-orange-100 dark:hover:border-orange-800"
          title="Reject"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}

      {/* Post Button */}
      {isApprovedAndUnposted && hasPermission("inventory.stock_adjustment.post") && onPost && (
        <button
          onClick={() => onPost(adjustment)}
          className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors border border-transparent hover:border-emerald-100 dark:hover:border-emerald-800"
          title="Post to Stock Ledger"
        >
          <FileCheck className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default StockAdjustmentActionButtons;
