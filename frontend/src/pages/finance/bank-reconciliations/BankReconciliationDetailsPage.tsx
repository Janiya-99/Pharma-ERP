import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../../api/financeApi";
import { useAuth } from "../../../../auth/AuthContext";
import ReconciliationStatusBadge from "../../../../components/finance/ReconciliationStatusBadge";
import ReconciliationDifferenceBadge from "../../../../components/finance/ReconciliationDifferenceBadge";
import BankTransactionTypeBadge from "../../../../components/finance/BankTransactionTypeBadge";
import MoneyDisplay from "../../../../components/finance/MoneyDisplay";
import CompleteReconciliationModal from "./CompleteReconciliationModal";
import CancelReconciliationModal from "./CancelReconciliationModal";
import { MdEdit, MdDelete, MdArrowBack } from "react-icons/md";
import { toast } from "react-hot-toast";

export default function BankReconciliationDetailsPage() {
  const { id } = useParams();
  const history = useHistory();
  const { hasPermission } = useAuth();

  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [modals, setModals] = useState({ complete: false, cancel: false });

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await financeApi.getBankReconciliationById(id);
      if (res.data?.success) {
        setRec(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load reconciliation details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleDelete = async () => {
    if (rec.status !== "draft") {
      alert("Only draft reconciliations can be deleted.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this draft?")) {
      try {
        await financeApi.deleteBankReconciliation(id);
        toast.success("Reconciliation draft deleted");
        history.push("/admin/finance/bank-reconciliations");
      } catch (err) {
        alert(
          "Failed to delete: " + (err.response?.data?.message || err.message)
        );
      }
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await financeApi.completeBankReconciliation(id);
      toast.success("Reconciliation completed successfully");
      setModals({ ...modals, complete: false });
      fetchDetails();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to complete reconciliation"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRec = async (remarks: unknown) => {
    setActionLoading(true);
    try {
      await financeApi.cancelBankReconciliation(id, { remarks });
      toast.success("Reconciliation cancelled successfully");
      setModals({ ...modals, cancel: false });
      fetchDetails();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to cancel reconciliation"
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading details...</div>
    );
  if (!rec)
    return (
      <div className="p-8 text-center text-red-500">
        Reconciliation not found.
      </div>
    );

  const diff = Math.abs(
    (rec.statement_closing_balance || 0) - (rec.system_closing_balance || 0)
  );
  const isBalanced = diff < 0.01;

  return (
    <div className="mx-auto h-full max-w-6xl overflow-y-auto py-4">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <button
            onClick={() => history.push("/admin/finance/bank-reconciliations")}
            className="mb-2 flex items-center text-sm text-gray-500 hover:text-brand-500"
          >
            <MdArrowBack className="mr-1" /> Back to Reconciliations
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
              {rec.reference_number || `Reconciliation #${rec.id}`}
            </h1>
            <ReconciliationStatusBadge status={rec.status} />
            <ReconciliationDifferenceBadge amount={diff} />
          </div>
          <p className="mt-1 text-gray-500">
            {rec.bank_account?.bank_name} - {rec.bank_account?.account_number}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {rec.status === "draft" && (
            <>
              {hasPermission("finance.bank_reconciliation.update") && (
                <button
                  onClick={() =>
                    history.push(
                      `/admin/finance/bank-reconciliations/${rec.id}/edit`
                    )
                  }
                  className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  <MdEdit /> Edit Draft
                </button>
              )}
              {hasPermission("finance.bank_reconciliation.complete") && (
                <button
                  onClick={() => {
                    if (!isBalanced) {
                      toast.error("Cannot complete: Difference is not zero.");
                      return;
                    }
                    setModals({ ...modals, complete: true });
                  }}
                  className="flex items-center gap-2 rounded-md border border-green-700 bg-green-600 px-4 py-2 text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
                >
                  Complete Reconciliation
                </button>
              )}
              {hasPermission("finance.bank_reconciliation.delete") && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 rounded-md border border-red-100 bg-red-50 px-4 py-2 text-red-600 shadow-sm hover:bg-red-100"
                >
                  <MdDelete /> Delete Draft
                </button>
              )}
            </>
          )}

          {rec.status === "completed" &&
            hasPermission("finance.bank_reconciliation.cancel") && (
              <button
                onClick={() => setModals({ ...modals, cancel: true })}
                className="flex items-center gap-2 rounded-md border border-red-100 bg-red-50 px-4 py-2 text-red-600 shadow-sm hover:bg-red-100"
              >
                Cancel Reconciliation
              </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <h3 className="mb-4 border-b pb-2 text-lg font-bold text-navy-700 dark:border-navy-700 dark:text-white">
              Reconciliation Details
            </h3>
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Statement Period</p>
                <p className="font-medium text-navy-900 dark:text-white">
                  {new Date(rec.statement_start_date).toLocaleDateString()} to{" "}
                  {new Date(rec.statement_end_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statement Date</p>
                <p className="font-medium text-navy-900 dark:text-white">
                  {new Date(rec.statement_date).toLocaleDateString()}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Remarks</p>
                <p className="font-medium text-navy-900 dark:text-white">
                  {rec.remarks || "-"}
                </p>
              </div>

              {rec.status === "cancelled" && (
                <div className="rounded-md border border-red-100 bg-red-50 p-3 md:col-span-2">
                  <p className="text-sm font-medium text-red-800">
                    Cancellation Remarks
                  </p>
                  <p className="mt-1 text-sm text-red-600">
                    {rec.cancellation_remarks}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <h3 className="mb-4 border-b pb-2 text-lg font-bold text-navy-700 dark:border-navy-700 dark:text-white">
              Matched Transactions ({rec.lines?.length || 0})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500 dark:border-navy-700 dark:bg-navy-700/50 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-right">Debit (In)</th>
                    <th className="px-4 py-3 text-right">Credit (Out)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
                  {!rec.lines || rec.lines.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No transactions matched.
                      </td>
                    </tr>
                  ) : (
                    rec.lines.map((line: unknown) => {
                      const tx = line.bank_transaction;
                      return (
                        <tr
                          key={line.id}
                          className="hover:bg-gray-50 dark:hover:bg-navy-700/30"
                        >
                          <td className="px-4 py-3">
                            {new Date(tx.transaction_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 font-medium text-navy-700 dark:text-white">
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
                            <BankTransactionTypeBadge
                              type={tx.transaction_type}
                            />
                          </td>
                          <td className="px-4 py-3 text-right text-green-600">
                            <MoneyDisplay amount={tx.debit_amount} />
                          </td>
                          <td className="px-4 py-3 text-right text-red-600">
                            <MoneyDisplay amount={tx.credit_amount} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-navy-700 dark:bg-navy-900">
            <h3 className="mb-4 border-b pb-2 text-lg font-bold text-navy-700 dark:border-navy-700 dark:text-white">
              Summary
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Statement Closing
                </span>
                <span className="font-medium text-navy-900 dark:text-white">
                  <MoneyDisplay amount={rec.statement_closing_balance} />
                </span>
              </div>

              <div className="border-t border-dashed border-gray-300 pt-3 dark:border-navy-700"></div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  System Opening
                </span>
                <span className="font-medium text-navy-900 dark:text-white">
                  <MoneyDisplay amount={rec.statement_opening_balance} />
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  + Cleared Debits
                </span>
                <span className="font-medium text-green-600">
                  <MoneyDisplay amount={rec.total_cleared_debits} />
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  - Cleared Credits
                </span>
                <span className="font-medium text-red-600">
                  <MoneyDisplay amount={rec.total_cleared_credits} />
                </span>
              </div>

              <div className="border-t border-gray-300 pt-3 dark:border-navy-700"></div>

              <div className="flex items-center justify-between font-bold">
                <span className="text-navy-700 dark:text-white">
                  System Balance
                </span>
                <span className="text-navy-900 dark:text-white">
                  <MoneyDisplay amount={rec.system_closing_balance} />
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
            </div>
          </div>
        </div>
      </div>

      <CompleteReconciliationModal
        isOpen={modals.complete}
        onClose={() => setModals({ ...modals, complete: false })}
        onComplete={handleComplete}
        isSaving={actionLoading}
      />

      <CancelReconciliationModal
        isOpen={modals.cancel}
        onClose={() => setModals({ ...modals, cancel: false })}
        onCancelRec={handleCancelRec}
        isSaving={actionLoading}
      />
    </div>
  );
}
