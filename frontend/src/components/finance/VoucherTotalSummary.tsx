import React from "react";

export default function VoucherTotalSummary({
  totalAmount,
}: {
  totalAmount?: unknown;
}) {
  return (
    <div className="rounded-md border bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <span className="text-lg font-medium text-gray-700">Total Amount</span>
        <span className="text-xl font-bold text-gray-900">
          {new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
          }).format(totalAmount || 0)}
        </span>
      </div>
    </div>
  );
}
