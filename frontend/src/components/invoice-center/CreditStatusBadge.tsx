import React from "react";

interface CreditStatusBadgeProps {
  creditLimit?: number | string;
  currentBalance?: number | string;
}

const CreditStatusBadge: React.FC<CreditStatusBadgeProps> = ({
  creditLimit = 0,
  currentBalance = 0,
}) => {
  const limitNum = Number(creditLimit) || 0;
  const balanceNum = Number(currentBalance) || 0;

  if (limitNum <= 0) {
    return (
      <span className="inline-flex items-center rounded-full border border-gray-300 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600 dark:border-navy-600 dark:bg-navy-700 dark:text-gray-300">
        No Credit Limit
      </span>
    );
  }

  if (balanceNum > limitNum) {
    return (
      <span className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800 inline-flex animate-pulse items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
        <span className="bg-rose-600 h-1.5 w-1.5 rounded-full"></span>
        Over Limit
      </span>
    );
  }

  return (
    <span className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
      OK
    </span>
  );
};

export default CreditStatusBadge;
