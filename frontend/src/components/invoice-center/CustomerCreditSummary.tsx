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
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white/95 via-slate-50/90 to-blue-50/20 backdrop-blur-xl p-6 shadow-xs">
      <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Customer Credit Profile & Terms
          </span>
        </div>
        <CreditStatusBadge creditLimit={limit} currentBalance={balance} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-white/80 p-3.5 backdrop-blur-xs shadow-xs">
          <span className="block text-xs font-semibold text-slate-500">Credit Limit</span>
          <span className="mt-1 block text-base sm:text-lg font-extrabold text-slate-900">
            {formatLKR(limit)}
          </span>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white/80 p-3.5 backdrop-blur-xs shadow-xs">
          <span className="block text-xs font-semibold text-slate-500">Current Balance</span>
          <span
            className={`mt-1 block text-base sm:text-lg font-extrabold ${
              balance > limit && limit > 0 ? "text-rose-600" : "text-amber-600"
            }`}
          >
            {formatLKR(balance)}
          </span>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white/80 p-3.5 backdrop-blur-xs shadow-xs">
          <span className="block text-xs font-semibold text-slate-500">Available Credit</span>
          <span className="mt-1 block text-base sm:text-lg font-extrabold text-emerald-600">
            {formatLKR(available)}
          </span>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white/80 p-3.5 backdrop-blur-xs shadow-xs">
          <span className="block text-xs font-semibold text-slate-500">Credit Terms</span>
          <span className="mt-1 block text-base sm:text-lg font-extrabold text-slate-900">
            {creditDays || 0} Days
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomerCreditSummary;
