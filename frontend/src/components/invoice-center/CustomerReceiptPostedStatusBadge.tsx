import React from "react";
import { Badge } from "../ui/badge";
import { CustomerReceiptPostedStatus } from "../../types/invoice-center";

interface Props {
  status: CustomerReceiptPostedStatus;
  className?: string;
}

export const CustomerReceiptPostedStatusBadge: React.FC<Props> = ({
  status,
  className,
}) => {
  const s = (status || "unposted").toString().toLowerCase();
  const getBadgeColor = () => {
    switch (s) {
      case "posted":
        return "bg-green-600 hover:bg-green-700 text-white";
      case "unposted":
        return "bg-gray-200 hover:bg-gray-300 text-gray-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const formattedStatus = s ? s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ") : "Unposted";

  return (
    <Badge
      variant="outline"
      className={`border-transparent ${getBadgeColor()} ${className || ""}`}
    >
      {formattedStatus}
    </Badge>
  );
};
