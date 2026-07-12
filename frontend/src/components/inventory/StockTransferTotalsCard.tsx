import { formatNumber, formatCurrency } from "../../lib/utils";

const StockTransferTotalsCard = ({ totalQuantity, totalStockValue, lineCount }: { totalQuantity?: unknown; totalStockValue?: unknown; lineCount?: unknown }) => {
  return (
    <div className="bg-white  rounded-xl shadow-sm border border-gray-100  overflow-hidden">
      <div className="p-4 border-b border-gray-100  bg-gray-50/50 ">
        <h3 className="text-sm font-semibold text-gray-800 ">Transfer Summary</h3>
      </div>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 ">Total Lines</span>
          <span className="text-sm font-medium text-gray-900 ">{lineCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 ">Total Quantity</span>
          <span className="text-sm font-medium text-gray-900 ">
            {formatNumber(totalQuantity, 3)}
          </span>
        </div>
        <div className="h-px bg-gray-100 " />
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-900 ">Total Stock Value</span>
          <span className="text-lg font-bold text-brand-600 ">
            {formatCurrency(totalStockValue)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StockTransferTotalsCard;
