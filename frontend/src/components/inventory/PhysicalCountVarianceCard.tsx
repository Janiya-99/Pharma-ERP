import React from "react";
import { formatNumber } from "../../lib/utils";
import VarianceQuantityBadge from "./VarianceQuantityBadge";
import AdjustmentDirectionBadge from "./AdjustmentDirectionBadge";

const PhysicalCountVarianceCard = ({
  systemQuantity,
  physicalQuantity,
  varianceQuantity,
  direction,
}: {
  systemQuantity?: unknown;
  physicalQuantity?: unknown;
  varianceQuantity?: unknown;
  direction?: unknown;
}) => {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
      <div className="border-b border-purple-100 bg-purple-50 px-3 py-2 dark:border-purple-800/30 dark:bg-purple-900/20">
        <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">
          Physical Count Variance
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 p-3 md:grid-cols-4">
        <div>
          <span className="mb-0.5 block text-[10px] uppercase text-gray-500">
            System Qty
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatNumber(systemQuantity || 0, 3)}
          </span>
        </div>
        <div>
          <span className="mb-0.5 block text-[10px] uppercase text-gray-500">
            Physical Qty
          </span>
          <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
            {physicalQuantity !== "" && physicalQuantity !== null
              ? formatNumber(physicalQuantity, 3)
              : "-"}
          </span>
        </div>
        <div>
          <span className="mb-0.5 block text-[10px] uppercase text-gray-500">
            Variance Qty
          </span>
          {varianceQuantity !== "" && varianceQuantity !== null ? (
            <VarianceQuantityBadge variance={varianceQuantity} />
          ) : (
            <span className="text-sm font-medium text-gray-400">-</span>
          )}
        </div>
        <div>
          <span className="mb-0.5 block text-[10px] uppercase text-gray-500">
            Direction
          </span>
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
