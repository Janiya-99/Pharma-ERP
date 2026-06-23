import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../../api/financeApi";
import { getBranches, getUsers } from "../../../../api/controlApi";
import { useAuth } from "../../../../auth/AuthContext";
import FinancePageHeader from "../../../../components/finance/FinancePageHeader";

export default function PettyCashFundFormPage() {
  const { id } = useParams();
  const history = useHistory();
  const { activeSoftware } = useAuth();
  
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [branches, setBranches] = useState([]);
  const [cashAccounts, setCashAccounts] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    branch_id: "",
    fund_name: "",
    fund_code: "",
    chart_account_id: "",
    custodian_user_id: "",
    opening_balance: "",
    fund_limit: "",
    status: "active"
  });

  useEffect(() => {
    if (activeSoftware?.software_code !== "FINANCE") return;

    const fetchDependencies = async () => {
      try {
        const [branchesRes, accountsRes, usersRes] = await Promise.all([
          getBranches({ limit: 100 }),
          financeApi.getChartOfAccounts({ is_cash_account: true, limit: 1000 }),
          getUsers({ limit: 100 })
        ]);
        if (branchesRes?.success) setBranches(branchesRes.data);
        if (accountsRes.data?.success) setCashAccounts(accountsRes.data.data);
        if (usersRes?.success) setUsers(usersRes.data);
      } catch (err) {
        console.error("Failed to load dependencies", err);
      }
    };

    fetchDependencies();
  }, [activeSoftware]);

  useEffect(() => {
    if (isEdit && activeSoftware?.software_code === "FINANCE") {
      const fetchFund = async () => {
        try {
          const res = await financeApi.getPettyCashFundById(id);
          if (res.data?.success) {
            const data = res.data.data;
            setFormData({
              branch_id: data.branch_id,
              fund_name: data.fund_name,
              fund_code: data.fund_code,
              chart_account_id: data.chart_account_id,
              custodian_user_id: data.custodian_user_id,
              opening_balance: data.opening_balance,
              fund_limit: data.fund_limit,
              status: data.status
            });
          }
        } catch (err) {
          setError("Failed to load petty cash fund details");
        } finally {
          setLoading(false);
        }
      };
      fetchFund();
    }
  }, [id, isEdit, activeSoftware]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: unknown) => ({
      ...prev,
      [name]: ["branch_id", "chart_account_id", "custodian_user_id"].includes(name) 
        ? (value ? Number(value) : "") 
        : ["opening_balance", "fund_limit"].includes(name)
        ? (value ? parseFloat(value) : "")
        : value
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Validations
    if (!formData.branch_id) return setError("Branch is required"), setSaving(false);
    if (!formData.fund_name) return setError("Fund name is required"), setSaving(false);
    if (!formData.fund_code) return setError("Fund code is required"), setSaving(false);
    if (!formData.chart_account_id) return setError("Cash account is required"), setSaving(false);
    if (!formData.custodian_user_id) return setError("Custodian user is required"), setSaving(false);
    if (formData.opening_balance < 0) return setError("Opening balance cannot be negative"), setSaving(false);
    if (formData.fund_limit < 0) return setError("Fund limit cannot be negative"), setSaving(false);

    try {
      if (isEdit) {
        await financeApi.updatePettyCashFund(id, formData);
      } else {
        await financeApi.createPettyCashFund(formData);
      }
      history.push("/admin/finance/petty-cash-funds");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save petty cash fund");
    } finally {
      setSaving(false);
    }
  };

  if (activeSoftware?.software_code !== "FINANCE") {
    return <div className="p-8 text-center text-red-500 font-medium">Please switch to Finance module to access this page.</div>;
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4 py-4 h-full max-w-4xl mx-auto">
      <FinancePageHeader
        title={isEdit ? "Edit Petty Cash Fund" : "Create Petty Cash Fund"}
        subtitle={isEdit ? `Editing fund: ${formData.fund_name}` : "Set up a new petty cash fund and assign a custodian"}
        backUrl="/admin/finance/petty-cash-funds"
      />

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 dark:bg-red-900/30 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch *</label>
              <select
                name="branch_id"
                value={formData.branch_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-900 dark:border-navy-600 dark:text-white"
                required
              >
                <option value="" disabled>Select Branch</option>
                {branches.map((b: unknown) => (
                  <option key={b.id} value={b.id}>{b.branch_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fund Code *</label>
              <input
                type="text"
                name="fund_code"
                value={formData.fund_code}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-900 dark:border-navy-600 dark:text-white"
                placeholder="e.g. PCF-001"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fund Name *</label>
              <input
                type="text"
                name="fund_name"
                value={formData.fund_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-900 dark:border-navy-600 dark:text-white"
                placeholder="e.g. Main Office Petty Cash"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cash Account *</label>
              <select
                name="chart_account_id"
                value={formData.chart_account_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-900 dark:border-navy-600 dark:text-white"
                required
              >
                <option value="" disabled>Select Cash Account</option>
                {cashAccounts.map((c: unknown) => (
                  <option key={c.id} value={c.id}>{c.account_code} - {c.account_name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Only accounts marked as cash accounts are shown.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custodian User *</label>
              <select
                name="custodian_user_id"
                value={formData.custodian_user_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-900 dark:border-navy-600 dark:text-white"
                required
              >
                <option value="" disabled>Select Custodian</option>
                {users.map((u: unknown) => (
                  <option key={u.id} value={u.id}>{u.name || u.full_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opening Balance (LKR) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="opening_balance"
                value={formData.opening_balance}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-900 dark:border-navy-600 dark:text-white"
                required
              />
              {isEdit && <p className="text-xs text-orange-500 mt-1">Note: Modifying opening balance does not affect posted vouchers.</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fund Limit (LKR) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="fund_limit"
                value={formData.fund_limit}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-900 dark:border-navy-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-900 dark:border-navy-600 dark:text-white"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-700 mt-6">
            <button
              type="button"
              onClick={() => history.push("/admin/finance/petty-cash-funds")}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-navy-800 dark:border-navy-600 dark:text-gray-300 dark:hover:bg-navy-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 disabled:opacity-50 font-medium transition-colors"
            >
              {saving ? "Saving..." : isEdit ? "Update Fund" : "Create Fund"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
