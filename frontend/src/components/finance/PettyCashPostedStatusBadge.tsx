import React from "react";

const PettyCashPostedStatusBadge = ({ status }: { status?: unknown }) => {
  let badgeStyle = "";
  let label = status;

  switch (status) {
    case "unposted":
      badgeStyle = "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300 border-gray-200 dark:border-gray-700";
      label = "Unposted";
      break;
    case "posted":
      badgeStyle = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800";
      label = "Posted";
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

export default PettyCashPostedStatusBadge;
