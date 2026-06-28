import { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../api/financeApi";
import PageHeader from "../../../components/common/PageHeader";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import ChartOfAccountSelect from "../../../components/finance/ChartOfAccountSelect";

const FixedAssetCategoryFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const history = useHistory();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    category_code: "",
    category_name: "",
    description: "",
    default_asset_account_id: null,
    default_accumulated_depreciation_account_id: null,
    default_depreciation_expense_account_id: null,
    default_gain_on_disposal_account_id: null,
    default_loss_on_disposal_account_id: null,
    default_useful_life_months: "",
    default_depreciation_method: "straight_line",
    status: "active",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const res = await financeApi.getFixedAssetCategoryById(id);
      const data = res.data?.data;
      if (data) {
        setFormData({
          category_code: data.category_code || "",
          category_name: data.category_name || "",
          description: data.description || "",
          default_asset_account_id: data.default_asset_account_id || null,
          default_accumulated_depreciation_account_id: data.default_accumulated_depreciation_account_id || null,
          default_depreciation_expense_account_id: data.default_depreciation_expense_account_id || null,
          default_gain_on_disposal_account_id: data.default_gain_on_disposal_account_id || null,
          default_loss_on_disposal_account_id: data.default_loss_on_disposal_account_id || null,
          default_useful_life_months: data.default_useful_life_months || "",
          default_depreciation_method: data.default_depreciation_method || "straight_line",
          status: data.status || "active",
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load category details");
      history.push("/admin/finance/fixed-asset-categories");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.category_code?.trim()) newErrors.category_code = "Category Code is required";
    if (!formData.category_name?.trim()) newErrors.category_name = "Category Name is required";
    if (!formData.default_asset_account_id) newErrors.default_asset_account_id = "Default Asset Account is required";
    if (!formData.default_accumulated_depreciation_account_id) newErrors.default_accumulated_depreciation_account_id = "Accumulated Depreciation Account is required";
    if (!formData.default_depreciation_expense_account_id) newErrors.default_depreciation_expense_account_id = "Depreciation Expense Account is required";
    
    if (!formData.default_useful_life_months) {
      newErrors.default_useful_life_months = "Useful Life is required";
    } else if (Number(formData.default_useful_life_months) <= 0) {
      newErrors.default_useful_life_months = "Must be greater than zero";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      const payload = {
        ...formData,
        default_useful_life_months: Number(formData.default_useful_life_months),
      };

      if (isEdit) {
        await financeApi.updateFixedAssetCategory(id, payload);
        toast.success("Fixed asset category updated successfully");
      } else {
        await financeApi.createFixedAssetCategory(payload);
        toast.success("Fixed asset category created successfully");
      }
      history.push("/admin/finance/fixed-asset-categories");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-navy-900 pb-10 overflow-y-auto">
      <PageHeader
        title={isEdit ? "Edit Category" : "Create Category"}
        breadcrumb={[
          { label: "Finance" },
          { label: "Fixed Asset Categories", path: "/admin/finance/fixed-asset-categories" },
          { label: isEdit ? "Edit" : "Create" },
        ]}
      />

      <div className="px-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => history.push("/admin/finance/fixed-asset-categories")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-navy-700 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to List
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white transition-all bg-brand-500 rounded-xl hover:bg-brand-600 shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Category"}
          </button>
        </div>

        {isEdit && (
          <div className="p-4 mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <span className="font-bold">Note:</span> Updating category default accounts or useful life will <span className="font-bold">not</span> automatically update existing fixed assets linked to this category.
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6 mb-6">
          <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-6 border-b border-gray-100 dark:border-navy-700 pb-3">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full p-2.5 border rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all ${
                  errors.category_code ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="e.g., COMP"
                value={formData.category_code}
                onChange={(e: any) => setFormData({ ...formData, category_code: e.target.value })}
              />
              {errors.category_code && <span className="text-xs text-red-500 mt-1">{errors.category_code}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full p-2.5 border rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all ${
                  errors.category_name ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="e.g., Computers and IT Equipment"
                value={formData.category_name}
                onChange={(e: any) => setFormData({ ...formData, category_name: e.target.value })}
              />
              {errors.category_name && <span className="text-xs text-red-500 mt-1">{errors.category_name}</span>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all"
                placeholder="Enter description..."
                rows="2"
                value={formData.description}
                onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6 mb-6">
          <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-6 border-b border-gray-100 dark:border-navy-700 pb-3">
            Depreciation Setup
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Default Useful Life (Months) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className={`w-full p-2.5 border rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all ${
                  errors.default_useful_life_months ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="e.g., 36"
                value={formData.default_useful_life_months}
                onChange={(e: any) => setFormData({ ...formData, default_useful_life_months: e.target.value })}
              />
              {errors.default_useful_life_months && <span className="text-xs text-red-500 mt-1">{errors.default_useful_life_months}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Default Depreciation Method <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all"
                value={formData.default_depreciation_method}
                onChange={(e: any) => setFormData({ ...formData, default_depreciation_method: e.target.value })}
              >
                <option value="straight_line">Straight Line</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6 mb-6">
          <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-6 border-b border-gray-100 dark:border-navy-700 pb-3">
            Accounting Integration (Chart of Accounts)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Default Asset Account <span className="text-red-500">*</span>
              </label>
              <ChartOfAccountSelect
                value={formData.default_asset_account_id}
                onChange={(val: unknown) => setFormData({ ...formData, default_asset_account_id: val })}
                error={errors.default_asset_account_id}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Default Accumulated Depreciation Account <span className="text-red-500">*</span>
              </label>
              <ChartOfAccountSelect
                value={formData.default_accumulated_depreciation_account_id}
                onChange={(val: unknown) => setFormData({ ...formData, default_accumulated_depreciation_account_id: val })}
                error={errors.default_accumulated_depreciation_account_id}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Default Depreciation Expense Account <span className="text-red-500">*</span>
              </label>
              <ChartOfAccountSelect
                value={formData.default_depreciation_expense_account_id}
                onChange={(val: unknown) => setFormData({ ...formData, default_depreciation_expense_account_id: val })}
                error={errors.default_depreciation_expense_account_id}
              />
            </div>
            <div></div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Default Gain on Disposal Account
              </label>
              <ChartOfAccountSelect
                value={formData.default_gain_on_disposal_account_id}
                onChange={(val: unknown) => setFormData({ ...formData, default_gain_on_disposal_account_id: val })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Default Loss on Disposal Account
              </label>
              <ChartOfAccountSelect
                value={formData.default_loss_on_disposal_account_id}
                onChange={(val: unknown) => setFormData({ ...formData, default_loss_on_disposal_account_id: val })}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all"
                value={formData.status}
                onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FixedAssetCategoryFormPage;
