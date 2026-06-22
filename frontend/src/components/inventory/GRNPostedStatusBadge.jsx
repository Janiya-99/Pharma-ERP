import React from "react";

const GRNPostedStatusBadge = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case "unposted":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "posted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getLabel = () => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getBadgeStyle()}`}>
      {getLabel()}
    </span>
  );
};

export default GRNPostedStatusBadge;
