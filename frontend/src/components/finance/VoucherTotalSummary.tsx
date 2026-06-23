import React from "react";

export default function VoucherTotalSummary({ totalAmount }: { totalAmount?: unknown }) {
  return (
    <div className="bg-gray-50 border rounded-md p-4">
      <div className="flex justify-between items-center">
        <span className="text-gray-700 font-medium text-lg">Total Amount</span>
        <span className="text-xl font-bold text-gray-900">
          {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(totalAmount || 0)}
        </span>
      </div>
    </div>
  );
}
