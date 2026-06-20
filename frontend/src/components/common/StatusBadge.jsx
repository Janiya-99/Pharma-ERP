import React from "react";

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return { color: "bg-green-100 text-green-800", label: "Active" };
      case "inactive":
        return { color: "bg-gray-100 text-gray-800", label: "Inactive" };
      case "suspended":
        return { color: "bg-orange-100 text-orange-800", label: "Suspended" };
      case "locked":
        return { color: "bg-red-100 text-red-800", label: "Locked" };
      default:
        return { color: "bg-gray-100 text-gray-800", label: status || "Unknown" };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${config.color}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
