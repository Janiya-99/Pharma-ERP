import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../../api/financeApi";
import { useAuth } from "../../../../auth/AuthContext";
import BranchSelector from "../../../../components/common/BranchSelector";
import FinancialYearSelect from "../../../../components/finance/FinancialYearSelect";
import AccountingPeriodSelect from "../../../../components/finance/AccountingPeriodSelect";
import AccountSelect from "../../../../components/finance/AccountSelect";
import VoucherLinesTable from "../../../../components/finance/VoucherLinesTable";
import { MdArrowBack, MdSave } from "react-icons/md";

export default function PaymentVoucherFormPage() {
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
    payment_date: "",
    payment_type: "other_payment",
    payment_method: "cash",
    paid_from_account_id: "",
    cheque_number: "",
    cheque_date: "",
    reference_number: "",
    description: "",
  });

  const [lines, setLines] = useState([
    { account_id: "", line_description: "", amount: 0 },
  ]);

  useEffect(() => {
    if (isEdit && activeSoftware?.software_code === "FINANCE") {
      loadVoucher();
    }
  }, [id, activeSoftware]);

  const loadVoucher = async () => {
    setLoading(true);
    try {
      const res = await financeApi.getPaymentVoucherById(id);
      if (res.data?.success) {
        const d = res.data.data;
        setFormData({
          branch_id: d.branch_id || "",
          financial_year_id: d.financial_year_id || "",
          accounting_period_id: d.accounting_period_id || "",
          payment_date: d.payment_date ? d.payment_date.split("T")[0] : "",
          payment_type: d.payment_type || "other_payment",
          payment_method: d.payment_method || "cash",
          paid_from_account_id: d.paid_from_account_id || "",
          cheque_number: d.cheque_number || "",
          cheque_date: d.cheque_date ? d.cheque_date.split("T")[0] : "",
          reference_number: d.reference_number || "",
          description: d.description || "",
        });
        if (d.lines && d.lines.length > 0) {
          setLines(
            d.lines.map((l: unknown) => ({
              account_id: l.account_id,
              line_description: l.line_description || "",
              amount: l.amount || 0,
            }))
          );
        }
      }
    } catch (err) {
      setError("Failed to load payment voucher details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (
      !formData.branch_id ||
      !formData.financial_year_id ||
      !formData.accounting_period_id ||
      !formData.payment_date
    ) {
      setError(
        "Branch, Financial Year, Accounting Period, and Payment Date are required."
      );
      return;
    }

    if (
      !formData.payment_type ||
      !formData.payment_method ||
      !formData.paid_from_account_id
    ) {
      setError(
        "Payment Type, Payment Method, and Paid From Account are required."
      );
      return;
    }

    if (formData.payment_method === "cheque") {
      if (!formData.cheque_number) {
        setError("Cheque Number is required for cheque payments.");
        return;
      }
      if (!formData.cheque_date) {
        setError("Cheque Date is required for cheque payments.");
        return;
      }
    }

    if (lines.length < 1) {
      setError("At least 1 line required.");
      return;
    }

    let totalAmount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.account_id) {
        setError(`Line ${i + 1}: Account is required.`);
        return;
      }
      if (line.amount <= 0) {
        setError(`Line ${i + 1}: Amount must be greater than zero.`);
        return;
      }
      totalAmount += Number(line.amount) || 0;
    }

    if (totalAmount <= 0) {
      setError("Total payment amount must be greater than zero.");
      return;
    }

    setSubmitting(true);
    const payload = {
      branch_id: Number(formData.branch_id),
      financial_year_id: Number(formData.financial_year_id),
      accounting_period_id: Number(formData.accounting_period_id),
      payment_date: formData.payment_date,
      payment_type: formData.payment_type,
      payment_method: formData.payment_method,
      paid_from_account_id: Number(formData.paid_from_account_id),
      cheque_number:
        formData.payment_method === "cheque" ? formData.cheque_number : "",
      cheque_date:
        formData.payment_method === "cheque" && formData.cheque_date
          ? formData.cheque_date
          : null,
      reference_number: formData.reference_number,
      description: formData.description,
      lines: lines.map((l: unknown) => ({
        account_id: Number(l.account_id),
        line_description: l.line_description,
        amount: Number(l.amount) || 0,
      })),
    };

    try {
      if (isEdit) {
        await financeApi.updatePaymentVoucher(id, payload);
      } else {
        await financeApi.createPaymentVoucher(payload);
      }
      history.push("/admin/finance/payment-vouchers");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save payment voucher"
      );
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (activeSoftware?.software_code !== "FINANCE") {
    return (
      <div className="p-8 text-center font-medium text-red-500">
        Please switch to Finance module to access this page.
      </div>
    );
  }

  const isSaveDisabled =
    lines.reduce((s: unknown, l: unknown) => s + (Number(l.amount) || 0), 0) <=
    0;

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => history.goBack()}
            className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-navy-700"
          >
            <MdArrowBack className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-navy-800 dark:text-white">
            {isEdit ? "Edit Payment Voucher" : "Create Payment Voucher"}
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={submitting || isSaveDisabled}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MdSave size={20} />
          {submitting ? "Saving..." : "Save Voucher"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
        <h3 className="mb-4 text-lg font-medium text-navy-800 dark:text-white">
          Header Information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Branch *
            </label>
            <BranchSelector
              value={formData.branch_id}
              onChange={(val: unknown) =>
                setFormData((prev: unknown) => ({ ...prev, branch_id: val }))
              }
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Financial Year *
            </label>
            <FinancialYearSelect
              value={formData.financial_year_id}
              onChange={(val: unknown) =>
                setFormData((prev: unknown) => ({
                  ...prev,
                  financial_year_id: val,
                  accounting_period_id: "",
                }))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Accounting Period *
            </label>
            <AccountingPeriodSelect
              financialYearId={formData.financial_year_id}
              value={formData.accounting_period_id}
              onChange={(val: unknown) =>
                setFormData((prev: unknown) => ({
                  ...prev,
                  accounting_period_id: val,
                }))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment Date *
            </label>
            <input
              type="date"
              value={formData.payment_date}
              onChange={(e: any) =>
                setFormData((prev: unknown) => ({
                  ...prev,
                  payment_date: e.target.value,
                }))
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-navy-500 focus:outline-none focus:ring-navy-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment Type *
            </label>
            <select
              value={formData.payment_type}
              onChange={(e: any) =>
                setFormData((prev: unknown) => ({
                  ...prev,
                  payment_type: e.target.value,
                }))
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-navy-500 focus:outline-none focus:ring-navy-500"
            >
              <option value="supplier_payment">Supplier Payment</option>
              <option value="supplier_advance_payment">
                Supplier Advance Payment
              </option>
              <option value="other_payment">Other Payment</option>
              <option value="payment_return">Payment Return</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment Method *
            </label>
            <select
              value={formData.payment_method}
              onChange={(e: any) =>
                setFormData((prev: unknown) => ({
                  ...prev,
                  payment_method: e.target.value,
                }))
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-navy-500 focus:outline-none focus:ring-navy-500"
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="online_transfer">Online Transfer</option>
              <option value="card">Card</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Paid From Account *
            </label>
            <AccountSelect
              value={formData.paid_from_account_id}
              onChange={(val: unknown) =>
                setFormData((prev: unknown) => ({
                  ...prev,
                  paid_from_account_id: val,
                }))
              }
              placeholder="Select Bank/Cash Account"
            />
          </div>
          {formData.payment_method === "cheque" && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cheque Number *
                </label>
                <input
                  type="text"
                  value={formData.cheque_number}
                  onChange={(e: any) =>
                    setFormData((prev: unknown) => ({
                      ...prev,
                      cheque_number: e.target.value,
                    }))
                  }
                  placeholder="e.g. 123456"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-navy-500 focus:outline-none focus:ring-navy-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cheque Date *
                </label>
                <input
                  type="date"
                  value={formData.cheque_date}
                  onChange={(e: any) =>
                    setFormData((prev: unknown) => ({
                      ...prev,
                      cheque_date: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-navy-500 focus:outline-none focus:ring-navy-500"
                />
              </div>
            </>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Reference Number
            </label>
            <input
              type="text"
              value={formData.reference_number}
              onChange={(e: any) =>
                setFormData((prev: unknown) => ({
                  ...prev,
                  reference_number: e.target.value,
                }))
              }
              placeholder="e.g. PAY-REF-001"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-navy-500 focus:outline-none focus:ring-navy-500"
            />
          </div>
          <div className="lg:col-span-3">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e: any) =>
                setFormData((prev: unknown) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={2}
              placeholder="Payment description..."
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-navy-500 focus:outline-none focus:ring-navy-500"
            />
          </div>
        </div>
      </div>

      <VoucherLinesTable
        lines={lines}
        setLines={setLines}
        disabled={submitting}
      />
    </div>
  );
}
