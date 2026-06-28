import React from "react";
import { formatCurrency, formatNumber } from "lib/utils";

const OpeningStockTotalsCard = ({
  totalQuantity = 0,
  totalStockValue = 0,
  lineCount = 0,
}: {
  totalQuantity?: unknown;
  totalStockValue?: unknown;
  lineCount?: unknown;
}) => {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow dark:border-navy-700 dark:bg-navy-800">
      <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
        Summary Totals
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-md bg-gray-50 p-3 dark:bg-navy-900">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Line Items
          </p>
          <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
            {lineCount}
          </p>
        </div>
        <div className="rounded-md bg-gray-50 p-3 dark:bg-navy-900">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Total Quantity
          </p>
          <p className="mt-1 text-xl font-semibold text-brand-600 dark:text-brand-400">
            {formatNumber(totalQuantity, 3)}
          </p>
        </div>
        <div className="rounded-md border border-brand-100 bg-brand-50 p-3 dark:border-brand-800/30 dark:bg-brand-900/20">
          <p className="text-xs font-medium text-brand-700 dark:text-brand-400">
            Total Stock Value
          </p>
          <p className="mt-1 text-xl font-bold text-brand-700 dark:text-brand-300">
            {formatCurrency(totalStockValue)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OpeningStockTotalsCard;
