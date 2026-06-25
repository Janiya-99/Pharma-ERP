import React from "react";

type StatusVariant = "active" | "inactive" | "suspended" | "locked" | "approved" | "rejected" | "pending" | "posted" | "draft" | string;

const StatusBadge = ({ status }: { status?: StatusVariant }) => {
  const getConfig = (s: string) => {
    switch (s?.toLowerCase()) {
      case "active":
      case "approved":
      case "posted":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
      case "inactive":
      case "draft":
        return "bg-gray-100 text-gray-600 ring-1 ring-gray-200";
      case "suspended":
      case "pending":
        return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
      case "locked":
      case "rejected":
        return "bg-red-50 text-red-700 ring-1 ring-red-200";
      default:
        return "bg-gray-100 text-gray-600 ring-1 ring-gray-200";
    }
  };

  const label = status
    ? String(status).charAt(0).toUpperCase() + String(status).slice(1).toLowerCase()
    : "Unknown";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold tracking-wide ${getConfig(String(status))}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
