import React from "react";

interface CustomerStatusBadgeProps {
  status?: string;
}

const CustomerStatusBadge: React.FC<CustomerStatusBadgeProps> = ({
  status,
}) => {
  const colors: Record<string, string> = {
    active:
      "bg-emerald-50 text-emerald-700 border-emerald-200   ",
    inactive:
      "bg-gray-100 text-gray-700 border-gray-300   ",
    blocked:
      "bg-rose-50 text-rose-700 border-rose-200   ",
    on_hold:
      "bg-amber-50 text-amber-700 border-amber-200   ",
  };

  const labels: Record<string, string> = {
    active: "Active",
    inactive: "Inactive",
    blocked: "Blocked",
    on_hold: "On Hold",
  };

  const style = status ? colors[status] || colors.inactive : colors.inactive;
  const label = status ? labels[status] || status : "Unknown";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style}`}
    >
      {label}
    </span>
  );
};

export default CustomerStatusBadge;
