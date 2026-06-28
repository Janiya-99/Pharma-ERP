import React from "react";
import { Button } from "../ui/button";
import { SalesInvoice } from "../../types/invoice-center";
import { PermissionGuard } from "../../auth/PermissionGuard";

interface Props {
  invoice: SalesInvoice;
  onEdit?: () => void;
  onDelete?: () => void;
  onSubmit?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onPost?: () => void;
  onCancel?: () => void;
  layout?: "horizontal" | "vertical";
  className?: string;
}

export const SalesInvoiceActionButtons: React.FC<Props> = ({
  invoice,
  onEdit,
  onDelete,
  onSubmit,
  onApprove,
  onReject,
  onPost,
  onCancel,
  layout = "horizontal",
  className = "",
}) => {
  const { approval_status, posted_status } = invoice;
  const isPosted = posted_status === "posted";

  return (
    <div className={`flex gap-2 ${layout === "vertical" ? "flex-col" : "flex-row"} ${className}`}>
      {!isPosted && (approval_status === "draft" || approval_status === "rejected") && onEdit && (
        <PermissionGuard requiredPermission="invoice_center.sales_invoice.update">
          <Button variant="outline" onClick={onEdit} size="sm">
            Edit
          </Button>
        </PermissionGuard>
      )}

      {!isPosted && (approval_status === "draft" || approval_status === "rejected") && onDelete && (
        <PermissionGuard requiredPermission="invoice_center.sales_invoice.delete">
          <Button variant="destructive" onClick={onDelete} size="sm">
            Delete
          </Button>
        </PermissionGuard>
      )}

      {!isPosted && (approval_status === "draft" || approval_status === "rejected") && onSubmit && (
        <PermissionGuard requiredPermission="invoice_center.sales_invoice.submit">
          <Button variant="default" onClick={onSubmit} size="sm">
            Submit
          </Button>
        </PermissionGuard>
      )}

      {!isPosted && approval_status === "pending" && onApprove && (
        <PermissionGuard requiredPermission="invoice_center.sales_invoice.approve">
          <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={onApprove} size="sm">
            Approve
          </Button>
        </PermissionGuard>
      )}

      {!isPosted && approval_status === "pending" && onReject && (
        <PermissionGuard requiredPermission="invoice_center.sales_invoice.reject">
          <Button variant="destructive" onClick={onReject} size="sm">
            Reject
          </Button>
        </PermissionGuard>
      )}

      {!isPosted && approval_status === "approved" && onPost && (
        <PermissionGuard requiredPermission="invoice_center.sales_invoice.post">
          <Button variant="default" className="bg-blue-600 hover:bg-blue-700" onClick={onPost} size="sm">
            Post
          </Button>
        </PermissionGuard>
      )}

      {!isPosted && (approval_status === "draft" || approval_status === "pending" || approval_status === "rejected" || approval_status === "approved") && onCancel && (
        <PermissionGuard requiredPermission="invoice_center.sales_invoice.update">
          <Button variant="outline" onClick={onCancel} size="sm">
            Cancel
          </Button>
        </PermissionGuard>
      )}
    </div>
  );
};
