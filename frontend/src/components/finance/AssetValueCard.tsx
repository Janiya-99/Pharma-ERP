import React from "react";

const AssetValueCard = ({
  title,
  amount,
  className = "",
}: {
  title?: unknown;
  amount?: unknown;
  className?: unknown;
}) => {
  return (
    <div
      className={`rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-navy-600 dark:bg-navy-800 ${className}`}
    >
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </p>
      <p className="mt-2 text-xl font-bold text-navy-700 dark:text-white">
        <span className="mr-1 text-sm font-normal text-gray-400">LKR</span>
        {Number(amount || 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
    </div>
  );
};

export default AssetValueCard;
