import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { financeApi } from "../../../../api/financeApi";
import { getBranches, getUsers } from "../../../../api/controlApi";
import { useAuth } from "../../../../auth/AuthContext";
import FinancePageHeader from "../../../../components/finance/FinancePageHeader";
import MoneyDisplay from "../../../../components/finance/MoneyDisplay";
import { MdEdit, MdDelete, MdVisibility } from "react-icons/md";

export default function PettyCashFundsPage() {
  const history = useHistory();
  const { hasPermission, activeSoftware } = useAuth();
  
  const [funds, setFunds] = useState([]);
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    branch_id: "",
    custodian_user_id: "",
    status: "",
    search: ""
  });

  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchDependencies = async () => {
    try {
      const [branchesRes, usersRes] = await Promise.all([
        getBranches({ limit: 100 }),
        getUsers({ limit: 100 })
      ]);
      if (branchesRes?.success) setBranches(branchesRes.data);
      if (usersRes?.success) setUsers(usersRes.data);
    } catch (err) {
      console.error("Failed to load dependencies", err);
    }
  };

  const fetchFunds = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page: pagination.page, limit: pagination.limit };
      const res = await financeApi.getPettyCashFunds(params);
      if (res.data?.success) {
        setFunds(res.data.data);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error("Failed to load petty cash funds", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSoftware?.software_code === "FINANCE") {
      fetchDependencies();
    }
  }, [activeSoftware]);

  useEffect(() => {
    if (activeSoftware?.software_code === "FINANCE") {
      fetchFunds();
    }
  }, [filters, pagination.page, activeSoftware]);

  const handleDelete = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this petty cash fund?")) {
      try {
        await financeApi.deletePettyCashFund(id);
        fetchFunds();
      } catch (err) {
        alert("Failed to delete: " + (err.response?.data?.message || err.message));
      }
    }
  };

  if (activeSoftware?.software_code !== "FINANCE") {
    return <div className="p-8 text-center text-red-500 font-medium">Please switch to Finance module to access this page.</div>;
  }

  return (
    <div className="flex flex-col gap-4 py-4 h-full">
      <FinancePageHeader
        title="Petty Cash Funds"
        subtitle="Manage petty cash funds and custodians"
        onAdd={hasPermission("finance.petty_cash_fund.create") ? () => history.push("/admin/finance/petty-cash-funds/create") : undefined}
        addLabel="Create Petty Cash Fund"
      />

      <div className="bg-white dark:bg-navy-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={filters.branch_id}
            onChange={(e: any) => setFilters((prev: unknown) => ({ ...prev, branch_id: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500 dark:bg-navy-900 dark:border-navy-700 dark:text-white"
          >
            <option value="">All Branches</option>
            {branches.map((b: unknown) => (
              <option key={b.id} value={b.id}>{b.branch_name}</option>
            ))}
          </select>
          <select
            value={filters.custodian_user_id}
            onChange={(e: any) => setFilters((prev: unknown) => ({ ...prev, custodian_user_id: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500 dark:bg-navy-900 dark:border-navy-700 dark:text-white"
          >
            <option value="">All Custodians</option>
            {users.map((u: unknown) => (
              <option key={u.id} value={u.id}>{u.name || u.full_name}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e: any) => setFilters((prev: unknown) => ({ ...prev, status: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500 dark:bg-navy-900 dark:border-navy-700 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <input
            type="text"
            placeholder="Search Code or Name..."
            value={filters.search}
            onChange={(e: any) => setFilters((prev: unknown) => ({ ...prev, search: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500 dark:bg-navy-900 dark:border-navy-700 dark:text-white"
          />
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-navy-700/50 text-gray-500 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-navy-700">
              <tr>
                <th className="px-4 py-3">Fund Code</th>
                <th className="px-4 py-3">Fund Name</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3">Cash Account</th>
                <th className="px-4 py-3">Custodian</th>
                <th className="px-4 py-3 text-right">Opening Balance</th>
                <th className="px-4 py-3 text-right">Current Balance</th>
                <th className="px-4 py-3 text-right">Fund Limit</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-navy-700 text-gray-700 dark:text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : funds.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-gray-500">No petty cash funds found.</td>
                </tr>
              ) : (
                funds.map((fund: unknown) => {
                  const isLowBalance = fund.current_balance < (fund.fund_limit * 0.2);
                  return (
                    <tr key={fund.id} className="hover:bg-gray-50 dark:hover:bg-navy-700/30">
                      <td className="px-4 py-3 font-medium text-navy-700 dark:text-white">{fund.fund_code}</td>
                      <td className="px-4 py-3">{fund.fund_name}</td>
                      <td className="px-4 py-3">{fund.branch?.branch_name}</td>
                      <td className="px-4 py-3">{fund.chart_of_account?.account_code}</td>
                      <td className="px-4 py-3">{fund.custodian_user?.name || fund.custodian_user?.full_name}</td>
                      <td className="px-4 py-3 text-right"><MoneyDisplay amount={fund.opening_balance} /></td>
                      <td className={`px-4 py-3 text-right font-bold ${isLowBalance ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>
                        <MoneyDisplay amount={fund.current_balance} />
                      </td>
                      <td className="px-4 py-3 text-right"><MoneyDisplay amount={fund.fund_limit} /></td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${fund.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"}`}>
                          {fund.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {hasPermission("finance.petty_cash_fund.view") && (
                            <button onClick={() => history.push(`/admin/finance/petty-cash-funds/${fund.id}`)} className="text-gray-500 hover:text-navy-700 dark:hover:text-white">
                              <MdVisibility className="h-5 w-5" />
                            </button>
                          )}
                          {hasPermission("finance.petty_cash_fund.update") && (
                            <button onClick={() => history.push(`/admin/finance/petty-cash-funds/${fund.id}/edit`)} className="text-brand-500 hover:text-brand-700 dark:hover:text-brand-400">
                              <MdEdit className="h-5 w-5" />
                            </button>
                          )}
                          {hasPermission("finance.petty_cash_fund.delete") && (
                            <button onClick={() => handleDelete(fund.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400">
                              <MdDelete className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-800 text-gray-500 dark:text-gray-400">
          <span>Total Records: {pagination.total}</span>
          <div className="flex gap-2">
            <button disabled={pagination.page <= 1} onClick={() => setPagination((prev: unknown) => ({ ...prev, page: prev.page - 1 }))} className="px-3 py-1 border border-gray-300 dark:border-navy-600 rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors">Previous</button>
            <span className="px-3 py-1">Page {pagination.page}</span>
            <button disabled={funds.length < pagination.limit} onClick={() => setPagination((prev: unknown) => ({ ...prev, page: prev.page + 1 }))} className="px-3 py-1 border border-gray-300 dark:border-navy-600 rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
