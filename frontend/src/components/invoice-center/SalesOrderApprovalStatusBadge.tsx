import React from "react";
import type { SalesOrderApprovalStatus } from "../../types/invoice-center";

interface Props {
  status: SalesOrderApprovalStatus | string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" },
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
  approved: { label: "Approved", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  rejected: { label: "Rejected", className: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" },
  cancelled: { label: "Cancelled", className: "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
};

const SalesOrderApprovalStatusBadge: React.FC<Props> = ({ status }) => {
  const cfg = statusConfig[status] ?? { label: status, className: "bg-gray-100 text-gray-500" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${cfg.className}`}>
      {cfg.label}
    </span>
  );
};

export default SalesOrderApprovalStatusBadge;
