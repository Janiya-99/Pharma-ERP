import React from "react";
export default function GeneralLedgerPage() {
  return (
    <div className="py-4">
      <h1 className="text-xl font-bold text-navy-700">General Ledger</h1>
      <p className="mt-1 text-sm text-gray-400">
        Filter by account and date range to view running balances.
      </p>
      <div className="mt-6 rounded-xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400 shadow-sm">
        Select an account and date range to view the general ledger.
      </div>
    </div>
  );
}
