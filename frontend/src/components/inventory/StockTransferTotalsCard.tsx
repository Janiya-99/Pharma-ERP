import { formatNumber, formatCurrency } from "../../lib/utils";

const StockTransferTotalsCard = ({ totalQuantity, totalStockValue, lineCount }: { totalQuantity?: unknown; totalStockValue?: unknown; lineCount?: unknown }) => {
  return (
    <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-navy-700 bg-gray-50/50 dark:bg-navy-800/50">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Transfer Summary</h3>
      </div>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">Total Lines</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{lineCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">Total Quantity</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatNumber(totalQuantity, 3)}
          </span>
        </div>
        <div className="h-px bg-gray-100 dark:bg-navy-700" />
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Total Stock Value</span>
          <span className="text-lg font-bold text-brand-600 dark:text-brand-400">
            {formatCurrency(totalStockValue)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StockTransferTotalsCard;
