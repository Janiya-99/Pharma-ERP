import React from "react";
import { formatCurrency } from "../../lib/utils";
import { ArrowUpRight, ArrowDownRight, DollarSign, List } from "lucide-react";

const StockAdjustmentTotalsCard = ({
  totalQuantityIn,
  totalQuantityOut,
  totalStockValue,
  lineCount,
}: {
  totalQuantityIn?: unknown;
  totalQuantityOut?: unknown;
  totalStockValue?: unknown;
  lineCount?: unknown;
}) => {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Adjustment Summary
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-navy-700 dark:bg-navy-900">
          <div className="mb-2 flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <List className="h-4 w-4" />
            <span className="text-sm font-medium">Total Lines</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {lineCount}
          </p>
        </div>

        <div className="rounded-lg border border-green-100 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
          <div className="mb-2 flex items-center gap-2 text-green-600 dark:text-green-400">
            <ArrowUpRight className="h-4 w-4" />
            <span className="text-sm font-medium">Total Qty In</span>
          </div>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            {parseFloat(totalQuantityIn || 0).toFixed(3)}
          </p>
        </div>

        <div className="rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
          <div className="mb-2 flex items-center gap-2 text-red-600 dark:text-red-400">
            <ArrowDownRight className="h-4 w-4" />
            <span className="text-sm font-medium">Total Qty Out</span>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">
            {parseFloat(totalQuantityOut || 0).toFixed(3)}
          </p>
        </div>

        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
          <div className="mb-2 flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">Total Value Impact</span>
          </div>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {formatCurrency(totalStockValue || 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustmentTotalsCard;
