import React from "react";
import { CheckCircle2 } from "lucide-react";

interface DefaultAddressBadgeProps {
  isDefaultBilling?: boolean;
  isDefaultShipping?: boolean;
}

const DefaultAddressBadge: React.FC<DefaultAddressBadgeProps> = ({ isDefaultBilling, isDefaultShipping }) => {
  if (!isDefaultBilling && !isDefaultShipping) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {isDefaultBilling && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800">
          <CheckCircle2 className="w-3 h-3" />
          Default Billing
        </span>
      )}
      {isDefaultShipping && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800">
          <CheckCircle2 className="w-3 h-3" />
          Default Shipping
        </span>
      )}
    </div>
  );
};

export default DefaultAddressBadge;
