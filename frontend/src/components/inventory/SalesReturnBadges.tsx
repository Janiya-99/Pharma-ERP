import React from "react";
import { Badge } from "components/ui/badge";

export const SalesReturnStatusBadge: React.FC<{ status: string }> = ({
  status,
}) => {
  let color = "bg-gray-100 text-gray-800";

  switch (status?.toLowerCase()) {
    case "draft":
      color = "bg-gray-100 text-gray-800";
      break;
    case "pending":
      color = "bg-yellow-100 text-yellow-800";
      break;
    case "approved":
      color = "bg-green-100 text-green-800";
      break;
    case "rejected":
      color = "bg-red-100 text-red-800";
      break;
    case "cancelled":
      color = "bg-gray-300 text-gray-800";
      break;
    default:
      break;
  }

  return (
    <Badge
      className={`${color} rounded px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider`}
    >
      {status || "Unknown"}
    </Badge>
  );
};

export const SalesReturnPostedStatusBadge: React.FC<{ status: string }> = ({
  status,
}) => {
  let color = "bg-gray-100 text-gray-800";

  if (status?.toLowerCase() === "posted") {
    color = "bg-green-100 text-green-800";
  }

  return (
    <Badge
      className={`${color} rounded px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider`}
    >
      {status || "Unknown"}
    </Badge>
  );
};

export const SalesReturnReasonBadge: React.FC<{ reason: string }> = ({
  reason,
}) => {
  let color = "bg-gray-100 text-gray-800";

  switch (reason?.toLowerCase()) {
    case "damaged":
    case "quality_issue":
      color = "bg-orange-100 text-orange-800";
      break;
    case "expired":
    case "recall":
      color = "bg-red-100 text-red-800";
      break;
    case "wrong_item":
      color = "bg-purple-100 text-purple-800";
      break;
    case "customer_return":
      color = "bg-indigo-100 text-indigo-800";
      break;
    case "near_expiry":
      color = "bg-yellow-100 text-yellow-800";
      break;
    case "pricing_error":
    case "other":
      color = "bg-gray-100 text-gray-800";
      break;
    default:
      break;
  }

  const displayReason = reason
    ? reason.replace(/_/g, " ").toUpperCase()
    : "UNKNOWN";

  return (
    <Badge
      className={`${color} rounded px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider`}
    >
      {displayReason}
    </Badge>
  );
};

export const SalesReturnConditionBadge: React.FC<{ condition: string }> = ({
  condition,
}) => {
  let color = "bg-gray-100 text-gray-800";

  switch (condition?.toLowerCase()) {
    case "saleable":
      color = "bg-green-100 text-green-800";
      break;
    case "quarantine":
      color = "bg-yellow-100 text-yellow-800";
      break;
    case "damaged":
      color = "bg-orange-100 text-orange-800";
      break;
    case "expired":
      color = "bg-red-100 text-red-800";
      break;
    case "recall":
      color = "bg-purple-100 text-purple-800";
      break;
    default:
      break;
  }

  const displayCondition = condition
    ? condition.replace(/_/g, " ").toUpperCase()
    : "UNKNOWN";

  return (
    <Badge
      className={`${color} rounded px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider`}
    >
      {displayCondition}
    </Badge>
  );
};
