import { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../api/financeApi";
import { controlApi } from "../../../api/controlApi";
import PageHeader from "../../../components/common/PageHeader";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import ChartOfAccountSelect from "../../../components/finance/ChartOfAccountSelect";
import FixedAssetCategorySelect from "../../../components/finance/FixedAssetCategorySelect";

const FixedAssetFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const history = useHistory();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState([]);
  
  const [formData, setFormData] = useState({
    branch_id: "",
    fixed_asset_category_id: "",
    asset_code: "",
    asset_name: "",
    description: "",
    serial_number: "",
    model_number: "",
    manufacturer: "",
    purchase_date: "",
    acquisition_date: "",
    supplier_name: "",
    invoice_number: "",
    acquisition_cost: "",
    residual_value: 0,
    useful_life_months: "",
    depreciation_method: "straight_line",
    depreciation_start_date: "",
    asset_account_id: "",
    accumulated_depreciation_account_id: "",
    depreciation_expense_account_id: "",
    gain_on_disposal_account_id: "",
    loss_on_disposal_account_id: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchBranches();
    if (isEdit) {
      fetchAsset();
    }
  }, [id]);

  const fetchBranches = async () => {
    try {
      const res = await controlApi.getBranches({ limit: 100 });
      setBranches(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load branches");
    }
  };

  const fetchAsset = async () => {
    try {
      setLoading(true);
      const res = await financeApi.getFixedAssetById(id);
      const data = res.data?.data;
      if (data) {
        setFormData({
          branch_id: data.branch_id || "",
          fixed_asset_category_id: data.fixed_asset_category_id || "",
          asset_code: data.asset_code || "",
          asset_name: data.asset_name || "",
          description: data.description || "",
          serial_number: data.serial_number || "",
          model_number: data.model_number || "",
          manufacturer: data.manufacturer || "",
          purchase_date: data.purchase_date ? data.purchase_date.split("T")[0] : "",
          acquisition_date: data.acquisition_date ? data.acquisition_date.split("T")[0] : "",
          supplier_name: data.supplier_name || "",
          invoice_number: data.invoice_number || "",
          acquisition_cost: data.acquisition_cost || "",
          residual_value: data.residual_value || 0,
          useful_life_months: data.useful_life_months || "",
          depreciation_method: data.depreciation_method || "straight_line",
          depreciation_start_date: data.depreciation_start_date ? data.depreciation_start_date.split("T")[0] : "",
          asset_account_id: data.asset_account_id || "",
          accumulated_depreciation_account_id: data.accumulated_depreciation_account_id || "",
          depreciation_expense_account_id: data.depreciation_expense_account_id || "",
          gain_on_disposal_account_id: data.gain_on_disposal_account_id || "",
          loss_on_disposal_account_id: data.loss_on_disposal_account_id || "",
          status: data.status || "active",
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load asset details");
      history.push("/admin/finance/fixed-assets");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = async (categoryId: string | number) => {
    setFormData({ ...formData, fixed_asset_category_id: categoryId });
    if (categoryId && !isEdit) {
      try {
        const res = await financeApi.getFixedAssetCategoryById(categoryId);
        const category = res.data?.data;
        if (category) {
          setFormData((prev: unknown) => ({
            ...prev,
            useful_life_months: category.default_useful_life_months || prev.useful_life_months,
            depreciation_method: category.default_depreciation_method || prev.depreciation_method,
            asset_account_id: category.default_asset_account_id || prev.asset_account_id,
            accumulated_depreciation_account_id: category.default_accumulated_depreciation_account_id || prev.accumulated_depreciation_account_id,
            depreciation_expense_account_id: category.default_depreciation_expense_account_id || prev.depreciation_expense_account_id,
            gain_on_disposal_account_id: category.default_gain_on_disposal_account_id || prev.gain_on_disposal_account_id,
            loss_on_disposal_account_id: category.default_loss_on_disposal_account_id || prev.loss_on_disposal_account_id,
          }));
        }
      } catch (err) {
        console.error("Failed to load category defaults");
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.branch_id) newErrors.branch_id = "Branch is required";
    if (!formData.fixed_asset_category_id) newErrors.fixed_asset_category_id = "Category is required";
    if (!formData.asset_code?.trim()) newErrors.asset_code = "Asset Code is required";
    if (!formData.asset_name?.trim()) newErrors.asset_name = "Asset Name is required";
    if (!formData.purchase_date) newErrors.purchase_date = "Purchase Date is required";
    if (!formData.acquisition_date) newErrors.acquisition_date = "Acquisition Date is required";
    
    if (!formData.acquisition_cost || Number(formData.acquisition_cost) <= 0) {
      newErrors.acquisition_cost = "Acquisition Cost must be greater than zero";
    }
    
    if (formData.residual_value !== "" && Number(formData.residual_value) < 0) {
      newErrors.residual_value = "Cannot be negative";
    }
    
    if (Number(formData.residual_value) > Number(formData.acquisition_cost)) {
      newErrors.residual_value = "Cannot be greater than Acquisition Cost";
    }
    
    if (!formData.useful_life_months || Number(formData.useful_life_months) <= 0) {
      newErrors.useful_life_months = "Useful Life is required and must be > 0";
    }
    
    if (!formData.depreciation_start_date) newErrors.depreciation_start_date = "Depreciation Start Date is required";
    if (!formData.asset_account_id) newErrors.asset_account_id = "Asset Account is required";
    if (!formData.accumulated_depreciation_account_id) newErrors.accumulated_depreciation_account_id = "Accumulated Depreciation Account is required";
    if (!formData.depreciation_expense_account_id) newErrors.depreciation_expense_account_id = "Depreciation Expense Account is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error("Please fill all required fields correctly.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        branch_id: Number(formData.branch_id),
        acquisition_cost: Number(formData.acquisition_cost),
        residual_value: Number(formData.residual_value),
        useful_life_months: Number(formData.useful_life_months),
      };

      if (isEdit) {
        await financeApi.updateFixedAsset(id, payload);
        toast.success("Fixed asset updated successfully");
      } else {
        await financeApi.createFixedAsset(payload);
        toast.success("Fixed asset created successfully");
      }
      history.push("/admin/finance/fixed-assets");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save asset");
    } finally {
      setSaving(false);
    }
  };

  const depreciableAmount = Number(formData.acquisition_cost || 0) - Number(formData.residual_value || 0);
  const monthlyDepreciation = formData.useful_life_months ? depreciableAmount / Number(formData.useful_life_months) : 0;

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
        title={isEdit ? "Edit Fixed Asset" : "Create Fixed Asset"}
        breadcrumb={[
          { label: "Finance" },
          { label: "Fixed Assets", path: "/admin/finance/fixed-assets" },
          { label: isEdit ? "Edit" : "Create" },
        ]}
      />

      <div className="px-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => history.push("/admin/finance/fixed-assets")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-navy-700 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to List
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white transition-all bg-brand-500 rounded-xl hover:bg-brand-600 shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Asset"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Asset Details */}
            <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
              <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-6 border-b border-gray-100 dark:border-navy-700 pb-3">
                1. Basic Asset Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full p-2.5 border rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all ${
                      errors.branch_id ? "border-red-500" : "border-gray-200"
                    }`}
                    value={formData.branch_id}
                    onChange={(e: any) => setFormData({ ...formData, branch_id: e.target.value })}
                  >
                    <option value="">Select Branch</option>
                    {branches.map((b: unknown) => (
                      <option key={b.id} value={b.id}>{b.branch_code} - {b.branch_name}</option>
                    ))}
                  </select>
                  {errors.branch_id && <span className="text-xs text-red-500 mt-1">{errors.branch_id}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Asset Category <span className="text-red-500">*</span>
                  </label>
                  <FixedAssetCategorySelect
                    value={formData.fixed_asset_category_id}
                    onChange={handleCategoryChange}
                    error={errors.fixed_asset_category_id}
                    disabled={isEdit}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Asset Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full p-2.5 border rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all ${
                      errors.asset_code ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="e.g., FA-COMP-001"
                    value={formData.asset_code}
                    onChange={(e: any) => setFormData({ ...formData, asset_code: e.target.value })}
                  />
                  {errors.asset_code && <span className="text-xs text-red-500 mt-1">{errors.asset_code}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Asset Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full p-2.5 border rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all ${
                      errors.asset_name ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="e.g., Dell Latitude 5420"
                    value={formData.asset_name}
                    onChange={(e: any) => setFormData({ ...formData, asset_name: e.target.value })}
                  />
                  {errors.asset_name && <span className="text-xs text-red-500 mt-1">{errors.asset_name}</span>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all"
                    placeholder="Asset details..."
                    rows="2"
                    value={formData.description}
                    onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Serial Number</label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white"
                    value={formData.serial_number}
                    onChange={(e: any) => setFormData({ ...formData, serial_number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model Number</label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white"
                    value={formData.model_number}
                    onChange={(e: any) => setFormData({ ...formData, model_number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white"
                    value={formData.manufacturer}
                    onChange={(e: any) => setFormData({ ...formData, manufacturer: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Purchase Details */}
            <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
              <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-6 border-b border-gray-100 dark:border-navy-700 pb-3">
                2. Purchase & Acquisition
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Purchase Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full p-2.5 border rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all ${
                      errors.purchase_date ? "border-red-500" : "border-gray-200"
                    }`}
                    value={formData.purchase_date}
                    onChange={(e: any) => setFormData({ ...formData, purchase_date: e.target.value })}
                  />
                  {errors.purchase_date && <span className="text-xs text-red-500 mt-1">{errors.purchase_date}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Acquisition Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full p-2.5 border rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all ${
                      errors.acquisition_date ? "border-red-500" : "border-gray-200"
                    }`}
                    value={formData.acquisition_date}
                    onChange={(e: any) => setFormData({ ...formData, acquisition_date: e.target.value })}
                  />
                  {errors.acquisition_date && <span className="text-xs text-red-500 mt-1">{errors.acquisition_date}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supplier Name</label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white"
                    value={formData.supplier_name}
                    onChange={(e: any) => setFormData({ ...formData, supplier_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white"
                    value={formData.invoice_number}
                    onChange={(e: any) => setFormData({ ...formData, invoice_number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Acquisition Cost (LKR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className={`w-full p-2.5 border rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all ${
                      errors.acquisition_cost ? "border-red-500" : "border-gray-200"
                    }`}
                    value={formData.acquisition_cost}
                    onChange={(e: any) => setFormData({ ...formData, acquisition_cost: e.target.value })}
                  />
                  {errors.acquisition_cost && <span className="text-xs text-red-500 mt-1">{errors.acquisition_cost}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Residual Value (LKR)
                  </label>
                  <input
                    type="number"
                    className={`w-full p-2.5 border rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all ${
                      errors.residual_value ? "border-red-500" : "border-gray-200"
                    }`}
                    value={formData.residual_value}
                    onChange={(e: any) => setFormData({ ...formData, residual_value: e.target.value })}
                  />
                  {errors.residual_value && <span className="text-xs text-red-500 mt-1">{errors.residual_value}</span>}
                </div>
              </div>
            </div>

            {/* Depreciation Setup */}
            <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
              <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-6 border-b border-gray-100 dark:border-navy-700 pb-3">
                3. Depreciation Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Useful Life (Months) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className={`w-full p-2.5 border rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all ${
                      errors.useful_life_months ? "border-red-500" : "border-gray-200"
                    }`}
                    value={formData.useful_life_months}
                    onChange={(e: any) => setFormData({ ...formData, useful_life_months: e.target.value })}
                  />
                  {errors.useful_life_months && <span className="text-xs text-red-500 mt-1">{errors.useful_life_months}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Depreciation Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full p-2.5 border rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all ${
                      errors.depreciation_start_date ? "border-red-500" : "border-gray-200"
                    }`}
                    value={formData.depreciation_start_date}
                    onChange={(e: any) => setFormData({ ...formData, depreciation_start_date: e.target.value })}
                  />
                  {errors.depreciation_start_date && <span className="text-xs text-red-500 mt-1">{errors.depreciation_start_date}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Depreciation Method
                  </label>
                  <input
                    type="text"
                    disabled
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 dark:bg-navy-900/50 dark:border-navy-700 text-gray-500"
                    value="Straight Line"
                  />
                </div>
              </div>
            </div>

            {/* Accounting Setup */}
            <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
              <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-6 border-b border-gray-100 dark:border-navy-700 pb-3">
                4. Accounting Integration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Asset Account <span className="text-red-500">*</span>
                  </label>
                  <ChartOfAccountSelect
                    value={formData.asset_account_id}
                    onChange={(val: unknown) => setFormData({ ...formData, asset_account_id: val })}
                    error={errors.asset_account_id}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Accumulated Depreciation Account <span className="text-red-500">*</span>
                  </label>
                  <ChartOfAccountSelect
                    value={formData.accumulated_depreciation_account_id}
                    onChange={(val: unknown) => setFormData({ ...formData, accumulated_depreciation_account_id: val })}
                    error={errors.accumulated_depreciation_account_id}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Depreciation Expense Account <span className="text-red-500">*</span>
                  </label>
                  <ChartOfAccountSelect
                    value={formData.depreciation_expense_account_id}
                    onChange={(val: unknown) => setFormData({ ...formData, depreciation_expense_account_id: val })}
                    error={errors.depreciation_expense_account_id}
                  />
                </div>
                <div></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gain on Disposal Account</label>
                  <ChartOfAccountSelect
                    value={formData.gain_on_disposal_account_id}
                    onChange={(val: unknown) => setFormData({ ...formData, gain_on_disposal_account_id: val })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loss on Disposal Account</label>
                  <ChartOfAccountSelect
                    value={formData.loss_on_disposal_account_id}
                    onChange={(val: unknown) => setFormData({ ...formData, loss_on_disposal_account_id: val })}
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

          <div className="lg:col-span-1 space-y-6">
            {/* Live Financial Summary */}
            <div className="bg-gradient-to-br from-brand-50 to-white dark:from-navy-800 dark:to-navy-900 rounded-2xl shadow-sm border border-brand-100 dark:border-brand-900/30 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-brand-700 dark:text-brand-400 mb-6">
                Financial Preview
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-brand-100 dark:border-brand-900/30 pb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Acquisition Cost</span>
                  <span className="font-bold text-navy-700 dark:text-white">
                    LKR {Number(formData.acquisition_cost || 0).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center border-b border-brand-100 dark:border-brand-900/30 pb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Residual Value</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    LKR {Number(formData.residual_value || 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-brand-100 dark:border-brand-900/30 pb-3">
                  <span className="text-sm font-semibold text-brand-700 dark:text-brand-400">Depreciable Amount</span>
                  <span className="font-bold text-brand-700 dark:text-brand-400">
                    LKR {depreciableAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Depr.</span>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    LKR {monthlyDepreciation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixedAssetFormPage;
