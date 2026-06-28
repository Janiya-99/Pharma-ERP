import React from "react";

interface CreditStatusBadgeProps {
  creditLimit?: number | string;
  currentBalance?: number | string;
}

const CreditStatusBadge: React.FC<CreditStatusBadgeProps> = ({ creditLimit = 0, currentBalance = 0 }) => {
  const limitNum = Number(creditLimit) || 0;
  const balanceNum = Number(currentBalance) || 0;

  if (limitNum <= 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-300 dark:bg-navy-700 dark:text-gray-300 dark:border-navy-600">
        No Credit Limit
      </span>
    );
  }

  if (balanceNum > limitNum) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
        Over Limit
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
      OK
    </span>
  );
};

export default CreditStatusBadge;
