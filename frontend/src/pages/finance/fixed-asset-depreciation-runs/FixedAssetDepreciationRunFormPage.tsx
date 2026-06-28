import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { financeApi } from "../../../api/financeApi";
import { controlApi } from "../../../api/controlApi";
import PageHeader from "../../../components/common/PageHeader";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { toast } from "sonner";
import DepreciationPreviewTable from "./DepreciationPreviewTable";

const FixedAssetDepreciationRunFormPage = () => {
  const history = useHistory();

  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [branches, setBranches] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [accountingPeriods, setAccountingPeriods] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  
  const [formData, setFormData] = useState({
    branch_id: "",
    financial_year_id: "",
    accounting_period_id: "",
    run_date: new Date().toISOString().split("T")[0],
    depreciation_from_date: "",
    depreciation_to_date: "",
    remarks: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [brRes, fyRes] = await Promise.all([
        controlApi.getBranches({ limit: 100 }),
        financeApi.getFinancialYears({ limit: 100, status: "open" })
      ]);
      setBranches(brRes.data?.data || []);
      setFinancialYears(fyRes.data?.data || []);
    } catch (err) {
      console.error("Failed to load initial data");
    }
  };

  const handleFinancialYearChange = async (fyId: string | number) => {
    setFormData({ ...formData, financial_year_id: fyId, accounting_period_id: "" });
    setAccountingPeriods([]);
    if (fyId) {
      try {
        const res = await financeApi.getAccountingPeriods({ financial_year_id: fyId, limit: 100, status: "open" });
        setAccountingPeriods(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load accounting periods");
      }
    }
  };

  const handleAccountingPeriodChange = (apId: string | number) => {
    const period = accountingPeriods.find((p: unknown) => p.id === Number(apId));
    setFormData({ 
      ...formData, 
      accounting_period_id: apId,
      depreciation_from_date: period ? period.start_date.split("T")[0] : "",
      depreciation_to_date: period ? period.end_date.split("T")[0] : ""
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.financial_year_id) newErrors.financial_year_id = "Financial Year is required";
    if (!formData.accounting_period_id) newErrors.accounting_period_id = "Accounting Period is required";
    if (!formData.run_date) newErrors.run_date = "Run Date is required";
    if (!formData.depreciation_from_date) newErrors.depreciation_from_date = "From Date is required";
    if (!formData.depreciation_to_date) newErrors.depreciation_to_date = "To Date is required";
    
    if (formData.depreciation_from_date && formData.depreciation_to_date) {
      if (new Date(formData.depreciation_from_date) > new Date(formData.depreciation_to_date)) {
        newErrors.depreciation_from_date = "From Date must be before To Date";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = async () => {
    if (!validate()) {
      toast.error("Please fill all required fields before previewing.");
      return;
    }

    try {
      setPreviewing(true);
      const payload = {
        branch_id: formData.branch_id ? Number(formData.branch_id) : null,
        financial_year_id: Number(formData.financial_year_id),
        accounting_period_id: Number(formData.accounting_period_id),
        run_date: formData.run_date,
        depreciation_from_date: formData.depreciation_from_date,
        depreciation_to_date: formData.depreciation_to_date,
        remarks: formData.remarks,
      };

      const res = await financeApi.previewFixedAssetDepreciation(payload);
      setPreviewData(res.data?.data || { lines: [], total_depreciation_amount: 0 });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate preview");
    } finally {
      setPreviewing(false);
    }
  };

  const handleSave = async () => {
    if (!previewData) {
      toast.error("Please preview depreciation first.");
      return;
    }

    if (previewData.lines?.length === 0) {
      toast.error("No eligible assets for depreciation. Cannot create run.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        branch_id: formData.branch_id ? Number(formData.branch_id) : null,
        financial_year_id: Number(formData.financial_year_id),
        accounting_period_id: Number(formData.accounting_period_id),
        run_date: formData.run_date,
        depreciation_from_date: formData.depreciation_from_date,
        depreciation_to_date: formData.depreciation_to_date,
        remarks: formData.remarks,
      };

      await financeApi.createFixedAssetDepreciationRun(payload);
      toast.success("Depreciation run created successfully");
      history.push("/admin/finance/fixed-asset-depreciation-runs");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create depreciation run");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-navy-900 pb-10 overflow-y-auto">
      <PageHeader
        title="Create Depreciation Run"
        breadcrumb={[
          { label: "Finance" },
          { label: "Depreciation Runs", path: "/admin/finance/fixed-asset-depreciation-runs" },
          { label: "Create" },
        ]}
      />

      <div className="px-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => history.push("/admin/finance/fixed-asset-depreciation-runs")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-navy-700 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to List
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handlePreview}
              disabled={previewing || saving}
              className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 transition-all rounded-xl hover:bg-gray-50 dark:bg-navy-800 dark:text-gray-300 dark:border-navy-600 dark:hover:bg-navy-700 shadow-sm disabled:opacity-50"
            >
              <Eye className="w-4 h-4" /> {previewing ? "Previewing..." : "Preview Depreciation"}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !previewData || previewData.lines?.length === 0}
              className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white transition-all bg-brand-500 rounded-xl hover:bg-brand-600 shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? "Creating..." : "Create Depreciation Run"}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6 mb-6">
          <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-6 border-b border-gray-100 dark:border-navy-700 pb-3">
            Run Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Branch (Optional)
              </label>
              <select
                className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all"
                value={formData.branch_id}
                onChange={(e: any) => setFormData({ ...formData, branch_id: e.target.value })}
              >
                <option value="">All Branches</option>
                {branches.map((b: unknown) => (
                  <option key={b.id} value={b.id}>{b.branch_code} - {b.branch_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Run Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={`w-full p-2.5 border rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all ${
                  errors.run_date ? "border-red-500" : "border-gray-200"
                }`}
                value={formData.run_date}
                onChange={(e: any) => setFormData({ ...formData, run_date: e.target.value })}
              />
              {errors.run_date && <span className="text-xs text-red-500 mt-1">{errors.run_date}</span>}
            </div>
            <div></div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Financial Year <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full p-2.5 border rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all ${
                  errors.financial_year_id ? "border-red-500" : "border-gray-200"
                }`}
                value={formData.financial_year_id}
                onChange={(e: any) => handleFinancialYearChange(e.target.value)}
              >
                <option value="">Select Financial Year</option>
                {financialYears.map((fy: unknown) => (
                  <option key={fy.id} value={fy.id}>{fy.year_name}</option>
                ))}
              </select>
              {errors.financial_year_id && <span className="text-xs text-red-500 mt-1">{errors.financial_year_id}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Accounting Period <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full p-2.5 border rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all ${
                  errors.accounting_period_id ? "border-red-500" : "border-gray-200"
                }`}
                value={formData.accounting_period_id}
                onChange={(e: any) => handleAccountingPeriodChange(e.target.value)}
                disabled={!formData.financial_year_id}
              >
                <option value="">Select Period</option>
                {accountingPeriods.map((ap: unknown) => (
                  <option key={ap.id} value={ap.id}>{ap.period_name}</option>
                ))}
              </select>
              {errors.accounting_period_id && <span className="text-xs text-red-500 mt-1">{errors.accounting_period_id}</span>}
            </div>
            <div></div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Depreciation From Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={`w-full p-2.5 border rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all ${
                  errors.depreciation_from_date ? "border-red-500" : "border-gray-200"
                }`}
                value={formData.depreciation_from_date}
                onChange={(e: any) => setFormData({ ...formData, depreciation_from_date: e.target.value })}
              />
              {errors.depreciation_from_date && <span className="text-xs text-red-500 mt-1">{errors.depreciation_from_date}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Depreciation To Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={`w-full p-2.5 border rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all ${
                  errors.depreciation_to_date ? "border-red-500" : "border-gray-200"
                }`}
                value={formData.depreciation_to_date}
                onChange={(e: any) => setFormData({ ...formData, depreciation_to_date: e.target.value })}
              />
              {errors.depreciation_to_date && <span className="text-xs text-red-500 mt-1">{errors.depreciation_to_date}</span>}
            </div>
            
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Remarks
              </label>
              <textarea
                className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all"
                placeholder="Enter remarks..."
                rows="2"
                value={formData.remarks}
                onChange={(e: any) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
          </div>
        </div>

        <DepreciationPreviewTable previewData={previewData} loading={previewing} />

      </div>
    </div>
  );
};

export default FixedAssetDepreciationRunFormPage;
