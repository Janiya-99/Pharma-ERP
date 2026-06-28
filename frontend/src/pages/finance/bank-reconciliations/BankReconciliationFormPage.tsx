import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../../api/financeApi";
import BankAccountSelect from "../../../../components/finance/BankAccountSelect";
import UnreconciledTransactionsTable from "./UnreconciledTransactionsTable";
import ReconciliationSummary from "./ReconciliationSummary";
import { toast } from "react-hot-toast";

export default function BankReconciliationFormPage() {
  const { id } = useParams();
  const history = useHistory();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    bank_account_id: "",
    statement_start_date: "",
    statement_end_date: "",
    statement_opening_balance: 0,
    statement_closing_balance: 0,
    remarks: "",
  });

  const [unreconciledTxs, setUnreconciledTxs] = useState([]);
  const [selectedTxIds, setSelectedTxIds] = useState([]);

  useEffect(() => {
    if (isEdit) {
      fetchFormData();
    }
  }, [id]);

  const fetchFormData = async () => {
    setLoading(true);
    try {
      const res = await financeApi.getBankReconciliationById(id);
      if (res.data?.success) {
        const rec = res.data.data;
        setFormData({
          bank_account_id: rec.bank_account_id?.toString() || "",
          statement_start_date: rec.statement_start_date
            ? rec.statement_start_date.split("T")[0]
            : "",
          statement_end_date: rec.statement_end_date
            ? rec.statement_end_date.split("T")[0]
            : "",
          statement_opening_balance: rec.statement_opening_balance || 0,
          statement_closing_balance: rec.statement_closing_balance || 0,
          remarks: rec.remarks || "",
        });

        // Populate selected transactions from lines
        if (rec.lines) {
          setSelectedTxIds(
            rec.lines.map((line: unknown) => line.bank_transaction_id)
          );
        }

        // Fetch unreconciled txs for this bank account to allow changes
        if (rec.bank_account_id) {
          fetchUnreconciledTxs(rec.bank_account_id, rec.lines);
        }
      }
    } catch (error) {
      toast.error("Failed to load reconciliation data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreconciledTxs = async (
    bankAccountId: string | number,
    existingLines: unknown = []
  ) => {
    try {
      const res = await financeApi.getUnreconciledTransactions(bankAccountId, {
        limit: 1000,
      });
      if (res.data?.success) {
        let txs = res.data.data || [];
        // If edit, include the currently mapped transactions in the list so they can be deselected
        if (isEdit && existingLines.length > 0) {
          const currentTxs = existingLines.map(
            (line: unknown) => line.bank_transaction
          );
          // Filter out existing from fetched to avoid duplicates, then prepend
          const fetchedIds = new Set(txs.map((t: unknown) => t.id));
          const missingCurrent = currentTxs.filter(
            (ct: unknown) => ct && !fetchedIds.has(ct.id)
          );
          txs = [...missingCurrent, ...txs];
        }
        setUnreconciledTxs(txs);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load unreconciled transactions");
    }
  };

  useEffect(() => {
    if (!isEdit && formData.bank_account_id) {
      fetchUnreconciledTxs(formData.bank_account_id);
      setSelectedTxIds([]); // Reset selection when bank account changes
    }
  }, [formData.bank_account_id, isEdit]);

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    setFormData((prev: unknown) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const toggleSelection = (txId: string | number) => {
    setSelectedTxIds((prev: unknown) =>
      prev.includes(txId)
        ? prev.filter((id: string | number) => id !== txId)
        : [...prev, txId]
    );
  };

  const toggleAll = (e: any) => {
    if (e.target.checked) {
      setSelectedTxIds(unreconciledTxs.map((tx: unknown) => tx.id));
    } else {
      setSelectedTxIds([]);
    }
  };

  const calculateSummary = () => {
    let totalClearedDebits = 0;
    let totalClearedCredits = 0;

    selectedTxIds.forEach((id: string | number) => {
      const tx = unreconciledTxs.find((t: unknown) => t.id === id);
      if (tx) {
        totalClearedDebits += tx.debit_amount || 0;
        totalClearedCredits += tx.credit_amount || 0;
      }
    });

    return { totalClearedDebits, totalClearedCredits };
  };

  const { totalClearedDebits, totalClearedCredits } = calculateSummary();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.bank_account_id) {
      toast.error("Please select a bank account");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        bank_account_id: parseInt(formData.bank_account_id),
        transaction_ids: selectedTxIds,
      };

      if (isEdit) {
        await financeApi.updateBankReconciliation(id, payload);
        toast.success("Reconciliation draft updated");
      } else {
        await financeApi.createBankReconciliation(payload);
        toast.success("Reconciliation draft created");
      }
      history.push("/admin/finance/bank-reconciliations");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save reconciliation"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="mx-auto h-full max-w-6xl overflow-y-auto py-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
            {isEdit ? "Edit Bank Reconciliation" : "New Bank Reconciliation"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Match bank statement with system transactions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => history.push("/admin/finance/bank-reconciliations")}
          className="rounded-md border bg-white px-4 py-2 text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
              <h3 className="mb-4 border-b pb-2 text-lg font-bold text-navy-700 dark:border-navy-700 dark:text-white">
                Statement Details
              </h3>
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
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Statement Start Date *
                  </label>
                  <input
                    type="date"
                    name="statement_start_date"
                    value={formData.statement_start_date}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Statement End Date *
                  </label>
                  <input
                    type="date"
                    name="statement_end_date"
                    value={formData.statement_end_date}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Statement Opening Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="statement_opening_balance"
                    value={formData.statement_opening_balance}
                    onChange={handleChange}
                    className="w-full rounded-md border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Statement Closing Balance *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="statement_closing_balance"
                    value={formData.statement_closing_balance}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border px-3 py-2"
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
                    className="w-full rounded-md border px-3 py-2"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
              <h3 className="mb-4 flex items-center justify-between border-b pb-2 text-lg font-bold text-navy-700 dark:border-navy-700 dark:text-white">
                <span>Transactions to Reconcile</span>
                <span className="rounded-md bg-gray-100 px-2 py-1 text-sm font-normal text-gray-500">
                  {selectedTxIds.length} Selected
                </span>
              </h3>

              {!formData.bank_account_id ? (
                <div className="py-8 text-center text-gray-500">
                  Please select a bank account to view transactions.
                </div>
              ) : (
                <UnreconciledTransactionsTable
                  transactions={unreconciledTxs}
                  selectedTxIds={selectedTxIds}
                  onToggleSelection={toggleSelection}
                  onToggleAll={toggleAll}
                />
              )}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-1">
            <ReconciliationSummary
              statementClosingBalance={formData.statement_closing_balance}
              systemOpeningBalance={formData.statement_opening_balance}
              totalClearedDebits={totalClearedDebits}
              totalClearedCredits={totalClearedCredits}
            />

            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
              <h3 className="mb-4 border-b pb-2 text-lg font-bold text-navy-700 dark:border-navy-700 dark:text-white">
                Actions
              </h3>
              <p className="mb-4 text-sm text-gray-500">
                Save this reconciliation as a draft. You can complete it later
                when the difference is zero.
              </p>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-md bg-brand-500 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {saving ? "Saving Draft..." : "Save Draft"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
