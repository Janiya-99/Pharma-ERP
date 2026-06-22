import React from "react";
import BankTransactionTypeBadge from "../../../../components/finance/BankTransactionTypeBadge";
import MoneyDisplay from "../../../../components/finance/MoneyDisplay";

export default function UnreconciledTransactionsTable({ transactions, selectedTxIds, onToggleSelection, onToggleAll }) {
  const allSelected = transactions.length > 0 && selectedTxIds.length === transactions.length;

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-navy-700/50 text-gray-500 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-navy-700">
            <tr>
              <th className="px-4 py-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                  className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
              </th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3 text-right">Debit (In)</th>
              <th className="px-4 py-3 text-right">Credit (Out)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">No unreconciled transactions available.</td>
              </tr>
            ) : (
              transactions.map(tx => (
                <tr 
                  key={tx.id} 
                  className={`hover:bg-gray-50 dark:hover:bg-navy-700/30 cursor-pointer ${selectedTxIds.includes(tx.id) ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}
                  onClick={() => onToggleSelection(tx.id)}
                >
                  <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedTxIds.includes(tx.id)}
                      onChange={() => onToggleSelection(tx.id)}
                      className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                    />
                  </td>
                  <td className="px-4 py-3">{new Date(tx.transaction_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-medium text-navy-700 dark:text-white">{tx.transaction_reference}</td>
                  <td className="px-4 py-3"><BankTransactionTypeBadge type={tx.transaction_type} /></td>
                  <td className="px-4 py-3 text-right text-green-600"><MoneyDisplay amount={tx.debit_amount} /></td>
                  <td className="px-4 py-3 text-right text-red-600"><MoneyDisplay amount={tx.credit_amount} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
