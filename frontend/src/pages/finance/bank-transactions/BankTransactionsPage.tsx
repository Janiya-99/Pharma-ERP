import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { financeApi } from "../../../../api/financeApi";
import { useAuth } from "../../../../auth/AuthContext";
import FinancePageHeader from "../../../../components/finance/FinancePageHeader";
import BankAccountSelect from "../../../../components/finance/BankAccountSelect";
import BankTransactionTypeBadge from "../../../../components/finance/BankTransactionTypeBadge";
import BankTransactionAmountDisplay from "../../../../components/finance/BankTransactionAmountDisplay";
import { MdVisibility } from "react-icons/md";

export default function BankTransactionsPage() {
  const history = useHistory();
  const { hasPermission, activeSoftware } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    bank_account_id: "",
    transaction_type: "",
    from_date: "",
    to_date: "",
    search: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      };
      const res = await financeApi.getBankTransactions(params);
      if (res.data?.success) {
        setTransactions(res.data.data);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error("Failed to load bank transactions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSoftware?.software_code === "FINANCE") {
      fetchTransactions();
    }
  }, [filters, pagination.page, activeSoftware]);

  if (activeSoftware?.software_code !== "FINANCE") {
    return (
      <div className="p-8 text-center font-medium text-red-500">
        Please switch to Finance module to access this page.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 py-4">
      <FinancePageHeader
        title="Bank Transactions"
        subtitle="View and manage bank transactions"
        onAdd={
          hasPermission("finance.bank_transaction.create")
            ? () => history.push("/admin/finance/bank-transactions/create")
            : undefined
        }
        addLabel="Manual Transaction"
      />

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-navy-700 dark:bg-navy-800">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <BankAccountSelect
            value={filters.bank_account_id}
            onChange={(val: unknown) =>
              setFilters((prev: unknown) => ({ ...prev, bank_account_id: val }))
            }
            placeholder="All Bank Accounts"
          />
          <select
            value={filters.transaction_type}
            onChange={(e: any) =>
              setFilters((prev: unknown) => ({
                ...prev,
                transaction_type: e.target.value,
              }))
            }
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-navy-500"
          >
            <option value="">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="bank_charge">Bank Charge</option>
            <option value="interest_income">Interest Income</option>
            <option value="transfer_in">Transfer In</option>
            <option value="transfer_out">Transfer Out</option>
            <option value="adjustment">Adjustment</option>
          </select>
          <input
            type="date"
            value={filters.from_date}
            onChange={(e: any) =>
              setFilters((prev: unknown) => ({
                ...prev,
                from_date: e.target.value,
              }))
            }
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-navy-500"
            title="From Date"
          />
          <input
            type="date"
            value={filters.to_date}
            onChange={(e: any) =>
              setFilters((prev: unknown) => ({
                ...prev,
                to_date: e.target.value,
              }))
            }
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-navy-500"
            title="To Date"
          />
          <input
            type="text"
            placeholder="Search Reference or Description..."
            value={filters.search}
            onChange={(e: any) =>
              setFilters((prev: unknown) => ({
                ...prev,
                search: e.target.value,
              }))
            }
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-navy-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500 dark:border-navy-700 dark:bg-navy-700/50 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Bank Account</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Debit</th>
                <th className="px-4 py-3 text-right">Credit</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
              {loading ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((tx: unknown) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-gray-50 dark:hover:bg-navy-700/30"
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      {new Date(tx.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-navy-700">
                      <button
                        onClick={() =>
                          history.push(
                            `/admin/finance/bank-transactions/${tx.id}`
                          )
                        }
                        className="text-brand-500 hover:underline"
                      >
                        {tx.transaction_reference}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {tx.bank_account?.bank_name} -{" "}
                      {tx.bank_account?.account_number}
                    </td>
                    <td className="px-4 py-3">
                      <BankTransactionTypeBadge type={tx.transaction_type} />
                    </td>
                    <td
                      className="max-w-[200px] truncate px-4 py-3"
                      title={tx.description}
                    >
                      {tx.description}
                    </td>
                    <td className="px-4 py-3">
                      <BankTransactionAmountDisplay
                        debitAmount={tx.debit_amount}
                        creditAmount={0}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <BankTransactionAmountDisplay
                        debitAmount={0}
                        creditAmount={tx.credit_amount}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          tx.is_reconciled
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {tx.is_reconciled ? "Reconciled" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {hasPermission("finance.bank_transaction.view") && (
                          <button
                            onClick={() =>
                              history.push(
                                `/admin/finance/bank-transactions/${tx.id}`
                              )
                            }
                            className="text-gray-500 hover:text-navy-700"
                          >
                            <MdVisibility className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 dark:border-navy-700">
          <span className="text-gray-500">
            Total Records: {pagination.total}
          </span>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() =>
                setPagination((prev: unknown) => ({
                  ...prev,
                  page: prev.page - 1,
                }))
              }
              className="rounded border px-3 py-1 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">Page {pagination.page}</span>
            <button
              disabled={transactions.length < pagination.limit}
              onClick={() =>
                setPagination((prev: unknown) => ({
                  ...prev,
                  page: prev.page + 1,
                }))
              }
              className="rounded border px-3 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
