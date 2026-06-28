import React from "react";

const InventoryPostedStatusBadge = ({ status }: { status?: unknown }) => {
  const isPosted = status?.toLowerCase() === "posted";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        isPosted
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      }`}
    >
      {isPosted ? "Posted" : "Unposted"}
    </span>
  );
};

export default InventoryPostedStatusBadge;
