import React from "react";

export default function DebitCreditSummary({
  totalDebit,
  totalCredit,
}: {
  totalDebit?: unknown;
  totalCredit?: unknown;
}) {
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

  const formatCurrency = (amount: unknown) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount || 0);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
      <h3 className="mb-4 text-lg font-medium text-navy-800">Summary</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total Debit:</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(totalDebit)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total Credit:</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(totalCredit)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 pt-3">
          <span className="font-medium text-gray-800">Status:</span>
          {isBalanced ? (
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
              Balanced
            </span>
          ) : (
            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800">
              Difference: {formatCurrency(difference)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
