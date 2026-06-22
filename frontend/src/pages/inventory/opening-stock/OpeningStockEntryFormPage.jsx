import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Save, ArrowLeft } from "lucide-react";
import { inventoryApi } from "api/inventoryApi";
import { useAuth } from "auth/AuthContext";
import OpeningStockLinesTable from "./OpeningStockLinesTable";
import OpeningStockTotalsCard from "../../../components/inventory/OpeningStockTotalsCard";

const OpeningStockEntryFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission, branches } = useAuth();
  
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [accountingPeriods, setAccountingPeriods] = useState([]);
  
  const [formData, setFormData] = useState({
    branch_id: "",
    warehouse_id: "",
    opening_stock_date: new Date().toISOString().split('T')[0],
    reference_number: "",
    remarks: "",
    financial_year_id: "",
    accounting_period_id: "",
  });

  const [lines, setLines] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchLookups();
    if (isEdit) {
      fetchEntryDetails();
    }
  }, [id]);

  const fetchLookups = async () => {
    try {
      const wRes = await inventoryApi.getWarehouses({ limit: 1000, status: "active" });
      if (wRes.success !== false) {
        setWarehouses(wRes.data?.data || wRes.data || []);
      }
      
      // Attempt to load financial years/periods if available (optional in inventory scope)
      // Catch errors silently as they might not be accessible depending on active software
      try {
         // mock call or if there's an API, replace below
         // const fRes = await api.getFinancialYears();
         // setFinancialYears(fRes.data);
      } catch (e) {}
      
    } catch (err) {
      console.error("Failed to fetch lookups", err);
    }
  };

  const fetchEntryDetails = async () => {
    try {
      const res = await inventoryApi.getOpeningStockEntryById(id);
      const data = res.data?.data || res.data;
      if (data) {
        setFormData({
          branch_id: data.branch_id || "",
          warehouse_id: data.warehouse_id || "",
          opening_stock_date: data.opening_stock_date ? data.opening_stock_date.split('T')[0] : "",
          reference_number: data.reference_number || "",
          remarks: data.remarks || "",
          financial_year_id: data.financial_year_id || "",
          accounting_period_id: data.accounting_period_id || "",
        });
        
        // Map lines
        setLines((data.lines || []).map(line => ({
          ...line,
          product_id: line.product_id,
          product: line.product,
          product_batch_id: line.product_batch_id,
          batch: line.product_batch,
        })));
      }
    } catch (err) {
      toast.error("Failed to load opening stock entry");
      navigate("/admin/inventory/opening-stock");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    let totalQty = 0;
    let totalValue = 0;
    lines.forEach(line => {
      const qty = parseFloat(line.quantity) || 0;
      const cost = parseFloat(line.unit_cost) || 0;
      totalQty += qty;
      totalValue += qty * cost;
    });
    return { totalQty, totalValue };
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.branch_id) newErrors.branch_id = "Branch is required";
    if (!formData.warehouse_id) newErrors.warehouse_id = "Warehouse is required";
    if (!formData.opening_stock_date) newErrors.opening_stock_date = "Date is required";

    if (lines.length === 0) {
      newErrors.lines = "At least one line item is required";
    }

    lines.forEach((line, index) => {
      if (!line.product_id) {
        newErrors[`lines.${index}`] = { ...newErrors[`lines.${index}`], product_id: "Product is required" };
      }
      if (line.product?.requires_batch_tracking && !line.product_batch_id) {
        newErrors[`lines.${index}`] = { ...newErrors[`lines.${index}`], product_batch_id: "Batch is required" };
      }
      if (parseFloat(line.quantity) <= 0 || !line.quantity) {
        newErrors[`lines.${index}`] = { ...newErrors[`lines.${index}`], quantity: "Quantity must be > 0" };
      }
      if (parseFloat(line.unit_cost) < 0 || line.unit_cost === "") {
        newErrors[`lines.${index}`] = { ...newErrors[`lines.${index}`], unit_cost: "Unit cost cannot be negative" };
      }
    });

    const { totalQty, totalValue } = calculateTotals();
    if (totalQty === 0 && lines.length > 0) {
       newErrors.lines = "Total quantity must be greater than zero";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        branch_id: parseInt(formData.branch_id),
        warehouse_id: parseInt(formData.warehouse_id),
        financial_year_id: formData.financial_year_id ? parseInt(formData.financial_year_id) : undefined,
        accounting_period_id: formData.accounting_period_id ? parseInt(formData.accounting_period_id) : undefined,
        lines: lines.map((line, idx) => ({
          warehouse_location_id: line.warehouse_location_id ? parseInt(line.warehouse_location_id) : undefined,
          product_id: parseInt(line.product_id),
          product_batch_id: line.product_batch_id ? parseInt(line.product_batch_id) : undefined,
          quantity: parseFloat(line.quantity),
          unit_cost: parseFloat(line.unit_cost),
          line_remarks: line.line_remarks || "",
          line_order: idx + 1,
        })),
      };

      if (isEdit) {
        await inventoryApi.updateOpeningStockEntry(id, payload);
        toast.success("Opening Stock entry updated successfully");
      } else {
        await inventoryApi.createOpeningStockEntry(payload);
        toast.success("Opening Stock entry created successfully");
      }
      navigate("/admin/inventory/opening-stock");
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.errors || "Failed to save entry");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  const { totalQty, totalValue } = calculateTotals();

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/inventory/opening-stock")}
            className="p-2 bg-white dark:bg-navy-800 rounded-full shadow hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
              {isEdit ? "Edit Opening Stock" : "Create Opening Stock"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter initial inventory quantities and values
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm font-medium"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Draft"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Document Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Branch *
                </label>
                <select
                  value={formData.branch_id}
                  onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white ${errors.branch_id ? "border-red-500" : "border-gray-200 dark:border-navy-600"}`}
                >
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                </select>
                {errors.branch_id && <p className="text-xs text-red-500 mt-1">{errors.branch_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Warehouse *
                </label>
                <select
                  value={formData.warehouse_id}
                  onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white ${errors.warehouse_id ? "border-red-500" : "border-gray-200 dark:border-navy-600"}`}
                >
                  <option value="">Select Warehouse</option>
                  {warehouses
                    .filter(w => !formData.branch_id || w.branch_id === parseInt(formData.branch_id))
                    .map(w => <option key={w.id} value={w.id}>{w.warehouse_name}</option>)}
                </select>
                {errors.warehouse_id && <p className="text-xs text-red-500 mt-1">{errors.warehouse_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.opening_stock_date}
                  onChange={(e) => setFormData({ ...formData, opening_stock_date: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white ${errors.opening_stock_date ? "border-red-500" : "border-gray-200 dark:border-navy-600"}`}
                />
                {errors.opening_stock_date && <p className="text-xs text-red-500 mt-1">{errors.opening_stock_date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={formData.reference_number}
                  onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                  placeholder="Optional reference"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white"
                  placeholder="Enter optional remarks..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
            <OpeningStockLinesTable 
              lines={lines} 
              setLines={setLines} 
              warehouseId={formData.warehouse_id}
              errors={errors}
            />
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <OpeningStockTotalsCard 
            totalQuantity={totalQty}
            totalStockValue={totalValue}
            lineCount={lines.length}
          />
          
          <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Financial Context (Optional)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">
                  Financial Year
                </label>
                <select
                  value={formData.financial_year_id}
                  onChange={(e) => setFormData({ ...formData, financial_year_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-lg text-sm bg-gray-50 dark:bg-navy-900 text-gray-900 dark:text-white"
                  disabled={financialYears.length === 0}
                >
                  <option value="">None selected</option>
                  {financialYears.map(fy => <option key={fy.id} value={fy.id}>{fy.year_name}</option>)}
                </select>
                {financialYears.length === 0 && <p className="text-xs text-amber-500 mt-1">Lookup unavailable in current scope</p>}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">
                  Accounting Period
                </label>
                <select
                  value={formData.accounting_period_id}
                  onChange={(e) => setFormData({ ...formData, accounting_period_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-lg text-sm bg-gray-50 dark:bg-navy-900 text-gray-900 dark:text-white"
                  disabled={accountingPeriods.length === 0}
                >
                  <option value="">None selected</option>
                  {accountingPeriods.map(ap => <option key={ap.id} value={ap.id}>{ap.period_name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpeningStockEntryFormPage;
