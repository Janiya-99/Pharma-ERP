import React from "react";

const ReconciliationStatusBadge = ({ status }) => {
  const getBadgeClass = (status) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const formattedStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getBadgeClass(status)}`}>
      {formattedStatus}
    </span>
  );
};

export default ReconciliationStatusBadge;
