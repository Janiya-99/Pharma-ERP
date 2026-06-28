import React from "react";

const LogStatusBadge = ({ status }: { status?: unknown }) => {
  const getStatusConfig = (status: unknown) => {
    switch (status?.toLowerCase()) {
      case "success":
        return {
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          label: "Success",
        };
      case "failed":
        return {
          color: "bg-rose-50 text-rose-700 border-rose-200",
          label: "Failed",
        };
      case "locked":
        return {
          color: "bg-orange-50 text-orange-700 border-orange-200",
          label: "Locked",
        };
      case "suspended":
        return {
          color: "bg-amber-50 text-amber-700 border-amber-200",
          label: "Suspended",
        };
      case "inactive":
        return {
          color: "bg-slate-100 text-slate-600 border-slate-200",
          label: "Inactive",
        };
      default:
        return {
          color: "bg-slate-100 text-slate-600 border-slate-200",
          label: status || "Unknown",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${config.color}`}
    >
      {config.label}
    </span>
  );
};

export default LogStatusBadge;
