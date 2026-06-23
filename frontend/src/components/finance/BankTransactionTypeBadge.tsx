import React from "react";

const BankTransactionTypeBadge = ({ type }: { type?: unknown }) => {
  const getBadgeClass = (type: unknown) => {
    switch (type) {
      case "deposit":
      case "transfer_in":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "withdrawal":
      case "transfer_out":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "bank_charge":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "interest_income":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "adjustment":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const formattedType = type ? type.replace(/_/g, " ").replace(/\b\w/g, (l: unknown) => l.toUpperCase()) : "Unknown";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getBadgeClass(type)}`}>
      {formattedType}
    </span>
  );
};

export default BankTransactionTypeBadge;
