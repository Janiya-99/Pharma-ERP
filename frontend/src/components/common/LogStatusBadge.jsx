import React from "react";

const LogStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
        return { color: "bg-green-100 text-green-800", label: "Success" };
      case "failed":
        return { color: "bg-red-100 text-red-800", label: "Failed" };
      case "locked":
        return { color: "bg-orange-100 text-orange-800", label: "Locked" };
      case "suspended":
        return { color: "bg-yellow-100 text-yellow-800", label: "Suspended" };
      case "inactive":
        return { color: "bg-gray-100 text-gray-800", label: "Inactive" };
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

export default LogStatusBadge;
