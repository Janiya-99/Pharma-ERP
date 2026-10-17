import React from "react";
import { Printer } from "lucide-react";
import { Button } from "../ui/button";
import { SalesInvoice } from "../../types/invoice-center";
import PermissionGuard from "../../auth/PermissionGuard";

interface Props {
  invoice: SalesInvoice;
  onEdit?: () => void;
  onDelete?: () => void;
  onSubmit?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onPost?: () => void;
  onCancel?: () => void;
  onPrint?: () => void;
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
  onPrint,
  layout = "horizontal",
  className = "",
}) => {
  const { approval_status, posted_status } = invoice;
  const isPosted = posted_status === "posted";

  return (
    <div
      className={`flex items-center gap-2 ${
        layout === "vertical" ? "flex-col" : "flex-row"
      } ${className}`}
    >
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1.5 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 cursor-pointer"
        onClick={() => {
          if (onPrint) onPrint();
          else window.open(`/invoice-center/sales-invoices/${invoice.id}/print`, "_blank");
        }}
        title="Print Invoice"
      >
        <Printer className="h-4 w-4 text-slate-600" />
        <span>Print</span>
      </Button>
      {!isPosted &&
        (approval_status === "draft" || approval_status === "rejected") &&
        onEdit && (
          <PermissionGuard permission="invoice_center.sales_invoice.update">
            <Button variant="outline" onClick={onEdit} size="sm">
              Edit
            </Button>
          </PermissionGuard>
        )}

      {!isPosted &&
        (approval_status === "draft" || approval_status === "rejected") &&
        onDelete && (
          <PermissionGuard permission="invoice_center.sales_invoice.delete">
            <Button variant="destructive" onClick={onDelete} size="sm">
              Delete
            </Button>
          </PermissionGuard>
        )}

      {!isPosted &&
        (approval_status === "draft" || approval_status === "rejected") &&
        onSubmit && (
          <PermissionGuard permission="invoice_center.sales_invoice.submit">
            <Button variant="default" onClick={onSubmit} size="sm">
              Submit
            </Button>
          </PermissionGuard>
        )}

      {!isPosted && approval_status === "pending" && onApprove && (
        <PermissionGuard permission="invoice_center.sales_invoice.approve">
          <Button
            variant="default"
            className="bg-green-600 hover:bg-green-700"
            onClick={onApprove}
            size="sm"
          >
            Approve
          </Button>
        </PermissionGuard>
      )}

      {!isPosted && approval_status === "pending" && onReject && (
        <PermissionGuard permission="invoice_center.sales_invoice.reject">
          <Button variant="destructive" onClick={onReject} size="sm">
            Reject
          </Button>
        </PermissionGuard>
      )}

      {!isPosted && approval_status === "approved" && onPost && (
        <PermissionGuard permission="invoice_center.sales_invoice.post">
          <Button
            variant="default"
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={onPost}
            size="sm"
          >
            Post
          </Button>
        </PermissionGuard>
      )}

      {!isPosted &&
        (approval_status === "draft" ||
          approval_status === "pending" ||
          approval_status === "rejected" ||
          approval_status === "approved") &&
        onCancel && (
          <PermissionGuard permission="invoice_center.sales_invoice.update">
            <Button variant="outline" onClick={onCancel} size="sm">
              Cancel
            </Button>
          </PermissionGuard>
        )}
    </div>
  );
};
