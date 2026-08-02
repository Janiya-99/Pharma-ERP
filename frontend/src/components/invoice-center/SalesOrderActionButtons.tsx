import React from "react";
import {
  CheckCircle2,
  Eye,
  FileCheck2,
  Lock,
  Pencil,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import PermissionGuard from "../../auth/PermissionGuard";
import type { SalesOrder } from "../../types/invoice-center";

type SalesOrderActionButtonsProps = {
  order: SalesOrder;
  onView?: () => void;
  onEdit?: () => void;
  onSubmit?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
};

const SalesOrderActionButtons: React.FC<SalesOrderActionButtonsProps> = ({
  order,
  onView,
  onEdit,
  onSubmit,
  onApprove,
  onReject,
  onClose,
  onCancel,
  onDelete,
}) => {
  const canEditDraft = order.approval_status === "draft";
  const canApprove = order.approval_status === "pending";
  const canClose =
    order.approval_status === "approved" && order.order_status === "open";
  const canCancel =
    order.order_status !== "cancelled" && order.order_status !== "closed";

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {onView && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onView}
          title="View"
        >
          <Eye className="h-4 w-4" />
          View
        </Button>
      )}
      {onEdit && canEditDraft && (
        <PermissionGuard permission="invoice_center.sales_order.update">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onEdit}
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </PermissionGuard>
      )}
      {onSubmit && canEditDraft && (
        <PermissionGuard permission="invoice_center.sales_order.submit">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSubmit}
            title="Submit"
          >
            <Send className="h-4 w-4" />
            Submit
          </Button>
        </PermissionGuard>
      )}
      {onApprove && canApprove && (
        <PermissionGuard permission="invoice_center.sales_order.approve">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onApprove}
            title="Approve"
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve
          </Button>
        </PermissionGuard>
      )}
      {onReject && canApprove && (
        <PermissionGuard permission="invoice_center.sales_order.reject">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onReject}
            title="Reject"
          >
            <XCircle className="h-4 w-4" />
            Reject
          </Button>
        </PermissionGuard>
      )}
      {onClose && canClose && (
        <PermissionGuard permission="invoice_center.sales_order.close">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            title="Close"
          >
            <Lock className="h-4 w-4" />
            Close
          </Button>
        </PermissionGuard>
      )}
      {onCancel && canCancel && (
        <PermissionGuard permission="invoice_center.sales_order.cancel">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onCancel}
            title="Cancel"
          >
            <FileCheck2 className="h-4 w-4" />
            Cancel
          </Button>
        </PermissionGuard>
      )}
      {onDelete && canEditDraft && (
        <PermissionGuard permission="invoice_center.sales_order.delete">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onDelete}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </PermissionGuard>
      )}
    </div>
  );
};

export default SalesOrderActionButtons;
