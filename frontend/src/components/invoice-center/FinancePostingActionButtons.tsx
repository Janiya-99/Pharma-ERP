import React from "react";
import { Button } from "../ui/button";
import { Send, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PermissionGuard from "../../auth/PermissionGuard";
import type { InvoiceCenterFinancePostingDocumentType } from "../../types/invoice-center";

interface Props {
  documentType: InvoiceCenterFinancePostingDocumentType;
  documentId: number;
  financePostStatus: string;
  onPostToFinance?: () => void;
  posting?: boolean;
}

const sourceDocumentRoutes: Record<
  InvoiceCenterFinancePostingDocumentType,
  string
> = {
  sales_invoice: "/admin/invoice-center/sales-invoices",
  credit_note: "/admin/invoice-center/credit-notes",
  debit_note: "/admin/invoice-center/debit-notes",
  customer_receipt: "/admin/invoice-center/customer-receipts",
};

export const FinancePostingActionButtons: React.FC<Props> = ({
  documentType,
  documentId,
  financePostStatus,
  onPostToFinance,
  posting = false,
}) => {
  const navigate = useNavigate();
  const basePath = sourceDocumentRoutes[documentType] || "";

  return (
    <div className="flex items-center gap-1.5">
      {financePostStatus !== "posted" && onPostToFinance && (
        <PermissionGuard permission="invoice_center.finance_posting.post">
          <Button
            size="sm"
            variant="default"
            onClick={onPostToFinance}
            disabled={posting}
            className="h-7 px-2 text-xs"
          >
            <Send className="mr-1 h-3 w-3" />
            Post to Finance
          </Button>
        </PermissionGuard>
      )}
      <Button
        size="sm"
        variant="outline"
        onClick={() => navigate(`${basePath}/${documentId}`)}
        className="h-7 px-2 text-xs"
      >
        <Eye className="mr-1 h-3 w-3" />
        View
      </Button>
    </div>
  );
};

export default FinancePostingActionButtons;
