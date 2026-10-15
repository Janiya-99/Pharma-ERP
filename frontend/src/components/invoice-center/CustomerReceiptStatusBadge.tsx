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
  const s = (status || "active").toString().toLowerCase();
  const getBadgeColor = () => {
    switch (s) {
      case "active":
        return "bg-green-600 hover:bg-green-700 text-white";
      case "cancelled":
        return "bg-red-600 hover:bg-red-700 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const formattedStatus = s ? s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ") : "Active";

  return (
    <Badge
      variant="outline"
      className={`border-transparent ${getBadgeColor()} ${className || ""}`}
    >
      {formattedStatus}
    </Badge>
  );
};
