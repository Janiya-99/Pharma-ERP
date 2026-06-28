import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { financeApi } from "../../../../api/financeApi";
import { getBranches } from "../../../../api/controlApi";
import { useAuth } from "../../../../auth/AuthContext";
import FinancePageHeader from "../../../../components/finance/FinancePageHeader";
import BankAccountBadge from "../../../../components/finance/BankAccountBadge";
import MoneyDisplay from "../../../../components/finance/MoneyDisplay";
import { MdEdit, MdDelete, MdVisibility } from "react-icons/md";

export default function BankAccountsPage() {
  const history = useHistory();
  const { hasPermission, activeSoftware } = useAuth();

  const [accounts, setAccounts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    branch_id: "",
    status: "",
    is_default: "",
    search: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const fetchBranches = async () => {
    try {
      const res = await getBranches({ limit: 100 });
      if (res?.success) setBranches(res.data);
    } catch (err) {
      console.error("Failed to load branches", err);
    }
  };

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      };
      const res = await financeApi.getBankAccounts(params);
      if (res.data?.success) {
        setAccounts(res.data.data);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error("Failed to load bank accounts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSoftware?.software_code === "FINANCE") {
      fetchBranches();
    }
  }, [activeSoftware]);

  useEffect(() => {
    if (activeSoftware?.software_code === "FINANCE") {
      fetchAccounts();
    }
  }, [filters, pagination.page, activeSoftware]);

  const handleDelete = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this bank account?")) {
      try {
        await financeApi.deleteBankAccount(id);
        fetchAccounts();
      } catch (err) {
        alert(
          "Failed to delete: " + (err.response?.data?.message || err.message)
        );
      }
    }
  };

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
        title="Bank Accounts"
        subtitle="Manage company bank accounts and chart mapping"
        onAdd={
          hasPermission("finance.bank_account.create")
            ? () => history.push("/admin/finance/bank-accounts/create")
            : undefined
        }
        addLabel="Create Bank Account"
      />

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-navy-700 dark:bg-navy-800">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <select
            value={filters.branch_id}
            onChange={(e: any) =>
              setFilters((prev: unknown) => ({
                ...prev,
                branch_id: e.target.value,
              }))
            }
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-navy-500"
          >
            <option value="">All Branches</option>
            {branches.map((b: unknown) => (
              <option key={b.id} value={b.id}>
                {b.branch_name}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e: any) =>
              setFilters((prev: unknown) => ({
                ...prev,
                status: e.target.value,
              }))
            }
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-navy-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={filters.is_default}
            onChange={(e: any) =>
              setFilters((prev: unknown) => ({
                ...prev,
                is_default: e.target.value,
              }))
            }
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-navy-500"
          >
            <option value="">All (Default Status)</option>
            <option value="true">Default</option>
            <option value="false">Not Default</option>
          </select>
          <input
            type="text"
            placeholder="Search Account or Bank..."
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
                <th className="px-4 py-3">Bank Name</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3">Account Name</th>
                <th className="px-4 py-3">Account Number</th>
                <th className="px-4 py-3">Chart Account</th>
                <th className="px-4 py-3 text-right">Current Balance</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No bank accounts found.
                  </td>
                </tr>
              ) : (
                accounts.map((account: unknown) => (
                  <tr
                    key={account.id}
                    className="hover:bg-gray-50 dark:hover:bg-navy-700/30"
                  >
                    <td className="px-4 py-3 font-medium text-navy-700">
                      {account.bank_name}
                    </td>
                    <td className="px-4 py-3">{account.bank_branch_name}</td>
                    <td className="px-4 py-3">{account.account_name}</td>
                    <td className="px-4 py-3">{account.account_number}</td>
                    <td className="px-4 py-3">
                      {account.chart_of_account?.account_code} -{" "}
                      {account.chart_of_account?.account_name}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      <MoneyDisplay amount={account.current_balance} />
                    </td>
                    <td className="space-y-1 px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          account.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {account.status}
                      </span>
                      {account.is_default && (
                        <BankAccountBadge isDefault={account.is_default} />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {hasPermission("finance.bank_account.view") && (
                          <button
                            onClick={() =>
                              history.push(
                                `/admin/finance/bank-accounts/${account.id}`
                              )
                            }
                            className="text-gray-500 hover:text-navy-700"
                          >
                            <MdVisibility className="h-5 w-5" />
                          </button>
                        )}
                        {hasPermission("finance.bank_account.update") && (
                          <button
                            onClick={() =>
                              history.push(
                                `/admin/finance/bank-accounts/${account.id}/edit`
                              )
                            }
                            className="text-brand-500 hover:text-brand-700"
                          >
                            <MdEdit className="h-5 w-5" />
                          </button>
                        )}
                        {hasPermission("finance.bank_account.delete") && (
                          <button
                            onClick={() => handleDelete(account.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdDelete className="h-5 w-5" />
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
              disabled={accounts.length < pagination.limit}
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
