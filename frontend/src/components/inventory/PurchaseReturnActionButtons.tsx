import React from "react";
import { Button } from "components/ui/button";
import { PurchaseReturn } from "types/inventory";
import {
  Edit,
  Trash,
  Send,
  CheckCircle,
  XCircle,
  FileArchive,
} from "lucide-react";
import PermissionGuard from "auth/PermissionGuard";

interface Props {
  purchaseReturn: PurchaseReturn;
  onEdit?: () => void;
  onDelete?: () => void;
  onSubmit?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onPost?: () => void;
  isSubmitting?: boolean;
}

export const PurchaseReturnActionButtons: React.FC<Props> = ({
  purchaseReturn,
  onEdit,
  onDelete,
  onSubmit,
  onApprove,
  onReject,
  onPost,
  isSubmitting = false,
}) => {
  const { approval_status, posted_status } = purchaseReturn;

  const canEdit =
    ["draft", "rejected"].includes(approval_status) &&
    posted_status === "unposted";
  const canDelete =
    ["draft", "rejected"].includes(approval_status) &&
    posted_status === "unposted";
  const canSubmit =
    ["draft", "rejected"].includes(approval_status) &&
    posted_status === "unposted";
  const canApprove =
    approval_status === "pending" && posted_status === "unposted";
  const canReject =
    approval_status === "pending" && posted_status === "unposted";
  const canPost =
    approval_status === "approved" && posted_status === "unposted";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canEdit && onEdit && (
        <PermissionGuard permission="inventory.purchase_return.update">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            disabled={isSubmitting}
          >
            <Edit className="mr-1 h-4 w-4" /> Edit
          </Button>
        </PermissionGuard>
      )}

      {canDelete && onDelete && (
        <PermissionGuard permission="inventory.purchase_return.delete">
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            disabled={isSubmitting}
            className="text-red-600 hover:text-red-700"
          >
            <Trash className="mr-1 h-4 w-4" /> Delete
          </Button>
        </PermissionGuard>
      )}

      {canSubmit && onSubmit && (
        <PermissionGuard permission="inventory.purchase_return.submit">
          <Button
            variant="default"
            size="sm"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            <Send className="mr-1 h-4 w-4" /> Submit
          </Button>
        </PermissionGuard>
      )}

      {canApprove && onApprove && (
        <PermissionGuard permission="inventory.purchase_return.approve">
          <Button
            variant="outline"
            size="sm"
            onClick={onApprove}
            disabled={isSubmitting}
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <CheckCircle className="mr-1 h-4 w-4" /> Approve
          </Button>
        </PermissionGuard>
      )}

      {canReject && onReject && (
        <PermissionGuard permission="inventory.purchase_return.reject">
          <Button
            variant="outline"
            size="sm"
            onClick={onReject}
            disabled={isSubmitting}
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
            <XCircle className="mr-1 h-4 w-4" /> Reject
          </Button>
        </PermissionGuard>
      )}

      {canPost && onPost && (
        <PermissionGuard permission="inventory.purchase_return.post">
          <Button
            variant="default"
            size="sm"
            onClick={onPost}
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <FileArchive className="mr-1 h-4 w-4" /> Post Return
          </Button>
        </PermissionGuard>
      )}
    </div>
  );
};
