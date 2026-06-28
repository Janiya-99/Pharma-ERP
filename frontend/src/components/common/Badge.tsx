import React from "react";

type BadgeVariant =
  | "default"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "indigo";

const Badge = ({
  variant = "default",
  children,
}: {
  variant?: BadgeVariant;
  children?: React.ReactNode;
}) => {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
    success: "bg-green-50 text-green-700 ring-1 ring-green-200",
    danger: "bg-red-50 text-red-700 ring-1 ring-red-200",
    warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    info: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    indigo: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-semibold capitalize tracking-wide ${
        variants[variant] || variants.default
      }`}
    >
      {children}
    </span>
  );
};

export default Badge;
