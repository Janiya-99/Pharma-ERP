import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../../api/financeApi";
import { getBranches } from "../../../../api/controlApi";
import { useAuth } from "../../../../auth/AuthContext";
import FinancePageHeader from "../../../../components/finance/FinancePageHeader";

export default function PettyCashReplenishmentFormPage() {
  const { id } = useParams();
  const history = useHistory();
  const { activeSoftware } = useAuth();

  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [branches, setBranches] = useState([]);
  const [funds, setFunds] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);

  const [formData, setFormData] = useState({
    branch_id: "",
    petty_cash_fund_id: "",
    bank_account_id: "",
    replenishment_date: new Date().toISOString().split("T")[0],
    replenishment_amount: "",
    reference_number: "",
    remarks: "",
  });

  const [selectedFundBalance, setSelectedFundBalance] = useState(undefined);

  useEffect(() => {
    if (activeSoftware?.software_code !== "FINANCE") return;

    const fetchDependencies = async () => {
      try {
        const [branchesRes, fundsRes, bankRes] = await Promise.all([
          getBranches({ limit: 100 }),
          financeApi.getPettyCashFunds({ limit: 1000, status: "active" }),
          financeApi.getBankAccounts({ limit: 1000, status: "active" }),
        ]);
        if (branchesRes?.success) setBranches(branchesRes.data);
        if (fundsRes.data?.success) setFunds(fundsRes.data.data);
        if (bankRes.data?.success) setBankAccounts(bankRes.data.data);
      } catch (err) {
        console.error("Failed to load dependencies", err);
      }
    };

    fetchDependencies();
  }, [activeSoftware]);

  useEffect(() => {
    if (isEdit && activeSoftware?.software_code === "FINANCE") {
      const fetchReplenishment = async () => {
        try {
          const res = await financeApi.getPettyCashReplenishmentById(id);
          if (res.data?.success) {
            const data = res.data.data;
            setFormData({
              branch_id: data.branch_id,
              petty_cash_fund_id: data.petty_cash_fund_id,
              bank_account_id: data.bank_account_id,
              replenishment_date: data.replenishment_date,
              replenishment_amount: data.replenishment_amount,
              reference_number: data.reference_number || "",
              remarks: data.remarks || "",
            });
            setSelectedFundBalance(
              parseFloat(data.petty_cash_fund?.current_balance || 0)
            );
          }
        } catch (err) {
          setError("Failed to load petty cash replenishment details");
        } finally {
          setLoading(false);
        }
      };
      fetchReplenishment();
    }
  }, [id, isEdit, activeSoftware]);

  useEffect(() => {
    if (formData.petty_cash_fund_id) {
      const fund = funds.find(
        (f: unknown) => f.id === Number(formData.petty_cash_fund_id)
      );
      if (fund) setSelectedFundBalance(parseFloat(fund.current_balance));
    } else {
      if (!isEdit) setSelectedFundBalance(undefined);
    }
  }, [formData.petty_cash_fund_id, funds, isEdit]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: unknown) => ({
      ...prev,
      [name]: ["branch_id", "petty_cash_fund_id", "bank_account_id"].includes(
        name
      )
        ? value
          ? Number(value)
          : ""
        : ["replenishment_amount"].includes(name)
        ? value
          ? parseFloat(value)
          : ""
        : value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Validations
    if (!formData.branch_id)
      return setError("Branch is required"), setSaving(false);
    if (!formData.petty_cash_fund_id)
      return setError("Petty Cash Fund is required"), setSaving(false);
    if (!formData.bank_account_id)
      return setError("Bank Account is required"), setSaving(false);
    if (!formData.replenishment_date)
      return setError("Replenishment Date is required"), setSaving(false);
    if (!formData.replenishment_amount || formData.replenishment_amount <= 0)
      return setError("Amount must be greater than zero"), setSaving(false);

    try {
      if (isEdit) {
        await financeApi.updatePettyCashReplenishment(id, formData);
      } else {
        await financeApi.createPettyCashReplenishment(formData);
      }
      history.push("/admin/finance/petty-cash-replenishments");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save petty cash replenishment"
      );
    } finally {
      setSaving(false);
    }
  };

  if (activeSoftware?.software_code !== "FINANCE") {
    return (
      <div className="p-8 text-center font-medium text-red-500">
        Please switch to Finance module to access this page.
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  const formatCurrency = (amount: unknown) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const projectedBalance =
    (selectedFundBalance || 0) +
    (parseFloat(formData.replenishment_amount) || 0);

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-4 py-4">
      <FinancePageHeader
        title={isEdit ? "Edit Replenishment" : "Create Replenishment"}
        subtitle={
          isEdit
            ? `Editing replenishment`
            : "Record a fund transfer from bank to petty cash"
        }
        backUrl="/admin/finance/petty-cash-replenishments"
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900/30">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Branch *
              </label>
              <select
                name="branch_id"
                value={formData.branch_id}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 focus:border-brand-500 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                required
              >
                <option value="" disabled>
                  Select Branch
                </option>
                {branches.map((b: unknown) => (
                  <option key={b.id} value={b.id}>
                    {b.branch_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Petty Cash Fund *
              </label>
              <select
                name="petty_cash_fund_id"
                value={formData.petty_cash_fund_id}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 focus:border-brand-500 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                required
              >
                <option value="" disabled>
                  Select Fund
                </option>
                {funds.map((f: unknown) => (
                  <option key={f.id} value={f.id}>
                    {f.fund_code} - {f.fund_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Funding Bank Account *
              </label>
              <select
                name="bank_account_id"
                value={formData.bank_account_id}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 focus:border-brand-500 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                required
              >
                <option value="" disabled>
                  Select Bank Account
                </option>
                {bankAccounts.map((b: unknown) => (
                  <option key={b.id} value={b.id}>
                    {b.bank_name} - {b.account_number}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date *
              </label>
              <input
                type="date"
                name="replenishment_date"
                value={formData.replenishment_date}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 focus:border-brand-500 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                required
                placeholder="e.g. 2026-06-27"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Amount (LKR) *
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                name="replenishment_amount"
                value={formData.replenishment_amount}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 focus:border-brand-500 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                required
                placeholder="e.g. 50000.00"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Reference Number
              </label>
              <input
                type="text"
                name="reference_number"
                value={formData.reference_number}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 focus:border-brand-500 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                placeholder="e.g. REF-5678"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows="2"
                className="w-full rounded-md border px-3 py-2 focus:border-brand-500 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                placeholder="e.g. Monthly replenishment of main vault fund"
              />
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6 dark:border-navy-700">
            <div className="ml-auto max-w-sm rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-navy-700 dark:bg-navy-900/50">
              <div className="mb-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Current Fund Balance:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedFundBalance !== undefined
                    ? formatCurrency(selectedFundBalance)
                    : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-sm font-bold text-navy-700 dark:border-navy-700 dark:text-white">
                <span>Projected Balance:</span>
                <span className="text-green-600 dark:text-green-400">
                  {selectedFundBalance !== undefined
                    ? formatCurrency(projectedBalance)
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() =>
              history.push("/admin/finance/petty-cash-replenishments")
            }
            className="rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-navy-600 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !formData.replenishment_amount}
            className="rounded-md bg-brand-500 px-4 py-2 font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : isEdit
              ? "Update Replenishment"
              : "Create Replenishment"}
          </button>
        </div>
      </form>
    </div>
  );
}
