import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { inventoryApi } from "../../../api/inventoryApi";
import { getBranches } from "../../../api/controlApi";
import { useAuth } from "../../../auth/AuthContext";
import { toast } from "react-hot-toast";
import { ArrowLeft, Save } from "lucide-react";
import StockAdjustmentLinesTable from "./StockAdjustmentLinesTable";

const StockAdjustmentFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    branch_id: "",
    warehouse_id: "",
    adjustment_type: "mixed",
    adjustment_date: new Date().toISOString().split("T")[0],
    reference_number: "",
    reason: "",
    remarks: "",
  });

  const [lines, setLines] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const requiredPermission = isEditMode
      ? "inventory.stock_adjustment.update"
      : "inventory.stock_adjustment.create";
    if (!hasPermission(requiredPermission)) {
      toast.error("You do not have permission to access this page");
      navigate("/inventory/stock-adjustments");
    }
  }, [isEditMode, hasPermission]);

  useEffect(() => {
    fetchBranchesAndWarehouses();
    if (isEditMode) {
      fetchAdjustment();
    } else {
      setLines([
        {
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
          line_reason: "",
          line_remarks: "",
        },
      ]);
    }
  }, [id]);

  const fetchBranchesAndWarehouses = async () => {
    try {
      const [branchesRes, warehousesRes] = await Promise.all([
        getBranches({ limit: 100 }),
        inventoryApi.getWarehouses({ limit: 1000, status: "active" }),
      ]);
      if (branchesRes.success !== false) {
        setBranches(branchesRes.data?.data || branchesRes.data || []);
      }
      if (warehousesRes.success !== false) {
        setWarehouses(warehousesRes.data?.data || warehousesRes.data || []);
      }
    } catch (err) {
      console.error("Failed to load branches and warehouses", err);
    }
  };

  const fetchAdjustment = async () => {
    try {
      setLoading(true);
      const res = await inventoryApi.getStockAdjustmentById(id);
      if (res.success !== false) {
        const adjustment = res.data;
        if (
          adjustment.approval_status !== "draft" &&
          adjustment.approval_status !== "rejected"
        ) {
          toast.error("Only draft or rejected adjustments can be edited");
          navigate("/inventory/stock-adjustments");
          return;
        }

        setFormData({
          branch_id: String(
            adjustment.branch_id || adjustment.warehouse?.branch_id || ""
          ),
          warehouse_id: String(adjustment.warehouse_id),
          adjustment_type: adjustment.adjustment_type,
          adjustment_date: adjustment.adjustment_date
            ? adjustment.adjustment_date.split("T")[0]
            : "",
          reference_number:
            adjustment.reference_number || adjustment.reference_no || "",
          reason: adjustment.reason || "",
          remarks: adjustment.remarks || "",
        });

        if (adjustment.lines) {
          setLines(
            adjustment.lines.map((l: any) => ({
              id: l.id,
              product_id: l.product_id,
              product: l.product,
              product_batch_id: l.product_batch_id,
              batch: l.product_batch || l.batch,
              warehouse_location_id: l.warehouse_location_id,
              adjustment_direction: l.adjustment_direction,
              system_quantity: parseFloat(l.system_quantity || 0),
              physical_quantity:
                l.physical_quantity !== null
                  ? parseFloat(l.physical_quantity)
                  : "",
              variance_quantity: parseFloat(
                l.quantity !== undefined ? l.quantity : l.variance_quantity || 0
              ),
              unit_cost: parseFloat(l.unit_cost || 0),
              line_reason: l.line_reason || l.reason || "",
              line_remarks: l.line_remarks || l.remarks || "",
              stock_balance_loading: false,
              stock_balance_data: null,
            }))
          );
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

    if (name === "branch_id") {
      setFormData((prev) => ({ ...prev, branch_id: value, warehouse_id: "" }));
      setLines((prev) =>
        prev.map((l) => ({
          ...l,
          warehouse_location_id: "",
          stock_balance_data: null,
        }))
      );
      return;
    }

    if (name === "warehouse_id") {
      setFormData((prev) => ({ ...prev, warehouse_id: value }));
      setLines((prev) =>
        prev.map((l) => ({
          ...l,
          warehouse_location_id: "",
          stock_balance_data: null,
        }))
      );
      return;
    }

    if (name === "adjustment_type") {
      setLines((prev) =>
        prev.map((l) => {
          let dir = l.adjustment_direction;
          let vqty = Math.abs(l.variance_quantity || 0);

          if (value === "positive") dir = "in";
          else if (
            value === "negative" ||
            value === "damage" ||
            value === "expiry"
          )
            dir = "out";
          else if (value === "physical_count") {
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
            variance_quantity: dir === "in" ? vqty : -vqty,
          };
        })
      );
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.branch_id) newErrors.branch_id = "Branch is required";
    if (!formData.warehouse_id)
      newErrors.warehouse_id = "Warehouse is required";
    if (!formData.adjustment_type)
      newErrors.adjustment_type = "Adjustment type is required";
    if (!formData.adjustment_date)
      newErrors.adjustment_date = "Adjustment date is required";

    if (lines.length === 0) {
      newErrors.lines = "At least one line item is required";
    }

    lines.forEach((line: any, index: number) => {
      if (!line.product_id) newErrors[`lines.${index}.product_id`] = "Required";
      if (line.product?.requires_batch_tracking && !line.product_batch_id) {
        newErrors[`lines.${index}.product_batch_id`] = "Required";
      }
      if (!line.warehouse_location_id)
        newErrors[`lines.${index}.warehouse_location_id`] = "Required";

      if (formData.adjustment_type === "physical_count") {
        if (String(line.physical_quantity).trim() === "") {
          newErrors[`lines.${index}.physical_quantity`] = "Required";
        }
      } else {
        if (
          !line.variance_quantity ||
          parseFloat(line.variance_quantity) === 0
        ) {
          newErrors[`lines.${index}.variance_quantity`] = "Cannot be 0";
        }
      }

      if (line.adjustment_direction === "out" && line.stock_balance_data) {
        const outQty = Math.abs(parseFloat(line.variance_quantity || 0));
        const available = parseFloat(
          line.stock_balance_data.quantity_available !== undefined
            ? line.stock_balance_data.quantity_available
            : line.stock_balance_data.quantity_on_hand || 0
        );
        if (outQty > available) {
          newErrors[
            `lines.${index}.variance_quantity`
          ] = `Exceeds stock (${available})`;
          newErrors[
            `lines.${index}.physical_quantity`
          ] = `Exceeds stock (${available})`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        branch_id: parseInt(formData.branch_id),
        warehouse_id: parseInt(formData.warehouse_id),
        adjustment_type: formData.adjustment_type,
        adjustment_date: new Date(formData.adjustment_date).toISOString(),
        reference_number: formData.reference_number,
        reason: formData.reason,
        remarks: formData.remarks,
        lines: lines.map((l: any) => ({
          product_id: parseInt(l.product_id),
          product_batch_id: l.product_batch_id
            ? parseInt(l.product_batch_id)
            : null,
          warehouse_location_id: parseInt(l.warehouse_location_id),
          adjustment_direction: l.adjustment_direction,
          system_quantity: parseFloat(l.system_quantity || 0),
          physical_quantity:
            formData.adjustment_type === "physical_count" &&
            String(l.physical_quantity).trim() !== ""
              ? parseFloat(l.physical_quantity)
              : null,
          quantity: parseFloat(l.variance_quantity || 0),
          unit_cost: parseFloat(l.unit_cost || 0),
          line_reason: l.line_reason || "",
          line_remarks: l.line_remarks || "",
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
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const filteredWarehouses = formData.branch_id
    ? warehouses.filter(
        (w: any) => String(w.branch_id) === String(formData.branch_id)
      )
    : warehouses;

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="mx-auto max-w-[1600px] p-6 pb-24">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate("/inventory/stock-adjustments")}
          className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:text-gray-700 dark:border-navy-700 dark:bg-navy-800 dark:hover:text-gray-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? "Edit Stock Adjustment" : "New Stock Adjustment"}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isEditMode
              ? "Update draft adjustment details"
              : "Create a new stock adjustment draft"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Section */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Adjustment Details
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Branch *
              </label>
              <select
                name="branch_id"
                value={formData.branch_id}
                onChange={handleChange}
                className={`w-full rounded-lg border bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-brand-500 dark:bg-navy-900 dark:text-white ${
                  errors.branch_id
                    ? "border-red-500"
                    : "border-gray-200 dark:border-navy-600"
                }`}
              >
                <option value="">Select Branch...</option>
                {branches.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.branch_name}
                  </option>
                ))}
              </select>
              {errors.branch_id && (
                <p className="mt-1 text-sm text-red-500">{errors.branch_id}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Warehouse *
              </label>
              <select
                name="warehouse_id"
                value={formData.warehouse_id}
                onChange={handleChange}
                disabled={!formData.branch_id}
                className={`w-full rounded-lg border bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-brand-500 dark:bg-navy-900 dark:text-white ${
                  errors.warehouse_id
                    ? "border-red-500"
                    : "border-gray-200 dark:border-navy-600"
                } ${
                  !formData.branch_id ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                <option value="">Select Warehouse...</option>
                {filteredWarehouses.map((w: any) => (
                  <option key={w.id} value={w.id}>
                    {w.warehouse_name}
                  </option>
                ))}
              </select>
              {errors.warehouse_id && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.warehouse_id}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Adjustment Type *
              </label>
              <select
                name="adjustment_type"
                value={formData.adjustment_type}
                onChange={handleChange}
                className={`w-full rounded-lg border bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-brand-500 dark:bg-navy-900 dark:text-white ${
                  errors.adjustment_type
                    ? "border-red-500"
                    : "border-gray-200 dark:border-navy-600"
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
              {errors.adjustment_type && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.adjustment_type}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Adjustment Date *
              </label>
              <input
                type="date"
                name="adjustment_date"
                value={formData.adjustment_date}
                onChange={handleChange}
                className={`w-full rounded-lg border bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-brand-500 dark:bg-navy-900 dark:text-white ${
                  errors.adjustment_date
                    ? "border-red-500"
                    : "border-gray-200 dark:border-navy-600"
                }`}
              />
              {errors.adjustment_date && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.adjustment_date}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Reference Number
              </label>
              <input
                type="text"
                name="reference_number"
                value={formData.reference_number}
                onChange={handleChange}
                placeholder="e.g. Audit #123"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Reason
              </label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="e.g. Stock count variance"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-4">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={2}
                placeholder="Detailed remarks..."
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Lines Section */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          {!formData.warehouse_id ? (
            <div className="py-8 text-center text-gray-500">
              Please select a Branch and Warehouse to manage adjustment lines.
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
            className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:bg-navy-800 dark:text-gray-200 dark:hover:bg-navy-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-brand-500/20 hover:bg-brand-700 focus:ring-4 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            {saving ? "Saving..." : "Save Draft"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StockAdjustmentFormPage;
