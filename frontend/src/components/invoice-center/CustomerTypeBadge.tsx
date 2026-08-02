import React from "react";

interface CustomerTypeBadgeProps {
  type?: string;
}

const CustomerTypeBadge: React.FC<CustomerTypeBadgeProps> = ({ type }) => {
  const colors: Record<string, string> = {
    pharmacy:
      "bg-indigo-50 text-indigo-700 border-indigo-200   ",
    hospital:
      "bg-purple-50 text-purple-700 border-purple-200   ",
    clinic:
      "bg-emerald-50 text-emerald-700 border-emerald-200   ",
    doctor:
      "bg-teal-50 text-teal-700 border-teal-200   ",
    distributor:
      "bg-orange-50 text-orange-700 border-orange-200   ",
    retailer:
      "bg-sky-50 text-sky-700 border-sky-200   ",
    wholesaler:
      "bg-violet-50 text-violet-700 border-violet-200   ",
    individual:
      "bg-gray-100 text-gray-700 border-gray-300   ",
    other:
      "bg-gray-100 text-gray-700 border-gray-300   ",
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
