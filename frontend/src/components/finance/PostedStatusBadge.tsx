import React from "react";

const getStatusConfig = (status: unknown) => {
  switch (status?.toLowerCase()) {
    case "unposted":
      return { label: "Unposted", className: "bg-gray-100 text-gray-800" };
    case "posted":
      return { label: "Posted", className: "bg-green-100 text-green-800" };
    case "reversed":
      return { label: "Reversed", className: "bg-orange-100 text-orange-800" };
    default:
      return {
        label: status || "Unknown",
        className: "bg-gray-100 text-gray-600",
      };
  }
};

export default function PostedStatusBadge({ status }: { status?: unknown }) {
  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${config.className}`}
    >
      {config.label}
    </span>
  );
}
