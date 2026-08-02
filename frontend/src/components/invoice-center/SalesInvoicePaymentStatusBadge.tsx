import React from "react";
import { Badge } from "../ui/badge";
import { SalesInvoicePaymentStatus } from "../../types/invoice-center";

interface Props {
  status: SalesInvoicePaymentStatus;
  className?: string;
}

export const SalesInvoicePaymentStatusBadge: React.FC<Props> = ({
  status,
  className,
}) => {
  const getBadgeColor = () => {
    switch (status) {
      case "paid":
        return "bg-green-600 hover:bg-green-700 text-white";
      case "partially_paid":
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case "unpaid":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "overdue":
        return "bg-orange-600 hover:bg-orange-700 text-white";
      case "cancelled":
        return "bg-gray-600 hover:bg-gray-700 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const formatStatus = (s: string) => {
    return s
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <Badge
      variant="outline"
      className={`border-transparent ${getBadgeColor()} ${className || ""}`}
    >
      {formatStatus(status)}
    </Badge>
  );
};
