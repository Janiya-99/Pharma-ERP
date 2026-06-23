import React from "react";
import { Info } from "lucide-react";
import { formatNumber, formatCurrency, formatDate } from "../../../lib/utils";

const AvailableStockCard = ({ stockBalance, loading }) => {
  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-navy-800/50 border border-gray-200 dark:border-navy-700 rounded-lg p-3 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-navy-600 rounded w-1/3 mb-2"></div>
        <div className="h-6 bg-gray-200 dark:bg-navy-600 rounded w-1/2"></div>
      </div>
    );
  }

  if (!stockBalance) {
    return (
      <div className="bg-gray-50 dark:bg-navy-800/50 border border-dashed border-gray-300 dark:border-navy-600 rounded-lg p-3 flex flex-col items-center justify-center text-center">
        <Info className="h-5 w-5 text-gray-400 mb-1" />
        <span className="text-xs text-gray-500">Select product & source to view stock</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-lg overflow-hidden shadow-sm">
      <div className="px-3 py-2 bg-gray-50 dark:bg-navy-800/50 border-b border-gray-200 dark:border-navy-700 flex justify-between items-center">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Available Stock</span>
        <span className="text-xs text-gray-500">
          Last updated: {stockBalance.last_movement_date ? formatDate(stockBalance.last_movement_date) : "Never"}
        </span>
      </div>
      <div className="p-3 grid grid-cols-2 gap-y-3 gap-x-4">
        <div>
          <span className="text-[10px] text-gray-500 uppercase block mb-0.5">On Hand</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{formatNumber(stockBalance.quantity_on_hand, 3)}</span>
        </div>
        <div>
          <span className="text-[10px] text-gray-500 uppercase block mb-0.5">Allocated</span>
          <span className="text-sm font-medium text-amber-600">{formatNumber(stockBalance.quantity_allocated, 3)}</span>
        </div>
        <div>
          <span className="text-[10px] text-gray-500 uppercase block mb-0.5">Available</span>
          <span className="text-base font-bold text-green-600">{formatNumber(stockBalance.quantity_available, 3)}</span>
        </div>
        <div>
          <span className="text-[10px] text-gray-500 uppercase block mb-0.5">Avg Cost</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(stockBalance.average_cost)}</span>
        </div>
      </div>
    </div>
  );
};

export default AvailableStockCard;
