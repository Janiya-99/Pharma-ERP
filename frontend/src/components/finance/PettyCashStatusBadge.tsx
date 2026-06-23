import React from "react";

const PettyCashStatusBadge = ({ status }: { status?: unknown }) => {
  let badgeStyle = "";
  let label = status;

  switch (status) {
    case "draft":
      badgeStyle = "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300 border-gray-200 dark:border-gray-700";
      label = "Draft";
      break;
    case "pending":
      badgeStyle = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      label = "Pending";
      break;
    case "approved":
      badgeStyle = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800";
      label = "Approved";
      break;
    case "rejected":
      badgeStyle = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800";
      label = "Rejected";
      break;
    case "cancelled":
      badgeStyle = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700";
      label = "Cancelled";
      break;
    default:
      badgeStyle = "bg-gray-100 text-gray-700 border-gray-200";
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle}`}>
      {label}
    </span>
  );
};

export default PettyCashStatusBadge;
