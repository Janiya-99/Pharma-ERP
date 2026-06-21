import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../../api/financeApi";
import { useAuth } from "../../../../auth/AuthContext";
import BranchSelector from "../../../../components/common/BranchSelector";
import FinancialYearSelect from "../../../../components/finance/FinancialYearSelect";
import AccountingPeriodSelect from "../../../../components/finance/AccountingPeriodSelect";
import JournalEntryLinesTable from "./JournalEntryLinesTable";
import { MdArrowBack, MdSave } from "react-icons/md";

export default function JournalEntryFormPage() {
  const { id } = useParams();
  const history = useHistory();
  const { activeSoftware } = useAuth();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    branch_id: "",
    financial_year_id: "",
    accounting_period_id: "",
    journal_date: "",
    reference_number: "",
    description: "",
  });

  const [lines, setLines] = useState([
    { account_id: "", line_description: "", debit_amount: 0, credit_amount: 0 },
    { account_id: "", line_description: "", debit_amount: 0, credit_amount: 0 }
  ]);

  useEffect(() => {
    if (isEdit && activeSoftware?.software_code === "FINANCE") {
      loadJournal();
    }
  }, [id, activeSoftware]);

  const loadJournal = async () => {
    setLoading(true);
    try {
      const res = await financeApi.getJournalEntryById(id);
      if (res.data?.success) {
        const d = res.data.data;
        setFormData({
          branch_id: d.branch_id || "",
          financial_year_id: d.financial_year_id || "",
          accounting_period_id: d.accounting_period_id || "",
          journal_date: d.journal_date ? d.journal_date.split("T")[0] : "",
          reference_number: d.reference_number || "",
          description: d.description || "",
        });
        if (d.lines && d.lines.length > 0) {
          setLines(d.lines.map(l => ({
            account_id: l.account_id,
            line_description: l.line_description || "",
            debit_amount: l.debit_amount || 0,
            credit_amount: l.credit_amount || 0
          })));
        }
      }
    } catch (err) {
      setError("Failed to load journal entry details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.branch_id || !formData.financial_year_id || !formData.accounting_period_id || !formData.journal_date) {
      setError("Branch, Financial Year, Accounting Period, and Journal Date are required.");
      return;
    }

    if (lines.length < 2) {
      setError("At least 2 lines required.");
      return;
    }

    let totalDebit = 0;
    let totalCredit = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.account_id) {
        setError(`Line ${i + 1}: Account is required.`);
        return;
      }
      if (line.debit_amount === 0 && line.credit_amount === 0) {
        setError(`Line ${i + 1}: Must have either debit or credit amount.`);
        return;
      }
      if (line.debit_amount > 0 && line.credit_amount > 0) {
        setError(`Line ${i + 1}: Cannot have both debit and credit amounts.`);
        return;
      }
      if (line.debit_amount < 0 || line.credit_amount < 0) {
        setError(`Line ${i + 1}: Amounts cannot be negative.`);
        return;
      }
      totalDebit += (Number(line.debit_amount) || 0);
      totalCredit += (Number(line.credit_amount) || 0);
    }

    if (totalDebit !== totalCredit) {
      setError("Total debit must equal total credit.");
      return;
    }

    if (totalDebit <= 0) {
      setError("Total debit must be greater than zero.");
      return;
    }

    setSubmitting(true);
    const payload = {
      branch_id: Number(formData.branch_id),
      financial_year_id: Number(formData.financial_year_id),
      accounting_period_id: Number(formData.accounting_period_id),
      journal_date: formData.journal_date,
      reference_number: formData.reference_number,
      description: formData.description,
      lines: lines.map(l => ({
        account_id: Number(l.account_id),
        line_description: l.line_description,
        debit_amount: Number(l.debit_amount) || 0,
        credit_amount: Number(l.credit_amount) || 0
      }))
    };

    try {
      if (isEdit) {
        await financeApi.updateJournalEntry(id, payload);
      } else {
        await financeApi.createJournalEntry(payload);
      }
      history.push("/admin/finance/journal-entries");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save journal entry");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (activeSoftware?.software_code !== "FINANCE") {
    return <div className="p-8 text-center text-red-500 font-medium">Please switch to Finance module to access this page.</div>;
  }

  const isBalanced = 
    lines.reduce((s, l) => s + (Number(l.debit_amount) || 0), 0) > 0 &&
    lines.reduce((s, l) => s + (Number(l.debit_amount) || 0), 0) === lines.reduce((s, l) => s + (Number(l.credit_amount) || 0), 0);

  return (
    <div className="flex flex-col gap-4 py-4 h-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => history.goBack()}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
          >
            <MdArrowBack className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-navy-800 dark:text-white">
            {isEdit ? "Edit Journal Entry" : "Create Journal Entry"}
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={submitting || !isBalanced}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MdSave size={20} />
          {submitting ? "Saving..." : "Save Journal"}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-navy-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700">
        <h3 className="text-lg font-medium text-navy-800 dark:text-white mb-4">Header Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch *</label>
            <BranchSelector
              value={formData.branch_id}
              onChange={(val) => setFormData(prev => ({ ...prev, branch_id: val }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Financial Year *</label>
            <FinancialYearSelect
              value={formData.financial_year_id}
              onChange={(val) => setFormData(prev => ({ ...prev, financial_year_id: val, accounting_period_id: "" }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Accounting Period *</label>
            <AccountingPeriodSelect
              financialYearId={formData.financial_year_id}
              value={formData.accounting_period_id}
              onChange={(val) => setFormData(prev => ({ ...prev, accounting_period_id: val }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Journal Date *</label>
            <input
              type="date"
              value={formData.journal_date}
              onChange={(e) => setFormData(prev => ({ ...prev, journal_date: e.target.value }))}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-navy-500 focus:border-navy-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reference Number</label>
            <input
              type="text"
              value={formData.reference_number}
              onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
              placeholder="e.g. REF-001"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-navy-500 focus:border-navy-500"
            />
          </div>
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              placeholder="Journal entry description..."
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-navy-500 focus:border-navy-500"
            />
          </div>
        </div>
      </div>

      <JournalEntryLinesTable
        lines={lines}
        setLines={setLines}
        disabled={submitting}
      />
    </div>
  );
}
