import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "auth/AuthContext";

const OpeningStockActionButtons = ({ 
  entry, 
  onDelete, 
  onSubmit, 
  onApprove, 
  onReject, 
  onPost,
  showViewButton = false,
  className = "" 
}: { entry?: unknown; onDelete?: unknown; onSubmit?: unknown; onApprove?: unknown; onReject?: unknown; onPost?: unknown; showViewButton?: unknown; className?: unknown }) => {
  const { hasPermission } = useAuth();
  
  if (!entry) return null;

  const status = entry.approval_status?.toLowerCase();
  const postedStatus = entry.posted_status?.toLowerCase();

  const isDraftOrRejected = status === "draft" || status === "rejected";
  const isPending = status === "pending";
  const isApproved = status === "approved";
  const isUnposted = postedStatus === "unposted";
  
  // Calculate visibility based on business rules
  const canEdit = isDraftOrRejected;
  const canDelete = isDraftOrRejected;
  const canSubmit = isDraftOrRejected;
  const canApprove = isPending;
  const canReject = isPending;
  const canPost = isApproved && isUnposted;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {showViewButton && hasPermission("inventory.opening_stock.view") && (
        <Link
          to={`/admin/inventory/opening-stock/${entry.id}`}
          className="btn-outline-primary"
        >
          View
        </Link>
      )}

      {canEdit && hasPermission("inventory.opening_stock.update") && (
        <Link
          to={`/admin/inventory/opening-stock/${entry.id}/edit`}
          className="btn-outline-primary"
        >
          Edit
        </Link>
      )}

      {canSubmit && hasPermission("inventory.opening_stock.submit") && (
        <button onClick={onSubmit} className="btn-primary">
          Submit
        </button>
      )}

      {canApprove && hasPermission("inventory.opening_stock.approve") && (
        <button onClick={onApprove} className="btn-success">
          Approve
        </button>
      )}

      {canReject && hasPermission("inventory.opening_stock.approve") && (
        <button onClick={onReject} className="btn-danger">
          Reject
        </button>
      )}

      {canPost && hasPermission("inventory.opening_stock.post") && (
        <button onClick={onPost} className="btn-primary bg-indigo-600 hover:bg-indigo-700 text-white">
          Post Stock
        </button>
      )}

      {canDelete && hasPermission("inventory.opening_stock.delete") && (
        <button onClick={onDelete} className="btn-outline-danger">
          Delete
        </button>
      )}
    </div>
  );
};

export default OpeningStockActionButtons;
