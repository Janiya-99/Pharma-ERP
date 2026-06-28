import React from "react";
import { formatNumber, formatCurrency } from "../../lib/utils";

const StockTransferTotalsCard = ({
  totalQuantity,
  totalStockValue,
  lineCount,
}: {
  totalQuantity?: unknown;
  totalStockValue?: unknown;
  lineCount?: unknown;
}) => {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
      <div className="border-b border-gray-100 bg-gray-50/50 p-4 dark:border-navy-700 dark:bg-navy-800/50">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
          Transfer Summary
        </h3>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Lines
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {lineCount}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Quantity
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatNumber(totalQuantity, 3)}
          </span>
        </div>
        <div className="h-px bg-gray-100 dark:bg-navy-700" />
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Total Stock Value
          </span>
          <span className="text-lg font-bold text-brand-600 dark:text-brand-400">
            {formatCurrency(totalStockValue)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StockTransferTotalsCard;
