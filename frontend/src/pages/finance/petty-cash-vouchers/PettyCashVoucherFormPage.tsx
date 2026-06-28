import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../../api/financeApi";
import { getBranches } from "../../../../api/controlApi";
import { useAuth } from "../../../../auth/AuthContext";
import FinancePageHeader from "../../../../components/finance/FinancePageHeader";
import PettyCashLinesTable from "../../../../components/finance/PettyCashLinesTable";
import PettyCashTotalSummary from "../../../../components/finance/PettyCashTotalSummary";

export default function PettyCashVoucherFormPage() {
  const { id } = useParams();
  const history = useHistory();
  const { activeSoftware } = useAuth();

  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [branches, setBranches] = useState([]);
  const [funds, setFunds] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [accountingPeriods, setAccountingPeriods] = useState([]);

  const [formData, setFormData] = useState({
    branch_id: "",
    petty_cash_fund_id: "",
    financial_year_id: "",
    accounting_period_id: "",
    voucher_date: new Date().toISOString().split("T")[0],
    voucher_type: "expense",
    payee_name: "",
    reference_number: "",
    description: "",
    lines: [{ account_id: "", line_description: "", amount: "" }],
  });

  const [selectedFundBalance, setSelectedFundBalance] = useState(undefined);

  useEffect(() => {
    if (activeSoftware?.software_code !== "FINANCE") return;

    const fetchDependencies = async () => {
      try {
        const [branchesRes, fundsRes, fyRes, apRes] = await Promise.all([
          getBranches({ limit: 100 }),
          financeApi.getPettyCashFunds({ limit: 1000, status: "active" }),
          financeApi.getFinancialYears({ limit: 100, status: "open" }),
          financeApi.getAccountingPeriods({ limit: 100, status: "open" }),
        ]);
        if (branchesRes?.success) setBranches(branchesRes.data);
        if (fundsRes.data?.success) setFunds(fundsRes.data.data);
        if (fyRes.data?.success) setFinancialYears(fyRes.data.data);
        if (apRes.data?.success) setAccountingPeriods(apRes.data.data);
      } catch (err) {
        console.error("Failed to load dependencies", err);
      }
    };

    fetchDependencies();
  }, [activeSoftware]);

  useEffect(() => {
    if (isEdit && activeSoftware?.software_code === "FINANCE") {
      const fetchVoucher = async () => {
        try {
          const res = await financeApi.getPettyCashVoucherById(id);
          if (res.data?.success) {
            const data = res.data.data;
            setFormData({
              branch_id: data.branch_id,
              petty_cash_fund_id: data.petty_cash_fund_id,
              financial_year_id: data.financial_year_id,
              accounting_period_id: data.accounting_period_id,
              voucher_date: data.voucher_date,
              voucher_type: data.voucher_type,
              payee_name: data.payee_name || "",
              reference_number: data.reference_number || "",
              description: data.description || "",
              lines:
                data.lines?.map((l: unknown) => ({
                  account_id: l.account_id,
                  line_description: l.line_description || "",
                  amount: parseFloat(l.amount),
                })) || [],
            });
            setSelectedFundBalance(
              parseFloat(data.petty_cash_fund?.current_balance || 0)
            );
          }
        } catch (err) {
          setError("Failed to load petty cash voucher details");
        } finally {
          setLoading(false);
        }
      };
      fetchVoucher();
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
      [name]: [
        "branch_id",
        "petty_cash_fund_id",
        "financial_year_id",
        "accounting_period_id",
      ].includes(name)
        ? value
          ? Number(value)
          : ""
        : value,
    }));
  };

  const handleLinesChange = (newLines: unknown) => {
    setFormData((prev: unknown) => ({ ...prev, lines: newLines }));
  };

  const totalAmount = formData.lines.reduce(
    (sum: unknown, line: unknown) => sum + (parseFloat(line.amount) || 0),
    0
  );

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Validations
    if (!formData.branch_id)
      return setError("Branch is required"), setSaving(false);
    if (!formData.petty_cash_fund_id)
      return setError("Petty Cash Fund is required"), setSaving(false);
    if (!formData.financial_year_id)
      return setError("Financial Year is required"), setSaving(false);
    if (!formData.accounting_period_id)
      return setError("Accounting Period is required"), setSaving(false);
    if (!formData.voucher_date)
      return setError("Voucher Date is required"), setSaving(false);
    if (!formData.voucher_type)
      return setError("Voucher Type is required"), setSaving(false);

    if (formData.lines.length === 0)
      return setError("At least one line is required"), setSaving(false);

    for (let i = 0; i < formData.lines.length; i++) {
      const line = formData.lines[i];
      if (!line.account_id)
        return setError(`Line ${i + 1}: Account is required`), setSaving(false);
      if (!line.amount || parseFloat(line.amount) <= 0)
        return (
          setError(`Line ${i + 1}: Amount must be greater than zero`),
          setSaving(false)
        );
    }

    if (totalAmount <= 0)
      return (
        setError("Total amount must be greater than zero"), setSaving(false)
      );

    try {
      if (isEdit) {
        await financeApi.updatePettyCashVoucher(id, formData);
      } else {
        await financeApi.createPettyCashVoucher(formData);
      }
      history.push("/admin/finance/petty-cash-vouchers");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save petty cash voucher"
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

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-4 py-4">
      <FinancePageHeader
        title={isEdit ? "Edit Petty Cash Voucher" : "Create Petty Cash Voucher"}
        subtitle={
          isEdit
            ? `Editing voucher`
            : "Create a new petty cash expense, advance, or refund"
        }
        backUrl="/admin/finance/petty-cash-vouchers"
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900/30">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
            Voucher Information
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                Voucher Type *
              </label>
              <select
                name="voucher_type"
                value={formData.voucher_type}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 focus:border-brand-500 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                required
              >
                <option value="expense">Expense</option>
                <option value="advance">Advance</option>
                <option value="refund">Refund</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Financial Year *
              </label>
              <select
                name="financial_year_id"
                value={formData.financial_year_id}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 focus:border-brand-500 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                required
              >
                <option value="" disabled>
                  Select Year
                </option>
                {financialYears.map((fy: unknown) => (
                  <option key={fy.id} value={fy.id}>
                    {fy.year_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Accounting Period *
              </label>
              <select
                name="accounting_period_id"
                value={formData.accounting_period_id}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 focus:border-brand-500 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                required
              >
                <option value="" disabled>
                  Select Period
                </option>
                {accountingPeriods
                  .filter(
                    (ap: unknown) =>
                      !formData.financial_year_id ||
                      ap.financial_year_id === formData.financial_year_id
                  )
                  .map((ap: unknown) => (
                    <option key={ap.id} value={ap.id}>
                      {ap.period_name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Voucher Date *
              </label>
              <input
                type="date"
                name="voucher_date"
                value={formData.voucher_date}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 focus:border-brand-500 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                required
                placeholder="e.g. 2026-06-27"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Payee Name
              </label>
              <input
                type="text"
                name="payee_name"
                value={formData.payee_name}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 focus:border-brand-500 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                placeholder="e.g. John Doe"
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
                placeholder="e.g. REF-1234"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                className="w-full rounded-md border px-3 py-2 focus:border-brand-500 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                placeholder="e.g. Office supplies and local travel expenses"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <PettyCashLinesTable
            lines={formData.lines}
            onChange={handleLinesChange}
            readOnly={false}
          />

          <PettyCashTotalSummary
            totalAmount={totalAmount}
            currentFundBalance={selectedFundBalance}
            voucherType={formData.voucher_type}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => history.push("/admin/finance/petty-cash-vouchers")}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-navy-600 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || totalAmount <= 0}
            className="rounded-md bg-brand-500 px-4 py-2 font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : isEdit
              ? "Update Voucher"
              : "Create Voucher"}
          </button>
        </div>
      </form>
    </div>
  );
}
