import React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

const AdjustmentDirectionBadge = ({ direction }: { direction?: unknown }) => {
  if (direction === "in") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
        <ArrowUpRight className="h-3 w-3" />
        In
      </span>
    );
  }

  if (direction === "out") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        <ArrowDownRight className="h-3 w-3" />
        Out
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
      Unknown
    </span>
  );
};

export default AdjustmentDirectionBadge;
