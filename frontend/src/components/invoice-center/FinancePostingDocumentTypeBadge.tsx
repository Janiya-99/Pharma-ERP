import React from "react";
import { Badge } from "../ui/badge";
import type { InvoiceCenterFinancePostingDocumentType } from "../../types/invoice-center";

interface Props {
  type: InvoiceCenterFinancePostingDocumentType;
  className?: string;
}

const typeConfig: Record<
  InvoiceCenterFinancePostingDocumentType,
  { label: string; color: string }
> = {
  sales_invoice: {
    label: "Sales Invoice",
    color: "bg-indigo-600 hover:bg-indigo-700 text-white",
  },
  credit_note: {
    label: "Credit Note",
    color: "bg-green-600 hover:bg-green-700 text-white",
  },
  debit_note: {
    label: "Debit Note",
    color: "bg-orange-500 hover:bg-orange-600 text-white",
  },
  customer_receipt: {
    label: "Customer Receipt",
    color: "bg-purple-600 hover:bg-purple-700 text-white",
  },
};

export const FinancePostingDocumentTypeBadge: React.FC<Props> = ({
  type,
  className,
}) => {
  const config = typeConfig[type] || {
    label: type,
    color: "bg-gray-200 text-gray-800",
  };

  return (
    <Badge
      variant="outline"
      className={`border-transparent ${config.color} ${className || ""}`}
    >
      {config.label}
    </Badge>
  );
};

export default FinancePostingDocumentTypeBadge;
