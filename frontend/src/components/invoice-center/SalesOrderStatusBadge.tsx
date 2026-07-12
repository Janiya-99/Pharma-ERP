import React from "react";
import { Badge } from "../ui/badge";
import type { SalesOrderStatus } from "../../types/invoice-center";

interface Props {
  status: SalesOrderStatus | string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  open: {
    label: "Open",
    className:
      "bg-indigo-100 text-indigo-700  ",
  },
  partially_invoiced: {
    label: "Partially Invoiced",
    className:
      "bg-yellow-100 text-yellow-700  ",
  },
  fully_invoiced: {
    label: "Fully Invoiced",
    className:
      "bg-emerald-100 text-emerald-700  ",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "bg-rose-100 text-rose-700  ",
  },
  closed: {
    label: "Closed",
    className: "bg-gray-200 text-gray-500  ",
  },
};

const SalesOrderStatusBadge: React.FC<Props> = ({ status }) => {
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

export default SalesOrderStatusBadge;
