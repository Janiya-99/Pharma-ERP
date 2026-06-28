import React from "react";

const ReportSection = ({
  title,
  children,
  totalLabel,
  totalAmount,
}: {
  title?: unknown;
  children?: React.ReactNode;
  totalLabel?: unknown;
  totalAmount?: unknown;
}) => {
  return (
    <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 dark:border-navy-700">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-navy-700 dark:bg-navy-800">
        <h3 className="text-lg font-semibold text-navy-800 dark:text-white">
          {title}
        </h3>
      </div>
      <div className="p-0">{children}</div>
      {totalLabel && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-navy-700 dark:bg-navy-800">
          <span className="font-semibold text-navy-800 dark:text-white">
            {totalLabel}
          </span>
          <span className="font-bold text-navy-800 dark:text-white">
            {new Intl.NumberFormat("en-LK", {
              style: "currency",
              currency: "LKR",
            }).format(totalAmount || 0)}
          </span>
        </div>
      )}
    </div>
  );
};
export default ReportSection;
