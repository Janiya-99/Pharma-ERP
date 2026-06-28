import { formatCurrency, formatNumber } from "lib/utils";

const OpeningStockTotalsCard = ({ totalQuantity = 0, totalStockValue = 0, lineCount = 0 }: { totalQuantity?: unknown; totalStockValue?: unknown; lineCount?: unknown }) => {
  return (
    <div className="bg-white dark:bg-navy-800 rounded-lg shadow p-4 border border-gray-100 dark:border-navy-700">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Summary Totals</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-navy-900 p-3 rounded-md">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Line Items</p>
          <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{lineCount}</p>
        </div>
        <div className="bg-gray-50 dark:bg-navy-900 p-3 rounded-md">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Quantity</p>
          <p className="mt-1 text-xl font-semibold text-brand-600 dark:text-brand-400">
            {formatNumber(totalQuantity, 3)}
          </p>
        </div>
        <div className="bg-brand-50 dark:bg-brand-900/20 p-3 rounded-md border border-brand-100 dark:border-brand-800/30">
          <p className="text-xs text-brand-700 dark:text-brand-400 font-medium">Total Stock Value</p>
          <p className="mt-1 text-xl font-bold text-brand-700 dark:text-brand-300">
            {formatCurrency(totalStockValue)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OpeningStockTotalsCard;
