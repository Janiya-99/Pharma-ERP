import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface BalanceStatusBadgeProps {
  isBalanced?: boolean;
  difference?: number;
}

const BalanceStatusBadge: React.FC<BalanceStatusBadgeProps> = ({ isBalanced, difference }) => {
  if (isBalanced) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/90 shadow-2xs">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Statement Balanced (Assets = Liabilities + Equity)
      </span>
    );
  }

  const diffText = difference !== undefined && Math.abs(difference) >= 0.01 
    ? ` (Difference: LKR ${Math.abs(difference).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
    : '';

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/90 shadow-2xs">
      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
      Imbalance Flagged{diffText}
    </span>
  );
};

export default BalanceStatusBadge;
