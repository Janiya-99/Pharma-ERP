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
    unreconciledTransactions: 0
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
        financeApi.getUnreconciledTransactions(id, { limit: 1000 })
      ]);

      let totalCB = 0;
      let avail = 0;
      let used = 0;
      let cancelled = 0;

      if (cbRes.data?.success) {
        const books = cbRes.data.data || [];
        totalCB = books.length;
        books.forEach(b => {
          avail += (b.available_leaves || 0);
          used += (b.used_leaves || 0);
          cancelled += (b.cancelled_leaves || 0);
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
        unreconciledTransactions: unreconciled
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
        alert("Failed to delete: " + (err.response?.data?.message || err.message));
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;
  if (!account) return <div className="p-8 text-center text-red-500">Bank account not found.</div>;

  return (
    <div className="py-4 max-w-6xl mx-auto h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={() => history.push("/admin/finance/bank-accounts")}
            className="flex items-center text-sm text-gray-500 hover:text-brand-500 mb-2"
          >
            <MdArrowBack className="mr-1" /> Back to Bank Accounts
          </button>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white flex items-center gap-3">
            {account.bank_name} - {account.account_number}
            {account.is_default && <BankAccountBadge isDefault={account.is_default} />}
          </h1>
          <p className="text-gray-500">{account.account_name} | {account.bank_branch_name}</p>
        </div>
        <div className="flex items-center gap-3">
          {hasPermission("finance.bank_account.update") && (
            <button
              onClick={() => history.push(`/admin/finance/bank-accounts/${account.id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 shadow-sm"
            >
              <MdEdit /> Edit
            </button>
          )}
          {hasPermission("finance.bank_account.delete") && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-md hover:bg-red-100 shadow-sm"
            >
              <MdDelete /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-navy-800 dark:border-navy-700">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Cheque Books</p>
          <p className="text-2xl font-bold text-navy-700 dark:text-white mt-1">{summary.totalChequeBooks}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-navy-800 dark:border-navy-700">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Available Leaves</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{summary.availableChequeLeaves}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-navy-800 dark:border-navy-700">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Used Leaves</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{summary.usedChequeLeaves}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-navy-800 dark:border-navy-700">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Cancelled Leaves</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{summary.cancelledChequeLeaves}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-navy-800 dark:border-navy-700">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Unreconciled Trans.</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{summary.unreconciledTransactions}</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
        <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-4 border-b pb-2 dark:border-navy-700">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
          <div>
            <p className="text-sm text-gray-500">Bank Name</p>
            <p className="font-medium text-navy-900 dark:text-white">{account.bank_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Bank Branch Name</p>
            <p className="font-medium text-navy-900 dark:text-white">{account.bank_branch_name || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Chart Account</p>
            <p className="font-medium text-navy-900 dark:text-white">{account.chart_of_account?.account_code} - {account.chart_of_account?.account_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Account Name</p>
            <p className="font-medium text-navy-900 dark:text-white">{account.account_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Account Number</p>
            <p className="font-medium text-navy-900 dark:text-white">{account.account_number}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">SWIFT Code</p>
            <p className="font-medium text-navy-900 dark:text-white">{account.swift_code || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Bank Code</p>
            <p className="font-medium text-navy-900 dark:text-white">{account.bank_code || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Branch Code</p>
            <p className="font-medium text-navy-900 dark:text-white">{account.branch_code || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mt-1 ${account.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
              {account.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Opening Balance</p>
            <p className="font-medium text-navy-900 dark:text-white"><MoneyDisplay amount={account.opening_balance} /></p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Balance</p>
            <p className="font-medium text-brand-600 text-lg"><MoneyDisplay amount={account.current_balance} /></p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created Information</p>
            <p className="font-medium text-navy-900 dark:text-white text-sm">
              By {account.creator?.first_name} {account.creator?.last_name} on {new Date(account.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
