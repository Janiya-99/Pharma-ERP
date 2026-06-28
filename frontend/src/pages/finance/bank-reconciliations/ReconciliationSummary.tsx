import React from "react";
import MoneyDisplay from "../../../../components/finance/MoneyDisplay";

export default function ReconciliationSummary({
  statementClosingBalance,
  systemOpeningBalance,
  totalClearedDebits,
  totalClearedCredits,
}: {
  statementClosingBalance?: unknown;
  systemOpeningBalance?: unknown;
  totalClearedDebits?: unknown;
  totalClearedCredits?: unknown;
}) {
  const systemClosingBalance =
    (systemOpeningBalance || 0) +
    (totalClearedDebits || 0) -
    (totalClearedCredits || 0);
  const diff = Math.abs((statementClosingBalance || 0) - systemClosingBalance);
  const isBalanced = diff < 0.01;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-navy-700 dark:bg-navy-900">
      <h3 className="mb-4 border-b pb-2 text-lg font-bold text-navy-700 dark:border-navy-700 dark:text-white">
        Reconciliation Summary
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Statement Closing Balance
          </span>
          <span className="font-medium text-navy-900 dark:text-white">
            <MoneyDisplay amount={statementClosingBalance || 0} />
          </span>
        </div>

        <div className="border-t border-dashed border-gray-300 pt-3 dark:border-navy-700"></div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            System Opening Balance
          </span>
          <span className="font-medium text-navy-900 dark:text-white">
            <MoneyDisplay amount={systemOpeningBalance || 0} />
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            + Cleared Debits (In)
          </span>
          <span className="font-medium text-green-600">
            <MoneyDisplay amount={totalClearedDebits || 0} />
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            - Cleared Credits (Out)
          </span>
          <span className="font-medium text-red-600">
            <MoneyDisplay amount={totalClearedCredits || 0} />
          </span>
        </div>

        <div className="border-t border-gray-300 pt-3 dark:border-navy-700"></div>

        <div className="flex items-center justify-between font-bold">
          <span className="text-navy-700 dark:text-white">
            Calculated System Balance
          </span>
          <span className="text-navy-900 dark:text-white">
            <MoneyDisplay amount={systemClosingBalance} />
          </span>
        </div>

        <div
          className={`mt-4 flex items-center justify-between rounded-lg p-3 ${
            isBalanced
              ? "bg-green-100 dark:bg-green-900/30"
              : "bg-red-100 dark:bg-red-900/30"
          }`}
        >
          <span
            className={`font-bold ${
              isBalanced
                ? "text-green-800 dark:text-green-300"
                : "text-red-800 dark:text-red-300"
            }`}
          >
            Difference
          </span>
          <span
            className={`text-lg font-bold ${
              isBalanced
                ? "text-green-800 dark:text-green-300"
                : "text-red-800 dark:text-red-300"
            }`}
          >
            <MoneyDisplay amount={diff} />
          </span>
        </div>

        {isBalanced && (
          <p className="mt-2 text-center text-xs font-medium text-green-600">
            Perfectly balanced! Ready to complete.
          </p>
        )}
      </div>
    </div>
  );
}
