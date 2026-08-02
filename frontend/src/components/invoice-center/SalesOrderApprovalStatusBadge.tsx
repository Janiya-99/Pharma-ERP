import React from "react";
import { Badge } from "../ui/badge";
import type { SalesOrderApprovalStatus } from "../../types/invoice-center";

interface Props {
  status: SalesOrderApprovalStatus | string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-600  ",
  },
  pending: {
    label: "Pending",
    className:
      "bg-yellow-100 text-yellow-700  ",
  },
  approved: {
    label: "Approved",
    className:
      "bg-emerald-100 text-emerald-700  ",
  },
  rejected: {
    label: "Rejected",
    className:
      "bg-rose-100 text-rose-700  ",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-200 text-gray-500  ",
  },
};

const SalesOrderApprovalStatusBadge: React.FC<Props> = ({ status }) => {
  const cfg = statusConfig[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-500",
  };
  return (
    <Badge
      variant="secondary"
      className={`uppercase tracking-wide ${cfg.className}`}
    >
      {cfg.label}
    </Badge>
  );
};

export default SalesOrderApprovalStatusBadge;
