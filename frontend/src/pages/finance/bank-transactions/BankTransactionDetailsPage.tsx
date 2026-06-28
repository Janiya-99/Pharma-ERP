import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../../api/financeApi";
import { useAuth } from "../../../../auth/AuthContext";
import BankTransactionTypeBadge from "../../../../components/finance/BankTransactionTypeBadge";
import MoneyDisplay from "../../../../components/finance/MoneyDisplay";
import { MdEdit, MdDelete, MdArrowBack } from "react-icons/md";
import { toast } from "react-hot-toast";

export default function BankTransactionDetailsPage() {
  const { id } = useParams();
  const history = useHistory();
  const { hasPermission } = useAuth();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await financeApi.getBankTransactionById(id);
      if (res.data?.success) {
        setTransaction(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load transaction details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleDelete = async () => {
    if (transaction.is_reconciled) {
      alert("Cannot delete a reconciled transaction.");
      return;
    }
    if (transaction.source_module !== "manual") {
      alert("Cannot delete a system-generated transaction directly.");
      return;
    }
    if (
      window.confirm("Are you sure you want to delete this manual transaction?")
    ) {
      try {
        await financeApi.deleteBankTransaction(id);
        toast.success("Transaction deleted successfully");
        history.push("/admin/finance/bank-transactions");
      } catch (err) {
        alert(
          "Failed to delete: " + (err.response?.data?.message || err.message)
        );
      }
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading details...</div>
    );
  if (!transaction)
    return (
      <div className="p-8 text-center text-red-500">Transaction not found.</div>
    );

  const isManual = transaction.source_module === "manual";

  return (
    <div className="mx-auto h-full max-w-4xl overflow-y-auto py-4">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <button
            onClick={() => history.push("/admin/finance/bank-transactions")}
            className="mb-2 flex items-center text-sm text-gray-500 hover:text-brand-500"
          >
            <MdArrowBack className="mr-1" /> Back to Transactions
          </button>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-navy-700 dark:text-white">
            Transaction: {transaction.transaction_reference}
          </h1>
          <p className="text-gray-500">
            {transaction.bank_account?.bank_name} -{" "}
            {transaction.bank_account?.account_number}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasPermission("finance.bank_transaction.update") &&
            isManual &&
            !transaction.is_reconciled && (
              <button
                onClick={() =>
                  history.push(
                    `/admin/finance/bank-transactions/${transaction.id}/edit`
                  )
                }
                className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <MdEdit /> Edit
              </button>
            )}
          {hasPermission("finance.bank_transaction.delete") &&
            isManual &&
            !transaction.is_reconciled && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-md border border-red-100 bg-red-50 px-4 py-2 text-red-600 shadow-sm hover:bg-red-100"
              >
                <MdDelete /> Delete
              </button>
            )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
        <h3 className="mb-4 border-b pb-2 text-lg font-bold text-navy-700 dark:border-navy-700 dark:text-white">
          Transaction Details
        </h3>

        <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">Type</p>
            <div className="mt-1">
              <BankTransactionTypeBadge type={transaction.transaction_type} />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                transaction.is_reconciled
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {transaction.is_reconciled ? "Reconciled" : "Pending"}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Source</p>
            <p className="mt-1 font-medium capitalize text-navy-900 dark:text-white">
              {transaction.source_module}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Transaction Date</p>
            <p className="font-medium text-navy-900 dark:text-white">
              {new Date(transaction.transaction_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Value Date</p>
            <p className="font-medium text-navy-900 dark:text-white">
              {transaction.value_date
                ? new Date(transaction.value_date).toLocaleDateString()
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Reference Number</p>
            <p className="font-medium text-navy-900 dark:text-white">
              {transaction.reference_number || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Debit (In)</p>
            <p className="text-lg font-medium text-green-600">
              <MoneyDisplay amount={transaction.debit_amount} />
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Credit (Out)</p>
            <p className="text-lg font-medium text-red-600">
              <MoneyDisplay amount={transaction.credit_amount} />
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created Information</p>
            <p className="text-sm font-medium text-navy-900 dark:text-white">
              By {transaction.creator?.first_name}{" "}
              {transaction.creator?.last_name}
              <br />
              {new Date(transaction.created_at).toLocaleString()}
            </p>
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <p className="text-sm text-gray-500">Description</p>
            <p className="font-medium text-navy-900 dark:text-white">
              {transaction.description || "-"}
            </p>
          </div>
        </div>

        {transaction.source_module !== "manual" && (
          <div className="mt-8 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-navy-700 dark:bg-navy-900">
            <h4 className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">
              System Generated Context
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This transaction was automatically generated from the{" "}
              <strong>{transaction.source_module}</strong> module. Any
              modifications or deletions must be performed at the source level.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
