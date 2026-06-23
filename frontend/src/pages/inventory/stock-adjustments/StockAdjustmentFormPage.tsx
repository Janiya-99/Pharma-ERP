import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { inventoryApi } from "../../../api/inventoryApi";
import { toast } from "react-hot-toast";
import { ArrowLeft, Save } from "lucide-react";
import StockAdjustmentLinesTable from "./StockAdjustmentLinesTable";

const StockAdjustmentFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    warehouse_id: "",
    adjustment_type: "mixed",
    adjustment_date: new Date().toISOString().split("T")[0],
    reference_no: "",
    remarks: "",
  });

  const [lines, setLines] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchWarehouses();
    if (isEditMode) {
      fetchAdjustment();
    } else {
      setLines([{
        id: `temp-${Date.now()}`,
        product_id: null,
        product: null,
        product_batch_id: null,
        batch: null,
        warehouse_location_id: "",
        adjustment_direction: "in",
        system_quantity: 0,
        physical_quantity: "",
        variance_quantity: 0,
        unit_cost: 0,
        stock_balance_loading: false,
        stock_balance_data: null,
        reason: "",
      }]);
    }
  }, [id]);

  const fetchWarehouses = async () => {
    try {
      const res = await inventoryApi.getWarehouses({ limit: 1000, status: "active" });
      if (res.success !== false) {
        setWarehouses(res.data?.data || res.data || []);
      }
    } catch (err) {}
  };

  const fetchAdjustment = async () => {
    try {
      setLoading(true);
      const res = await inventoryApi.getStockAdjustmentById(id);
      if (res.success !== false) {
        const adjustment = res.data;
        if (adjustment.approval_status !== "draft" && adjustment.approval_status !== "rejected") {
          toast.error("Only draft or rejected adjustments can be edited");
          navigate("/inventory/stock-adjustments");
          return;
        }

        setFormData({
          warehouse_id: adjustment.warehouse_id,
          adjustment_type: adjustment.adjustment_type,
          adjustment_date: adjustment.adjustment_date ? adjustment.adjustment_date.split("T")[0] : "",
          reference_no: adjustment.reference_no || "",
          remarks: adjustment.remarks || "",
        });

        if (adjustment.lines) {
          setLines(adjustment.lines.map((l: unknown) => ({
            id: l.id,
            product_id: l.product_id,
            product: l.product,
            product_batch_id: l.product_batch_id,
            batch: l.product_batch,
            warehouse_location_id: l.warehouse_location_id,
            adjustment_direction: l.adjustment_direction,
            system_quantity: parseFloat(l.system_quantity || 0),
            physical_quantity: l.physical_quantity !== null ? parseFloat(l.physical_quantity) : "",
            variance_quantity: parseFloat(l.variance_quantity || 0),
            unit_cost: parseFloat(l.unit_cost || 0),
            reason: l.reason || "",
            stock_balance_loading: false,
            stock_balance_data: null,
          })));
        }
      }
    } catch (err) {
      toast.error("Failed to load adjustment");
      navigate("/inventory/stock-adjustments");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    
    // When changing adjustment type, we might want to reset directions of existing lines
    if (name === "adjustment_type") {
      setLines((prev: unknown) => prev.map((l: unknown) => {
        let dir = l.adjustment_direction;
        let vqty = Math.abs(l.variance_quantity || 0);
        
        if (value === "positive") dir = "in";
        else if (value === "negative" || value === "damage" || value === "expiry") dir = "out";
        else if (value === "physical_count") {
           // physical count depends on physical_quantity vs system_quantity
           if (String(l.physical_quantity || "").trim() !== "") {
             const phys = parseFloat(l.physical_quantity);
             const variance = Number((phys - l.system_quantity).toFixed(3));
             dir = variance >= 0 ? "in" : "out";
             vqty = Math.abs(variance);
           }
        }
        
        return {
          ...l,
          adjustment_direction: dir,
          variance_quantity: dir === "in" ? vqty : -vqty
        };
      }));
    }

    setFormData((prev: unknown) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: unknown) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.warehouse_id) newErrors.warehouse_id = "Warehouse is required";
    if (!formData.adjustment_type) newErrors.adjustment_type = "Adjustment type is required";
    if (!formData.adjustment_date) newErrors.adjustment_date = "Adjustment date is required";

    if (lines.length === 0) {
      newErrors.lines = "At least one line item is required";
    }

    lines.forEach((line: unknown, index: unknown) => {
      if (!line.product_id) newErrors[`lines.${index}.product_id`] = "Required";
      if (line.product?.requires_batch_tracking && !line.product_batch_id) {
        newErrors[`lines.${index}.product_batch_id`] = "Required";
      }
      if (!line.warehouse_location_id) newErrors[`lines.${index}.warehouse_location_id`] = "Required";
      
      if (formData.adjustment_type === "physical_count") {
        if (String(line.physical_quantity).trim() === "") {
          newErrors[`lines.${index}.physical_quantity`] = "Required";
        }
      } else {
        if (!line.variance_quantity || parseFloat(line.variance_quantity) === 0) {
          newErrors[`lines.${index}.variance_quantity`] = "Cannot be 0";
        }
      }

      // Check available stock if direction is out
      if (line.adjustment_direction === "out" && line.stock_balance_data) {
        const outQty = Math.abs(parseFloat(line.variance_quantity || 0));
        const available = parseFloat(line.stock_balance_data.quantity_on_hand || 0); // System quantity is usually what we use as base for physical count or adjustment
        if (outQty > available) {
          newErrors[`lines.${index}.variance_quantity`] = `Exceeds stock (${available})`;
          newErrors[`lines.${index}.physical_quantity`] = `Exceeds stock (${available})`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        warehouse_id: parseInt(formData.warehouse_id),
        adjustment_type: formData.adjustment_type,
        adjustment_date: new Date(formData.adjustment_date).toISOString(),
        reference_no: formData.reference_no,
        remarks: formData.remarks,
        lines: lines.map((l: unknown) => ({
          product_id: parseInt(l.product_id),
          product_batch_id: l.product_batch_id ? parseInt(l.product_batch_id) : null,
          warehouse_location_id: parseInt(l.warehouse_location_id),
          adjustment_direction: l.adjustment_direction,
          system_quantity: parseFloat(l.system_quantity || 0),
          physical_quantity: formData.adjustment_type === "physical_count" && String(l.physical_quantity).trim() !== "" ? parseFloat(l.physical_quantity) : null,
          variance_quantity: parseFloat(l.variance_quantity || 0),
          unit_cost: parseFloat(l.unit_cost || 0),
          reason: l.reason || "",
        })),
      };

      if (isEditMode) {
        await inventoryApi.updateStockAdjustment(id, payload);
        toast.success("Stock adjustment updated successfully");
      } else {
        await inventoryApi.createStockAdjustment(payload);
        toast.success("Stock adjustment created successfully");
      }
      navigate("/inventory/stock-adjustments");
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/inventory/stock-adjustments")}
          className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg dark:bg-navy-800 dark:border-navy-700 dark:hover:text-gray-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? "Edit Stock Adjustment" : "New Stock Adjustment"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isEditMode ? "Update draft adjustment details" : "Create a new stock adjustment draft"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Section */}
        <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Adjustment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Warehouse *
              </label>
              <select
                name="warehouse_id"
                value={formData.warehouse_id}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white ${
                  errors.warehouse_id ? "border-red-500" : "border-gray-200 dark:border-navy-600"
                }`}
              >
                <option value="">Select Warehouse...</option>
                {warehouses.map((w: unknown) => (
                  <option key={w.id} value={w.id}>{w.warehouse_name}</option>
                ))}
              </select>
              {errors.warehouse_id && <p className="mt-1 text-sm text-red-500">{errors.warehouse_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Adjustment Type *
              </label>
              <select
                name="adjustment_type"
                value={formData.adjustment_type}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white ${
                  errors.adjustment_type ? "border-red-500" : "border-gray-200 dark:border-navy-600"
                }`}
              >
                <option value="positive">Positive (Increase Stock)</option>
                <option value="negative">Negative (Decrease Stock)</option>
                <option value="mixed">Mixed (Both In/Out)</option>
                <option value="physical_count">Physical Count</option>
                <option value="damage">Damage (Decrease Stock)</option>
                <option value="expiry">Expiry (Decrease Stock)</option>
                <option value="correction">System Correction</option>
              </select>
              {errors.adjustment_type && <p className="mt-1 text-sm text-red-500">{errors.adjustment_type}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Adjustment Date *
              </label>
              <input
                type="date"
                name="adjustment_date"
                value={formData.adjustment_date}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white ${
                  errors.adjustment_date ? "border-red-500" : "border-gray-200 dark:border-navy-600"
                }`}
              />
              {errors.adjustment_date && <p className="mt-1 text-sm text-red-500">{errors.adjustment_date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reference No
              </label>
              <input
                type="text"
                name="reference_no"
                value={formData.reference_no}
                onChange={handleChange}
                placeholder="e.g. Audit #123"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={2}
                placeholder="Reason for adjustment..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Lines Section */}
        <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
          {!formData.warehouse_id ? (
            <div className="text-center py-8 text-gray-500">
              Please select a Warehouse to manage adjustment lines.
            </div>
          ) : (
            <StockAdjustmentLinesTable
              lines={lines}
              setLines={setLines}
              warehouseId={parseInt(formData.warehouse_id)}
              adjustmentType={formData.adjustment_type}
              errors={errors}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/inventory/stock-adjustments")}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-navy-800 dark:border-navy-600 dark:text-gray-200 dark:hover:bg-navy-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 focus:ring-4 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-brand-500/20"
          >
            <Save className="w-5 h-5" />
            {saving ? "Saving..." : "Save Draft"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StockAdjustmentFormPage;
