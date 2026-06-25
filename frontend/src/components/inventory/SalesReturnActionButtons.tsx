import React from "react";
import { Button } from "components/ui/button";
import { SalesReturn } from "types/inventory";
import { Edit, Trash, Send, CheckCircle, XCircle, FileArchive } from "lucide-react";
import PermissionGuard from "auth/PermissionGuard";

interface Props {
  salesReturn: SalesReturn;
  onEdit?: () => void;
  onDelete?: () => void;
  onSubmit?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onPost?: () => void;
  isSubmitting?: boolean;
}

export const SalesReturnActionButtons: React.FC<Props> = ({
  salesReturn,
  onEdit,
  onDelete,
  onSubmit,
  onApprove,
  onReject,
  onPost,
  isSubmitting = false,
}) => {
  const { approval_status, posted_status } = salesReturn;

  const canEdit = ["draft", "rejected"].includes(approval_status) && posted_status === "unposted";
  const canDelete = ["draft", "rejected"].includes(approval_status) && posted_status === "unposted";
  const canSubmit = ["draft", "rejected"].includes(approval_status) && posted_status === "unposted";
  const canApprove = approval_status === "pending" && posted_status === "unposted";
  const canReject = approval_status === "pending" && posted_status === "unposted";
  const canPost = approval_status === "approved" && posted_status === "unposted";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canEdit && onEdit && (
        <PermissionGuard permission="inventory.sales_return.update">
          <Button variant="outline" size="sm" onClick={onEdit} disabled={isSubmitting}>
            <Edit className="w-4 h-4 mr-1" /> Edit
          </Button>
        </PermissionGuard>
      )}

      {canDelete && onDelete && (
        <PermissionGuard permission="inventory.sales_return.delete">
          <Button variant="outline" size="sm" onClick={onDelete} disabled={isSubmitting} className="text-red-600 hover:text-red-700">
            <Trash className="w-4 h-4 mr-1" /> Delete
          </Button>
        </PermissionGuard>
      )}

      {canSubmit && onSubmit && (
        <PermissionGuard permission="inventory.sales_return.submit">
          <Button variant="default" size="sm" onClick={onSubmit} disabled={isSubmitting}>
            <Send className="w-4 h-4 mr-1" /> Submit
          </Button>
        </PermissionGuard>
      )}

      {canApprove && onApprove && (
        <PermissionGuard permission="inventory.sales_return.approve">
          <Button variant="outline" size="sm" onClick={onApprove} disabled={isSubmitting} className="text-green-600 border-green-600 hover:bg-green-50">
            <CheckCircle className="w-4 h-4 mr-1" /> Approve
          </Button>
        </PermissionGuard>
      )}

      {canReject && onReject && (
        <PermissionGuard permission="inventory.sales_return.reject">
          <Button variant="outline" size="sm" onClick={onReject} disabled={isSubmitting} className="text-red-600 border-red-600 hover:bg-red-50">
            <XCircle className="w-4 h-4 mr-1" /> Reject
          </Button>
        </PermissionGuard>
      )}

      {canPost && onPost && (
        <PermissionGuard permission="inventory.sales_return.post">
          <Button variant="default" size="sm" onClick={onPost} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
            <FileArchive className="w-4 h-4 mr-1" /> Post Return
          </Button>
        </PermissionGuard>
      )}
    </div>
  );
};
