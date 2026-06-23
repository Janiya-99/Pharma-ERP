import React from "react";
import { formatCurrency } from "../../lib/utils";
import { ArrowUpRight, ArrowDownRight, DollarSign, List } from "lucide-react";

const StockAdjustmentTotalsCard = ({
  totalQuantityIn,
  totalQuantityOut,
  totalStockValue,
  lineCount,
}: { totalQuantityIn?: unknown; totalQuantityOut?: unknown; totalStockValue?: unknown; lineCount?: unknown }) => {
  return (
    <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Adjustment Summary</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-navy-900 rounded-lg border border-gray-100 dark:border-navy-700">
          <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
            <List className="w-4 h-4" />
            <span className="text-sm font-medium">Total Lines</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{lineCount}</p>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30">
          <div className="flex items-center gap-2 mb-2 text-green-600 dark:text-green-400">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-sm font-medium">Total Qty In</span>
          </div>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            {parseFloat(totalQuantityIn || 0).toFixed(3)}
          </p>
        </div>

        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
          <div className="flex items-center gap-2 mb-2 text-red-600 dark:text-red-400">
            <ArrowDownRight className="w-4 h-4" />
            <span className="text-sm font-medium">Total Qty Out</span>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">
            {parseFloat(totalQuantityOut || 0).toFixed(3)}
          </p>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
            <DollarSign className="w-4 h-4" />
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
