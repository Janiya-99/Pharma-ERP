import React from "react";
import { MdWarningAmber } from "react-icons/md";

const StockMovementWarning = ({ title = "Warning", message = "Posting this document will permanently update stock balances and create immutable stock ledger entries. This action cannot be undone." }: { title?: unknown; message?: unknown }) => {
  return (
    <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/30">
      <div className="flex">
        <div className="flex-shrink-0">
          <MdWarningAmber className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">{title}</h3>
          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockMovementWarning;
