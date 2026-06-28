import React from "react";
import CreditStatusBadge from "./CreditStatusBadge";

interface CustomerCreditSummaryProps {
  creditLimit?: number | string;
  currentBalance?: number | string;
  creditDays?: number | string;
}

const CustomerCreditSummary: React.FC<CustomerCreditSummaryProps> = ({ creditLimit = 0, currentBalance = 0, creditDays = 0 }) => {
  const limit = Number(creditLimit) || 0;
  const balance = Number(currentBalance) || 0;
  const available = Math.max(0, limit - balance);

  const formatLKR = (num: number) => `LKR ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white p-5 rounded-2xl shadow-md border border-navy-700">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-navy-700">
        <span className="text-xs uppercase font-bold text-navy-200 tracking-wider">Credit Profile</span>
        <CreditStatusBadge creditLimit={limit} currentBalance={balance} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <span className="block text-xs text-navy-300">Credit Limit</span>
          <span className="text-base font-bold mt-0.5 block">{formatLKR(limit)}</span>
        </div>
        <div>
          <span className="block text-xs text-navy-300">Current Balance</span>
          <span className={`text-base font-bold mt-0.5 block ${balance > limit && limit > 0 ? "text-rose-400" : "text-amber-300"}`}>
            {formatLKR(balance)}
          </span>
        </div>
        <div>
          <span className="block text-xs text-navy-300">Available Credit</span>
          <span className="text-base font-bold mt-0.5 block text-emerald-400">{formatLKR(available)}</span>
        </div>
        <div>
          <span className="block text-xs text-navy-300">Credit Terms</span>
          <span className="text-base font-bold mt-0.5 block">{creditDays || 0} Days</span>
        </div>
      </div>
    </div>
  );
};

export default CustomerCreditSummary;
