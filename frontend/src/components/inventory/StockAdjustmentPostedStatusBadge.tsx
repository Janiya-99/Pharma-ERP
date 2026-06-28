import React from "react";

const StockAdjustmentPostedStatusBadge = ({ status }: { status?: unknown }) => {
  let bgColor = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";

  if (status === "posted") {
    bgColor =
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  }

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${bgColor}`}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
    </span>
  );
};

export default StockAdjustmentPostedStatusBadge;
