import React from "react";

interface AddressTypeBadgeProps {
  type?: string;
}

const AddressTypeBadge: React.FC<AddressTypeBadgeProps> = ({ type }) => {
  const colors: Record<string, string> = {
    billing:
      "bg-indigo-50 text-indigo-700 border-indigo-200   ",
    shipping:
      "bg-emerald-50 text-emerald-700 border-emerald-200   ",
    office:
      "bg-purple-50 text-purple-700 border-purple-200   ",
    warehouse:
      "bg-orange-50 text-orange-700 border-orange-200   ",
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
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${style}`}
    >
      {formattedType}
    </span>
  );
};

export default AddressTypeBadge;
