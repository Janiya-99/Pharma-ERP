import React from "react";

interface CustomerTypeBadgeProps {
  type?: string;
}

const CustomerTypeBadge: React.FC<CustomerTypeBadgeProps> = ({ type }) => {
  const colors: Record<string, string> = {
    pharmacy:
      "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800",
    hospital:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
    clinic:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    doctor:
      "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800",
    distributor:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
    retailer:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800",
    wholesaler:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800",
    individual:
      "bg-gray-100 text-gray-700 border-gray-300 dark:bg-navy-700 dark:text-gray-300 dark:border-navy-600",
    other:
      "bg-gray-100 text-gray-700 border-gray-300 dark:bg-navy-700 dark:text-gray-300 dark:border-navy-600",
  };

  const formattedType = type
    ? type.charAt(0).toUpperCase() + type.slice(1)
    : "Other";
  const style = type
    ? colors[type.toLowerCase()] || colors.other
    : colors.other;

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {formattedType}
    </span>
  );
};

export default CustomerTypeBadge;
