import React from "react";
import CreditStatusBadge from "./CreditStatusBadge";

interface CustomerCreditSummaryProps {
  creditLimit?: number | string;
  currentBalance?: number | string;
  creditDays?: number | string;
}

const CustomerCreditSummary: React.FC<CustomerCreditSummaryProps> = ({
  creditLimit = 0,
  currentBalance = 0,
  creditDays = 0,
}) => {
  const limit = Number(creditLimit) || 0;
  const balance = Number(currentBalance) || 0;
  const available = Math.max(0, limit - balance);

  const formatLKR = (num: number) =>
    `LKR ${num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="rounded-2xl border border-navy-700 bg-gradient-to-br from-navy-900 to-navy-800 p-5 text-white shadow-md">
      <div className="mb-4 flex items-center justify-between border-b border-navy-700 pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-navy-200">
          Credit Profile
        </span>
        <CreditStatusBadge creditLimit={limit} currentBalance={balance} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <span className="block text-xs text-navy-300">Credit Limit</span>
          <span className="mt-0.5 block text-base font-bold">
            {formatLKR(limit)}
          </span>
        </div>
        <div>
          <span className="block text-xs text-navy-300">Current Balance</span>
          <span
            className={`mt-0.5 block text-base font-bold ${
              balance > limit && limit > 0 ? "text-rose-400" : "text-amber-300"
            }`}
          >
            {formatLKR(balance)}
          </span>
        </div>
        <div>
          <span className="block text-xs text-navy-300">Available Credit</span>
          <span className="text-emerald-400 mt-0.5 block text-base font-bold">
            {formatLKR(available)}
          </span>
        </div>
        <div>
          <span className="block text-xs text-navy-300">Credit Terms</span>
          <span className="mt-0.5 block text-base font-bold">
            {creditDays || 0} Days
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomerCreditSummary;
