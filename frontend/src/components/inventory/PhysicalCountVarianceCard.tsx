import { formatNumber } from "../../lib/utils";
import VarianceQuantityBadge from "./VarianceQuantityBadge";
import AdjustmentDirectionBadge from "./AdjustmentDirectionBadge";

const PhysicalCountVarianceCard = ({ systemQuantity, physicalQuantity, varianceQuantity, direction }: { systemQuantity?: unknown; physicalQuantity?: unknown; varianceQuantity?: unknown; direction?: unknown }) => {
  return (
    <div className="bg-white  border border-gray-200  rounded-lg overflow-hidden shadow-sm">
      <div className="px-3 py-2 bg-purple-50  border-b border-purple-100 ">
        <span className="text-xs font-semibold text-purple-700 ">Physical Count Variance</span>
      </div>
      <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-4">
        <div>
          <span className="text-[10px] text-gray-500 uppercase block mb-0.5">System Qty</span>
          <span className="text-sm font-medium text-gray-900 ">
            {formatNumber(systemQuantity || 0, 3)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-gray-500 uppercase block mb-0.5">Physical Qty</span>
          <span className="text-sm font-medium text-purple-700 ">
            {physicalQuantity !== "" && physicalQuantity !== null ? formatNumber(physicalQuantity, 3) : "-"}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-gray-500 uppercase block mb-0.5">Variance Qty</span>
          {varianceQuantity !== "" && varianceQuantity !== null ? (
            <VarianceQuantityBadge variance={varianceQuantity} />
          ) : (
            <span className="text-sm font-medium text-gray-400">-</span>
          )}
        </div>
        <div>
          <span className="text-[10px] text-gray-500 uppercase block mb-0.5">Direction</span>
          {direction ? (
            <AdjustmentDirectionBadge direction={direction} />
          ) : (
            <span className="text-sm font-medium text-gray-400">-</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhysicalCountVarianceCard;
