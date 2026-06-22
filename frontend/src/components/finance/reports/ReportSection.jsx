import React from 'react';

const ReportSection = ({ title, children, totalLabel, totalAmount }) => {
  return (
    <div className="mb-6 border rounded-lg border-gray-200 dark:border-navy-700 overflow-hidden">
      <div className="bg-gray-50 dark:bg-navy-800 px-4 py-3 border-b border-gray-200 dark:border-navy-700">
        <h3 className="text-lg font-semibold text-navy-800 dark:text-white">{title}</h3>
      </div>
      <div className="p-0">
        {children}
      </div>
      {totalLabel && (
        <div className="bg-gray-50 dark:bg-navy-800 px-4 py-3 flex justify-between items-center border-t border-gray-200 dark:border-navy-700">
          <span className="font-semibold text-navy-800 dark:text-white">{totalLabel}</span>
          <span className="font-bold text-navy-800 dark:text-white">
            {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(totalAmount || 0)}
          </span>
        </div>
      )}
    </div>
  );
};
export default ReportSection;
