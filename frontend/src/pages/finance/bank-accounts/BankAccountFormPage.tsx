import { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../api/financeApi";
import { getBranches } from "../../../api/controlApi";
import { toast } from "react-hot-toast";
import { Sparkles, Save, ArrowLeft } from "lucide-react";
import { PageTitleCard } from "../../../components/common/PageTitleCard";
import { AiAutoFillModal } from "../../../components/common/AiAutoFillModal";

export default function BankAccountFormPage() {
  const { id } = useParams();
  const history = useHistory();
  const isEdit = !!id;

  const [branches, setBranches] = useState([]);
  const [chartAccounts, setChartAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    branch_id: "",
    chart_account_id: "",
    bank_name: "",
    bank_branch_name: "",
    account_name: "",
    account_number: "",
    swift_code: "",
    bank_code: "",
    branch_code: "",
    opening_balance: 0,
    is_default: false,
    status: "active"
  });

  useEffect(() => {
    fetchFormData();
  }, [id]);

  const fetchFormData = async () => {
    setLoading(true);
    try {
      const [branchesRes, accountsRes] = await Promise.all([
        getBranches({ limit: 100 }),
        financeApi.getChartOfAccounts({ is_bank_account: true, limit: 1000 })
      ]);
      
      if (branchesRes?.success) setBranches(branchesRes.data);
      if (accountsRes.data?.success) setChartAccounts(accountsRes.data.data);

      if (isEdit) {
        const res = await financeApi.getBankAccountById(id);
        if (res.data?.success) {
          const account = res.data.data;
          setFormData({
            branch_id: account.branch_id || "",
            chart_account_id: account.chart_account_id || "",
            bank_name: account.bank_name || "",
            bank_branch_name: account.bank_branch_name || "",
            account_name: account.account_name || "",
            account_number: account.account_number || "",
            swift_code: account.swift_code || "",
            bank_code: account.bank_code || "",
            branch_code: account.branch_code || "",
            opening_balance: account.opening_balance || 0,
            is_default: account.is_default || false,
            status: account.status || "active"
          });
        }
      }
    } catch (error) {
      toast.error("Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: unknown) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (formData.opening_balance < 0) {
      toast.error("Opening Balance cannot be negative");
      return;
    }

    if (formData.is_default) {
      if (!window.confirm("Setting this as default will unset any existing default bank account. Proceed?")) {
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        branch_id: formData.branch_id ? parseInt(formData.branch_id) : undefined,
        chart_account_id: parseInt(formData.chart_account_id),
      };

      if (isEdit) {
        await financeApi.updateBankAccount(id, payload);
        toast.success("Bank account updated successfully");
      } else {
        await financeApi.createBankAccount(payload);
        toast.success("Bank account created successfully");
      }
      history.push("/admin/finance/bank-accounts");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save bank account");
    } finally {
      setSaving(false);
    }
  };

  const handleAiApply = (aiData: any) => {
    setFormData((prev: any) => {
      let matchedAccountId = prev.chart_account_id;
      if (aiData.chart_account_id) {
        matchedAccountId = String(aiData.chart_account_id);
      } else if (aiData.chart_account_name && chartAccounts.length > 0) {
        const match = (chartAccounts as any[]).find(
          (a: any) =>
            a.account_name?.toLowerCase().includes(aiData.chart_account_name.toLowerCase()) ||
            a.account_code === aiData.chart_account_code
        );
        if (match) matchedAccountId = String(match.id);
      } else if (chartAccounts.length > 0 && !matchedAccountId) {
        matchedAccountId = String((chartAccounts[0] as any).id);
      }

      return {
        ...prev,
        bank_name: aiData.bank_name || prev.bank_name,
        bank_branch_name: aiData.bank_branch_name || prev.bank_branch_name,
        account_name: aiData.account_name || prev.account_name,
        account_number: aiData.account_number || prev.account_number,
        swift_code: aiData.swift_code || prev.swift_code,
        bank_code: aiData.bank_code || prev.bank_code,
        branch_code: aiData.branch_code || prev.branch_code,
        opening_balance: aiData.opening_balance !== undefined ? Number(aiData.opening_balance) : prev.opening_balance,
        is_default: aiData.is_default !== undefined ? Boolean(aiData.is_default) : prev.is_default,
        chart_account_id: matchedAccountId
      };
    });
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="py-4 max-w-4xl mx-auto h-full overflow-y-auto space-y-6">
      <PageTitleCard
        title={isEdit ? "Edit Bank Account" : "Create Bank Account"}
        description={isEdit ? "Update banking credentials and chart of account mappings" : "Register corporate commercial bank accounts and ledger integrations"}
        backAction={() => history.push("/admin/finance/bank-accounts")}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:from-violet-700 hover:to-indigo-700 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>✨ AI Auto-Fill</span>
            </button>
            <button
              type="button"
              onClick={() => history.push("/admin/finance/bank-accounts")}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        }
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1">Branch</label>
              <select
                name="branch_id"
                value={formData.branch_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Company Level (No Branch)</option>
                {branches.map((b: unknown) => (
                  <option key={b.id} value={b.id}>{b.branch_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1">Chart Account *</label>
              <select
                name="chart_account_id"
                value={formData.chart_account_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Chart Account</option>
                {chartAccounts.map((a: unknown) => (
                  <option key={a.id} value={a.id}>{a.account_code} - {a.account_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1">Bank Name *</label>
              <input
                type="text"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1">Bank Branch Name</label>
              <input
                type="text"
                name="bank_branch_name"
                value={formData.bank_branch_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1">Account Name *</label>
              <input
                type="text"
                name="account_name"
                value={formData.account_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1">Account Number *</label>
              <input
                type="text"
                name="account_number"
                value={formData.account_number}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1">SWIFT Code</label>
              <input
                type="text"
                name="swift_code"
                value={formData.swift_code}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1">Bank Code</label>
              <input
                type="text"
                name="bank_code"
                value={formData.bank_code}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1">Branch Code</label>
              <input
                type="text"
                name="branch_code"
                value={formData.branch_code}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1">Opening Balance</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="opening_balance"
                value={formData.opening_balance}
                onChange={handleChange}
                disabled={isEdit}
                className="w-full px-3 py-2 border rounded-md bg-gray-50 disabled:text-gray-500"
              />
              {isEdit && <p className="text-xs text-gray-500 mt-1">Opening balance cannot be changed after creation.</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                id="is_default"
                name="is_default"
                checked={formData.is_default}
                onChange={handleChange}
                className="h-4 w-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
              />
              <label htmlFor="is_default" className="ml-2 block text-sm text-gray-900 ">
                Set as Default Bank Account
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t ">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 disabled:opacity-50"
            >
              {saving ? "Saving..." : isEdit ? "Update Bank Account" : "Create Bank Account"}
            </button>
          </div>
        </form>
      </div>

      <AiAutoFillModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        formType="bank_account"
        onApply={handleAiApply}
        contextData={{
          accounts: chartAccounts.map((a: any) => ({
            id: a.id,
            name: a.account_name,
            code: a.account_code,
          })),
        }}
      />
    </div>
  );
}
