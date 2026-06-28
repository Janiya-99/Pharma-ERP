import React from "react";
import { Badge } from "../ui/badge";
import { DebitNoteApprovalStatus } from "../../types/invoice-center";

interface Props {
  status: DebitNoteApprovalStatus;
  className?: string;
}

export const DebitNoteApprovalStatusBadge: React.FC<Props> = ({
  status,
  className,
}) => {
  const getBadgeColor = () => {
    switch (status) {
      case "approved":
        return "bg-green-600 hover:bg-green-700 text-white";
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case "rejected":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "cancelled":
        return "bg-gray-600 hover:bg-gray-700 text-white";
      case "draft":
        return "bg-gray-200 hover:bg-gray-300 text-gray-800";
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
