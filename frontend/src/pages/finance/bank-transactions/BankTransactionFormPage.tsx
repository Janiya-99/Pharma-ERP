import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../../api/financeApi";
import { getBranches } from "../../../../api/controlApi";
import BankAccountSelect from "../../../../components/finance/BankAccountSelect";
import { toast } from "react-hot-toast";

export default function BankTransactionFormPage() {
  const { id } = useParams();
  const history = useHistory();
  const isEdit = !!id;

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    branch_id: "",
    bank_account_id: "",
    transaction_date: new Date().toISOString().split("T")[0],
    value_date: "",
    transaction_type: "deposit",
    reference_number: "",
    description: "",
    debit_amount: 0,
    credit_amount: 0,
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const branchesRes = await getBranches({ limit: 100 });
      if (branchesRes?.success) setBranches(branchesRes.data);

      if (isEdit) {
        const res = await financeApi.getBankTransactionById(id);
        if (res.data?.success) {
          const tx = res.data.data;
          setFormData({
            branch_id: tx.branch_id?.toString() || "",
            bank_account_id: tx.bank_account_id?.toString() || "",
            transaction_date: tx.transaction_date
              ? tx.transaction_date.split("T")[0]
              : "",
            value_date: tx.value_date ? tx.value_date.split("T")[0] : "",
            transaction_type: tx.transaction_type || "deposit",
            reference_number: tx.reference_number || "",
            description: tx.description || "",
            debit_amount: tx.debit_amount || 0,
            credit_amount: tx.credit_amount || 0,
          });
        }
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    setFormData((prev: unknown) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.bank_account_id && !isEdit) {
      toast.error("Please select a bank account");
      return;
    }
    if (formData.debit_amount === 0 && formData.credit_amount === 0) {
      toast.error("Either Debit or Credit amount must be greater than 0");
      return;
    }
    if (formData.debit_amount > 0 && formData.credit_amount > 0) {
      toast.error(
        "A single transaction cannot have both Debit and Credit amounts"
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        branch_id: formData.branch_id
          ? parseInt(formData.branch_id)
          : undefined,
        bank_account_id: parseInt(formData.bank_account_id),
        value_date: formData.value_date ? formData.value_date : undefined,
      };

      if (isEdit) {
        await financeApi.updateBankTransaction(id, payload);
        toast.success("Transaction updated successfully");
      } else {
        await financeApi.createBankTransaction(payload);
        toast.success("Transaction created successfully");
      }
      history.push("/admin/finance/bank-transactions");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save transaction"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="mx-auto h-full max-w-4xl overflow-y-auto py-4">
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
        <div className="mb-6 flex items-center justify-between border-b pb-4 dark:border-navy-700">
          <div>
            <h2 className="text-xl font-bold text-navy-700 dark:text-white">
              {isEdit
                ? "Edit Bank Transaction"
                : "Create Manual Bank Transaction"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Record manual bank transactions like charges or interest.
            </p>
          </div>
          <button
            type="button"
            onClick={() => history.push("/admin/finance/bank-transactions")}
            className="rounded-md border px-4 py-2 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bank Account *
              </label>
              <BankAccountSelect
                value={formData.bank_account_id}
                onChange={(val: unknown) =>
                  setFormData((prev: unknown) => ({
                    ...prev,
                    bank_account_id: val,
                  }))
                }
                disabled={isEdit}
              />
              {isEdit && (
                <p className="mt-1 text-xs text-gray-500">
                  Bank account cannot be changed.
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Branch
              </label>
              <select
                name="branch_id"
                value={formData.branch_id}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2"
              >
                <option value="">Company Level</option>
                {branches.map((b: unknown) => (
                  <option key={b.id} value={b.id}>
                    {b.branch_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Transaction Type *
              </label>
              <select
                name="transaction_type"
                value={formData.transaction_type}
                onChange={handleChange}
                required
                disabled={isEdit}
                className="w-full rounded-md border px-3 py-2 disabled:bg-gray-50"
              >
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="bank_charge">Bank Charge</option>
                <option value="interest_income">Interest Income</option>
                <option value="transfer_in">Transfer In</option>
                <option value="transfer_out">Transfer Out</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Transaction Date *
              </label>
              <input
                type="date"
                name="transaction_date"
                value={formData.transaction_date}
                onChange={handleChange}
                required
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Value Date
              </label>
              <input
                type="date"
                name="value_date"
                value={formData.value_date}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2"
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
                className="w-full rounded-md border px-3 py-2"
                placeholder="E.g., Chq No, Tx ID"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                className="w-full rounded-md border px-3 py-2"
              ></textarea>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Debit Amount (In)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="debit_amount"
                value={formData.debit_amount}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2"
                disabled={formData.credit_amount > 0}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Credit Amount (Out)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="credit_amount"
                value={formData.credit_amount}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2"
                disabled={formData.debit_amount > 0}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-6 dark:border-navy-700">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-brand-500 px-6 py-2 text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isEdit
                ? "Update Transaction"
                : "Save Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
