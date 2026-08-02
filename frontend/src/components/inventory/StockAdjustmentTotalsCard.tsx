import { formatCurrency } from "../../lib/utils";
import { ArrowUpRight, ArrowDownRight, DollarSign, List } from "lucide-react";

const StockAdjustmentTotalsCard = ({
  totalQuantityIn,
  totalQuantityOut,
  totalStockValue,
  lineCount,
}: { totalQuantityIn?: unknown; totalQuantityOut?: unknown; totalStockValue?: unknown; lineCount?: unknown }) => {
  return (
    <div className="bg-white  rounded-xl shadow-sm border border-gray-100  p-6">
      <h3 className="text-lg font-semibold text-gray-900  mb-4">Adjustment Summary</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50  rounded-lg border border-gray-100 ">
          <div className="flex items-center gap-2 mb-2 text-gray-500 ">
            <List className="w-4 h-4" />
            <span className="text-sm font-medium">Total Lines</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 ">{lineCount}</p>
        </div>

        <div className="p-4 bg-green-50  rounded-lg border border-green-100 ">
          <div className="flex items-center gap-2 mb-2 text-green-600 ">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-sm font-medium">Total Qty In</span>
          </div>
          <p className="text-2xl font-bold text-green-700 ">
            {parseFloat(totalQuantityIn || 0).toFixed(3)}
          </p>
        </div>

        <div className="p-4 bg-red-50  rounded-lg border border-red-100 ">
          <div className="flex items-center gap-2 mb-2 text-red-600 ">
            <ArrowDownRight className="w-4 h-4" />
            <span className="text-sm font-medium">Total Qty Out</span>
          </div>
          <p className="text-2xl font-bold text-red-700 ">
            {parseFloat(totalQuantityOut || 0).toFixed(3)}
          </p>
        </div>

        <div className="p-4 bg-indigo-50  rounded-lg border border-indigo-100 ">
          <div className="flex items-center gap-2 mb-2 text-indigo-600 ">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">Total Value Impact</span>
          </div>
          <p className="text-2xl font-bold text-indigo-700 ">
            {formatCurrency(totalStockValue || 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustmentTotalsCard;
