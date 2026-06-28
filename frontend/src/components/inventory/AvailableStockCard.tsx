import React from "react";
import { Info } from "lucide-react";
import { formatNumber, formatCurrency, formatDate } from "../../lib/utils";

const AvailableStockCard = ({
  stockBalance,
  loading,
}: {
  stockBalance?: unknown;
  loading?: unknown;
}) => {
  if (loading) {
    return (
      <div className="animate-pulse rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-navy-700 dark:bg-navy-800/50">
        <div className="mb-2 h-4 w-1/3 rounded bg-gray-200 dark:bg-navy-600"></div>
        <div className="h-6 w-1/2 rounded bg-gray-200 dark:bg-navy-600"></div>
      </div>
    );
  }

  if (!stockBalance) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 text-center dark:border-navy-600 dark:bg-navy-800/50">
        <Info className="mb-1 h-5 w-5 text-gray-400" />
        <span className="text-xs text-gray-500">
          Select product & source to view stock
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2 dark:border-navy-700 dark:bg-navy-800/50">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
          Available Stock
        </span>
        <span className="text-xs text-gray-500">
          Last updated:{" "}
          {stockBalance.last_movement_date
            ? formatDate(stockBalance.last_movement_date)
            : "Never"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 p-3">
        <div>
          <span className="mb-0.5 block text-[10px] uppercase text-gray-500">
            On Hand
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatNumber(stockBalance.quantity_on_hand, 3)}
          </span>
        </div>
        <div>
          <span className="mb-0.5 block text-[10px] uppercase text-gray-500">
            Allocated
          </span>
          <span className="text-sm font-medium text-amber-600">
            {formatNumber(stockBalance.quantity_allocated, 3)}
          </span>
        </div>
        <div>
          <span className="mb-0.5 block text-[10px] uppercase text-gray-500">
            Available
          </span>
          <span className="text-base font-bold text-green-600">
            {formatNumber(stockBalance.quantity_available, 3)}
          </span>
        </div>
        <div>
          <span className="mb-0.5 block text-[10px] uppercase text-gray-500">
            Avg Cost
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(stockBalance.average_cost)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AvailableStockCard;
