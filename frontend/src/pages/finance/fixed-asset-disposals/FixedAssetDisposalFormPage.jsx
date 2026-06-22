import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../api/financeApi";
import PageHeader from "../../../components/common/PageHeader";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import FixedAssetSelect from "../../../components/finance/FixedAssetSelect";
import { GainLossBadge } from "../../../components/finance/FixedAssetBadges";

const FixedAssetDisposalFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const history = useHistory();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [selectedAssetDetails, setSelectedAssetDetails] = useState(null);
  
  const [formData, setFormData] = useState({
    fixed_asset_id: "",
    disposal_date: new Date().toISOString().split("T")[0],
    disposal_type: "sale",
    sale_value: 0,
    remarks: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      fetchDisposal();
    }
  }, [id]);

  const fetchDisposal = async () => {
    try {
      setLoading(true);
      const res = await financeApi.getFixedAssetDisposalById(id);
      const data = res.data?.data;
      if (data) {
        setFormData({
          fixed_asset_id: data.fixed_asset_id || "",
          disposal_date: data.disposal_date ? data.disposal_date.split("T")[0] : "",
          disposal_type: data.disposal_type || "sale",
          sale_value: data.sale_value || 0,
          remarks: data.remarks || "",
        });
        if (data.fixed_asset) {
          setSelectedAssetDetails(data.fixed_asset);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load disposal details");
      history.push("/admin/finance/fixed-asset-disposals");
    } finally {
      setLoading(false);
    }
  };

  const handleAssetChange = (assetId, assetFullData) => {
    setFormData({ ...formData, fixed_asset_id: assetId });
    setSelectedAssetDetails(assetFullData);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fixed_asset_id) newErrors.fixed_asset_id = "Asset is required";
    if (!formData.disposal_date) newErrors.disposal_date = "Disposal Date is required";
    if (!formData.disposal_type) newErrors.disposal_type = "Disposal Type is required";
    
    if (formData.disposal_type === "sale" && (formData.sale_value === "" || Number(formData.sale_value) < 0)) {
      newErrors.sale_value = "Valid Sale Value is required for a sale";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      const payload = {
        fixed_asset_id: Number(formData.fixed_asset_id),
        disposal_date: formData.disposal_date,
        disposal_type: formData.disposal_type,
        sale_value: formData.disposal_type === "sale" ? Number(formData.sale_value) : 0,
        remarks: formData.remarks,
      };

      if (isEdit) {
        await financeApi.updateFixedAssetDisposal(id, payload);
        toast.success("Asset disposal updated successfully");
      } else {
        await financeApi.createFixedAssetDisposal(payload);
        toast.success("Asset disposal recorded successfully");
      }
      history.push("/admin/finance/fixed-asset-disposals");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save asset disposal");
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

  const nbv = selectedAssetDetails ? Number(selectedAssetDetails.net_book_value || 0) : 0;
  const saleVal = formData.disposal_type === "sale" ? Number(formData.sale_value || 0) : 0;
  const gainLoss = saleVal - nbv;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-navy-900 pb-10 overflow-y-auto">
      <PageHeader
        title={isEdit ? "Edit Asset Disposal" : "Record Asset Disposal"}
        breadcrumb={[
          { label: "Finance" },
          { label: "Asset Disposals", path: "/admin/finance/fixed-asset-disposals" },
          { label: isEdit ? "Edit" : "Record" },
        ]}
      />

      <div className="px-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => history.push("/admin/finance/fixed-asset-disposals")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-navy-700 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to List
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white transition-all bg-brand-500 rounded-xl hover:bg-brand-600 shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Disposal"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
              <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-6 border-b border-gray-100 dark:border-navy-700 pb-3">
                Disposal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Asset <span className="text-red-500">*</span>
                  </label>
                  <FixedAssetSelect
                    value={formData.fixed_asset_id}
                    onChange={handleAssetChange}
                    error={errors.fixed_asset_id}
                    disabled={isEdit}
                    statusFilter="active"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Disposal Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full p-2.5 border rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all ${
                      errors.disposal_type ? "border-red-500" : "border-gray-200"
                    }`}
                    value={formData.disposal_type}
                    onChange={(e) => {
                      const type = e.target.value;
                      setFormData({ 
                        ...formData, 
                        disposal_type: type,
                        sale_value: type !== "sale" ? 0 : formData.sale_value
                      });
                    }}
                  >
                    <option value="sale">Sale</option>
                    <option value="write_off">Write-off</option>
                    <option value="scrap">Scrap</option>
                    <option value="lost">Lost/Stolen</option>
                    <option value="damaged">Damaged</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Disposal Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full p-2.5 border rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all ${
                      errors.disposal_date ? "border-red-500" : "border-gray-200"
                    }`}
                    value={formData.disposal_date}
                    onChange={(e) => setFormData({ ...formData, disposal_date: e.target.value })}
                  />
                  {errors.disposal_date && <span className="text-xs text-red-500 mt-1">{errors.disposal_date}</span>}
                </div>

                {formData.disposal_type === "sale" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sale Value (LKR) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      className={`w-full p-2.5 border rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all ${
                        errors.sale_value ? "border-red-500" : "border-gray-200"
                      }`}
                      value={formData.sale_value}
                      onChange={(e) => setFormData({ ...formData, sale_value: e.target.value })}
                    />
                    {errors.sale_value && <span className="text-xs text-red-500 mt-1">{errors.sale_value}</span>}
                  </div>
                )}
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Remarks
                  </label>
                  <textarea
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 dark:text-white transition-all"
                    placeholder="Reason for disposal..."
                    rows="3"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-brand-50 to-white dark:from-navy-800 dark:to-navy-900 rounded-2xl shadow-sm border border-brand-100 dark:border-brand-900/30 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-brand-700 dark:text-brand-400 mb-6">
                Disposal Impact Preview
              </h3>
              
              {!selectedAssetDetails ? (
                <div className="text-sm text-gray-500 text-center py-10">
                  Select an asset to view financial impact.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-brand-100 dark:border-brand-900/30 pb-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Net Book Value (NBV)</span>
                    <span className="font-bold text-navy-700 dark:text-white">
                      LKR {nbv.toLocaleString()}
                    </span>
                  </div>
                  
                  {formData.disposal_type === "sale" && (
                    <div className="flex justify-between items-center border-b border-brand-100 dark:border-brand-900/30 pb-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Sale Value</span>
                      <span className="font-medium text-green-600 dark:text-green-500">
                        LKR {saleVal.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-semibold text-brand-700 dark:text-brand-400">Gain / Loss Amount</span>
                    <div className="flex flex-col items-end">
                      <span className={`text-xl font-bold ${gainLoss > 0 ? "text-green-600 dark:text-green-400" : gainLoss < 0 ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}>
                        LKR {Math.abs(gainLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <div className="mt-1">
                        <GainLossBadge amount={gainLoss} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {selectedAssetDetails && (
              <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
                 <h3 className="text-sm font-bold text-navy-700 dark:text-white mb-4 border-b border-gray-100 dark:border-navy-700 pb-2">
                  Asset Accounting Context
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Acquisition Cost</span>
                    <span className="text-xs font-medium text-navy-700 dark:text-white">LKR {Number(selectedAssetDetails.acquisition_cost || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Acc. Depreciation</span>
                    <span className="text-xs font-medium text-navy-700 dark:text-white">LKR {Number(selectedAssetDetails.accumulated_depreciation || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-50 dark:border-navy-700/50">
                    <span className="text-xs text-gray-500">Gain on Disposal A/C</span>
                    <span className="text-xs font-medium text-navy-700 dark:text-white truncate max-w-[150px]">{selectedAssetDetails.gain_on_disposal_account_id ? "Configured" : "Missing"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Loss on Disposal A/C</span>
                    <span className="text-xs font-medium text-navy-700 dark:text-white truncate max-w-[150px]">{selectedAssetDetails.loss_on_disposal_account_id ? "Configured" : "Missing"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixedAssetDisposalFormPage;
