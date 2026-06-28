import React from "react";

interface AddressTypeBadgeProps {
  type?: string;
}

const AddressTypeBadge: React.FC<AddressTypeBadgeProps> = ({ type }) => {
  const colors: Record<string, string> = {
    billing: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    shipping: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    office: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
    warehouse: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
    other: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-navy-700 dark:text-gray-300 dark:border-navy-600",
  };

  const formattedType = type ? type.charAt(0).toUpperCase() + type.slice(1) : "Other";
  const style = type ? colors[type.toLowerCase()] || colors.other : colors.other;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${style}`}>
      {formattedType}
    </span>
  );
};

export default AddressTypeBadge;
