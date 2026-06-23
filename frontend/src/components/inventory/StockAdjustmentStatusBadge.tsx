import React from "react";

const StockAdjustmentStatusBadge = ({ status }: { status?: unknown }) => {
  let bgColor = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";

  switch (status) {
    case "draft":
      bgColor = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      break;
    case "pending":
      bgColor = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      break;
    case "approved":
      bgColor = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      break;
    case "rejected":
      bgColor = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      break;
    case "cancelled":
      bgColor = "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
      break;
    default:
      break;
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${bgColor}`}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
    </span>
  );
};

export default StockAdjustmentStatusBadge;
