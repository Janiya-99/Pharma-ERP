import { formatCurrency, formatNumber } from "lib/utils";

const OpeningStockTotalsCard = ({ totalQuantity = 0, totalStockValue = 0, lineCount = 0 }: { totalQuantity?: unknown; totalStockValue?: unknown; lineCount?: unknown }) => {
  return (
    <div className="bg-white  rounded-lg shadow p-4 border border-gray-100 ">
      <h3 className="text-sm font-semibold text-gray-900  mb-4">Summary Totals</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50  p-3 rounded-md">
          <p className="text-xs text-gray-500  font-medium">Line Items</p>
          <p className="mt-1 text-xl font-semibold text-gray-900 ">{lineCount}</p>
        </div>
        <div className="bg-gray-50  p-3 rounded-md">
          <p className="text-xs text-gray-500  font-medium">Total Quantity</p>
          <p className="mt-1 text-xl font-semibold text-brand-600 ">
            {formatNumber(totalQuantity, 3)}
          </p>
        </div>
        <div className="bg-brand-50  p-3 rounded-md border border-brand-100 ">
          <p className="text-xs text-brand-700  font-medium">Total Stock Value</p>
          <p className="mt-1 text-xl font-bold text-brand-700 ">
            {formatCurrency(totalStockValue)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OpeningStockTotalsCard;
