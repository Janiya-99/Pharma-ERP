import React from "react";
import { Button } from "../ui/button";
import {
  CreditNoteApprovalStatus,
  CreditNotePostedStatus,
} from "../../types/invoice-center";
import PermissionGuard from "../../auth/PermissionGuard";
import {
  Edit,
  Trash,
  Send,
  CheckCircle,
  XCircle,
  FileCheck,
  XSquare,
} from "lucide-react";

interface Props {
  approvalStatus: CreditNoteApprovalStatus;
  postedStatus: CreditNotePostedStatus;
  onEdit?: () => void;
  onDelete?: () => void;
  onSubmit?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onPost?: () => void;
  onCancel?: () => void;
}

export const CreditNoteActionButtons: React.FC<Props> = ({
  approvalStatus,
  postedStatus,
  onEdit,
  onDelete,
  onSubmit,
  onApprove,
  onReject,
  onPost,
  onCancel,
}) => {
  const isPosted = postedStatus === "posted";
  const canEditOrDelete =
    (approvalStatus === "draft" || approvalStatus === "rejected") && !isPosted;
  const canSubmit =
    (approvalStatus === "draft" || approvalStatus === "rejected") && !isPosted;
  const canApproveOrReject = approvalStatus === "pending" && !isPosted;
  const canPost = approvalStatus === "approved" && !isPosted;
  const canCancel =
    (approvalStatus === "draft" ||
      approvalStatus === "pending" ||
      approvalStatus === "rejected" ||
      approvalStatus === "approved") &&
    !isPosted;

  return (
    <div className="flex flex-wrap gap-2">
      {canEditOrDelete && onEdit && (
        <PermissionGuard permission="invoice_center.credit_note.update">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </PermissionGuard>
      )}

      {canSubmit && onSubmit && (
        <PermissionGuard permission="invoice_center.credit_note.submit">
          <Button
            variant="outline"
            size="sm"
            onClick={onSubmit}
            className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <Send className="mr-2 h-4 w-4" />
            Submit
          </Button>
        </PermissionGuard>
      )}

      {canApproveOrReject && onApprove && (
        <PermissionGuard permission="invoice_center.credit_note.approve">
          <Button
            variant="outline"
            size="sm"
            onClick={onApprove}
            className="text-green-600 hover:bg-green-50 hover:text-green-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve
          </Button>
        </PermissionGuard>
      )}

      {canApproveOrReject && onReject && (
        <PermissionGuard permission="invoice_center.credit_note.reject">
          <Button
            variant="outline"
            size="sm"
            onClick={onReject}
            className="text-orange-600 hover:bg-orange-50 hover:text-orange-700"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
        </PermissionGuard>
      )}

      {canPost && onPost && (
        <PermissionGuard permission="invoice_center.credit_note.post">
          <Button
            size="sm"
            onClick={onPost}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            <FileCheck className="mr-2 h-4 w-4" />
            Post
          </Button>
        </PermissionGuard>
      )}

      {canCancel && onCancel && (
        <PermissionGuard permission="invoice_center.credit_note.update">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="text-gray-600 hover:bg-gray-100 hover:text-gray-700"
          >
            <XSquare className="mr-2 h-4 w-4" />
            Cancel Note
          </Button>
        </PermissionGuard>
      )}

      {canEditOrDelete && onDelete && (
        <PermissionGuard permission="invoice_center.credit_note.delete">
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </PermissionGuard>
      )}
    </div>
  );
};
