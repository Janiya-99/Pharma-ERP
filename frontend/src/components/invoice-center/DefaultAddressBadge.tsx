import React from "react";
import { CheckCircle2 } from "lucide-react";

interface DefaultAddressBadgeProps {
  isDefaultBilling?: boolean;
  isDefaultShipping?: boolean;
}

const DefaultAddressBadge: React.FC<DefaultAddressBadgeProps> = ({
  isDefaultBilling,
  isDefaultShipping,
}) => {
  if (!isDefaultBilling && !isDefaultShipping) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {isDefaultBilling && (
        <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
          <CheckCircle2 className="h-3 w-3" />
          Default Billing
        </span>
      )}
      {isDefaultShipping && (
        <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700 dark:border-teal-800 dark:bg-teal-900/30 dark:text-teal-400">
          <CheckCircle2 className="h-3 w-3" />
          Default Shipping
        </span>
      )}
    </div>
  );
};

export default DefaultAddressBadge;
