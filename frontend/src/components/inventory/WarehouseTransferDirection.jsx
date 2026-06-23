import React from "react";
import { ArrowRight } from "lucide-react";

const WarehouseTransferDirection = ({ fromWarehouse, toWarehouse, fromLocation, toLocation }) => {
  return (
    <div className="flex items-center gap-3 bg-gray-50 dark:bg-navy-800/50 p-3 rounded-lg border border-gray-100 dark:border-navy-700 w-fit">
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Source</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {fromWarehouse?.warehouse_name || "N/A"}
        </span>
        {fromLocation && (
          <span className="text-xs text-gray-500">{fromLocation.location_name}</span>
        )}
      </div>

      <div className="px-4">
        <ArrowRight className="h-5 w-5 text-gray-400" />
      </div>

      <div className="flex flex-col">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Destination</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {toWarehouse?.warehouse_name || "N/A"}
        </span>
        {toLocation && (
          <span className="text-xs text-gray-500">{toLocation.location_name}</span>
        )}
      </div>
    </div>
  );
};

export default WarehouseTransferDirection;
