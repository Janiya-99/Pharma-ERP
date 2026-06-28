import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../../api/financeApi";
import { useAuth } from "../../../../auth/AuthContext";
import BankAccountBadge from "../../../../components/finance/BankAccountBadge";
import MoneyDisplay from "../../../../components/finance/MoneyDisplay";
import { MdEdit, MdDelete, MdArrowBack } from "react-icons/md";
import { toast } from "react-hot-toast";

export default function BankAccountDetailsPage() {
  const { id } = useParams();
  const history = useHistory();
  const { hasPermission } = useAuth();

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    totalChequeBooks: 0,
    availableChequeLeaves: 0,
    usedChequeLeaves: 0,
    cancelledChequeLeaves: 0,
    unreconciledTransactions: 0,
  });

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await financeApi.getBankAccountById(id);
      if (res.data?.success) {
        setAccount(res.data.data);
      }

      // Fetch summary stats
      const [cbRes, urRes] = await Promise.all([
        financeApi.getChequeBooks({ bank_account_id: id, limit: 1000 }),
        financeApi.getUnreconciledTransactions(id, { limit: 1000 }),
      ]);

      let totalCB = 0;
      let avail = 0;
      let used = 0;
      let cancelled = 0;

      if (cbRes.data?.success) {
        const books = cbRes.data.data || [];
        totalCB = books.length;
        books.forEach((b: unknown) => {
          avail += b.available_leaves || 0;
          used += b.used_leaves || 0;
          cancelled += b.cancelled_leaves || 0;
        });
      }

      let unreconciled = 0;
      if (urRes.data?.success) {
        unreconciled = (urRes.data.data || []).length;
      }

      setSummary({
        totalChequeBooks: totalCB,
        availableChequeLeaves: avail,
        usedChequeLeaves: used,
        cancelledChequeLeaves: cancelled,
        unreconciledTransactions: unreconciled,
      });
    } catch (error) {
      toast.error("Failed to load bank account details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this bank account?")) {
      try {
        await financeApi.deleteBankAccount(id);
        toast.success("Bank account deleted successfully");
        history.push("/admin/finance/bank-accounts");
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
  if (!account)
    return (
      <div className="p-8 text-center text-red-500">
        Bank account not found.
      </div>
    );

  return (
    <div className="mx-auto h-full max-w-6xl overflow-y-auto py-4">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <button
            onClick={() => history.push("/admin/finance/bank-accounts")}
            className="mb-2 flex items-center text-sm text-gray-500 hover:text-brand-500"
          >
            <MdArrowBack className="mr-1" /> Back to Bank Accounts
          </button>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-navy-700 dark:text-white">
            {account.bank_name} - {account.account_number}
            {account.is_default && (
              <BankAccountBadge isDefault={account.is_default} />
            )}
          </h1>
          <p className="text-gray-500">
            {account.account_name} | {account.bank_branch_name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasPermission("finance.bank_account.update") && (
            <button
              onClick={() =>
                history.push(`/admin/finance/bank-accounts/${account.id}/edit`)
              }
              className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <MdEdit /> Edit
            </button>
          )}
          {hasPermission("finance.bank_account.delete") && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-md border border-red-100 bg-red-50 px-4 py-2 text-red-600 shadow-sm hover:bg-red-100"
            >
              <MdDelete /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Cheque Books
          </p>
          <p className="mt-1 text-2xl font-bold text-navy-700 dark:text-white">
            {summary.totalChequeBooks}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Available Leaves
          </p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {summary.availableChequeLeaves}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Used Leaves
          </p>
          <p className="mt-1 text-2xl font-bold text-blue-600">
            {summary.usedChequeLeaves}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Cancelled Leaves
          </p>
          <p className="mt-1 text-2xl font-bold text-red-600">
            {summary.cancelledChequeLeaves}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Unreconciled Trans.
          </p>
          <p className="mt-1 text-2xl font-bold text-orange-600">
            {summary.unreconciledTransactions}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
        <h3 className="mb-4 border-b pb-2 text-lg font-bold text-navy-700 dark:border-navy-700 dark:text-white">
          Account Information
        </h3>
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">Bank Name</p>
            <p className="font-medium text-navy-900 dark:text-white">
              {account.bank_name}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Bank Branch Name</p>
            <p className="font-medium text-navy-900 dark:text-white">
              {account.bank_branch_name || "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Chart Account</p>
            <p className="font-medium text-navy-900 dark:text-white">
              {account.chart_of_account?.account_code} -{" "}
              {account.chart_of_account?.account_name}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Account Name</p>
            <p className="font-medium text-navy-900 dark:text-white">
              {account.account_name}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Account Number</p>
            <p className="font-medium text-navy-900 dark:text-white">
              {account.account_number}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">SWIFT Code</p>
            <p className="font-medium text-navy-900 dark:text-white">
              {account.swift_code || "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Bank Code</p>
            <p className="font-medium text-navy-900 dark:text-white">
              {account.bank_code || "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Branch Code</p>
            <p className="font-medium text-navy-900 dark:text-white">
              {account.branch_code || "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                account.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {account.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Opening Balance</p>
            <p className="font-medium text-navy-900 dark:text-white">
              <MoneyDisplay amount={account.opening_balance} />
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Balance</p>
            <p className="text-lg font-medium text-brand-600">
              <MoneyDisplay amount={account.current_balance} />
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created Information</p>
            <p className="text-sm font-medium text-navy-900 dark:text-white">
              By {account.creator?.first_name} {account.creator?.last_name} on{" "}
              {new Date(account.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
