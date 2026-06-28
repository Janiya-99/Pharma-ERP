import React from "react";

const VarianceQuantityBadge = ({ variance }: { variance?: unknown }) => {
  const value = parseFloat(variance || 0);

  if (value > 0) {
    return (
      <span className="rounded-md border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
        +{value.toFixed(3)}
      </span>
    );
  }

  if (value < 0) {
    return (
      <span className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        {value.toFixed(3)}
      </span>
    );
  }

  return (
    <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
      0.000
    </span>
  );
};

export default VarianceQuantityBadge;
