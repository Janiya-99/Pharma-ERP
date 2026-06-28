import React from "react";

const StockQuantityDisplay = ({
  quantity,
  unit = "",
}: {
  quantity?: unknown;
  unit?: unknown;
}) => {
  if (quantity === undefined || quantity === null)
    return <span className="text-gray-400">-</span>;

  const formattedQuantity = Number(quantity).toLocaleString("en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

  return (
    <div className="whitespace-nowrap text-right tabular-nums">
      <span className="font-medium text-navy-700 dark:text-white">
        {formattedQuantity}
      </span>
      {unit && <span className="ml-1 text-xs text-gray-500">{unit}</span>}
    </div>
  );
};

export default StockQuantityDisplay;
