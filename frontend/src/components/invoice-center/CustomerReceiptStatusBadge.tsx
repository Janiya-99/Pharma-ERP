import React from "react";
import { Badge } from "../ui/badge";
import { CustomerReceiptStatus } from "../../types/invoice-center";

interface Props {
  status: CustomerReceiptStatus;
  className?: string;
}

export const CustomerReceiptStatusBadge: React.FC<Props> = ({
  status,
  className,
}) => {
  const getBadgeColor = () => {
    switch (status) {
      case "active":
        return "bg-green-600 hover:bg-green-700 text-white";
      case "cancelled":
        return "bg-red-600 hover:bg-red-700 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <Badge
      variant="outline"
      className={`border-transparent ${getBadgeColor()} ${className || ""}`}
    >
      {formattedStatus}
    </Badge>
  );
};
