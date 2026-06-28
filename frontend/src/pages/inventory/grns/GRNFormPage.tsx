import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Save, ArrowLeft } from "lucide-react";
import { inventoryApi } from "../../../api/inventoryApi";
import { useAuth } from "../../../auth/AuthContext";
import GRNLinesTable from "./GRNLinesTable";
import GRNTotalsCard from "../../../components/inventory/GRNTotalsCard";

const GRNFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { branches } = useAuth();

  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [accountingPeriods, setAccountingPeriods] = useState([]);

  const [formData, setFormData] = useState({
    branch_id: "",
    warehouse_id: "",
    supplier_id: "",
    grn_date: new Date().toISOString().split("T")[0],
    supplier_invoice_number: "",
    supplier_invoice_date: "",
    purchase_order_number: "",
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
      fetchGRNDetails();
    }
  }, [id]);

  const fetchLookups = async () => {
    try {
      const [wRes, sRes] = await Promise.all([
        inventoryApi.getWarehouses({ limit: 1000, status: "active" }),
        inventoryApi.getSuppliers({ limit: 1000, status: "active" }),
      ]);
      if (wRes.success !== false)
        setWarehouses(wRes.data?.data || wRes.data || []);
      if (sRes.success !== false)
        setSuppliers(sRes.data?.data || sRes.data || []);
    } catch (err) {
      console.error("Failed to fetch lookups", err);
    }
  };

  const fetchGRNDetails = async () => {
    try {
      const res = await inventoryApi.getGRNById(id);
      const data = res.data?.data || res.data;
      if (data) {
        setFormData({
          branch_id: data.branch_id || "",
          warehouse_id: data.warehouse_id || "",
          supplier_id: data.supplier_id || "",
          grn_date: data.grn_date ? data.grn_date.split("T")[0] : "",
          supplier_invoice_number: data.supplier_invoice_number || "",
          supplier_invoice_date: data.supplier_invoice_date
            ? data.supplier_invoice_date.split("T")[0]
            : "",
          purchase_order_number: data.purchase_order_number || "",
          reference_number: data.reference_number || "",
          remarks: data.remarks || "",
          financial_year_id: data.financial_year_id || "",
          accounting_period_id: data.accounting_period_id || "",
        });

        setLines(
          (data.lines || []).map((line: unknown) => ({
            ...line,
            quantity_received: line.quantity_received || 0,
            free_quantity: line.free_quantity || 0,
            unit_cost: line.unit_cost || 0,
            discount_amount: line.discount_amount || 0,
            tax_amount: line.tax_amount || 0,
            product_id: line.product_id,
            product: line.product,
            product_batch_id: line.product_batch_id,
            batch: line.product_batch,
          }))
        );
      }
    } catch (err) {
      toast.error("Failed to load GRN");
      navigate("/admin/inventory/grns");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.branch_id) newErrors.branch_id = "Branch is required";
    if (!formData.warehouse_id)
      newErrors.warehouse_id = "Warehouse is required";
    if (!formData.supplier_id) newErrors.supplier_id = "Supplier is required";
    if (!formData.grn_date) newErrors.grn_date = "GRN Date is required";

    if (lines.length === 0) {
      newErrors.lines = "At least one line item is required";
    }

    let tTotal = 0;
    let tStock = 0;

    lines.forEach((line: unknown, index: unknown) => {
      const qty = parseFloat(line.quantity_received) || 0;
      const free = parseFloat(line.free_quantity) || 0;
      const cost = parseFloat(line.unit_cost) || 0;
      const disc = parseFloat(line.discount_amount) || 0;
      const tax = parseFloat(line.tax_amount) || 0;

      const lineStock = qty + free;
      tStock += lineStock;
      tTotal += qty * cost - disc + tax;

      if (!line.product_id) {
        newErrors[`lines.${index}`] = {
          ...newErrors[`lines.${index}`],
          product_id: "Product is required",
        };
      }
      if (
        line.product?.requires_batch_tracking &&
        !line.product_batch_id &&
        !line.batch_number
      ) {
        newErrors[`lines.${index}`] = {
          ...newErrors[`lines.${index}`],
          batch: "Batch is required",
        };
      }
      if (
        line.product?.requires_expiry_tracking &&
        !line.expiry_date &&
        !line.batch?.expiry_date
      ) {
        newErrors[`lines.${index}`] = {
          ...newErrors[`lines.${index}`],
          expiry_date: "Expiry Date is required",
        };
      }
      if (qty <= 0) {
        newErrors[`lines.${index}`] = {
          ...newErrors[`lines.${index}`],
          quantity_received: "Qty > 0",
        };
      }
      if (free < 0) {
        newErrors[`lines.${index}`] = {
          ...newErrors[`lines.${index}`],
          free_quantity: "Cannot be negative",
        };
      }
      if (cost < 0) {
        newErrors[`lines.${index}`] = {
          ...newErrors[`lines.${index}`],
          unit_cost: "Cannot be negative",
        };
      }
      if (disc < 0) {
        newErrors[`lines.${index}`] = {
          ...newErrors[`lines.${index}`],
          discount_amount: "Cannot be negative",
        };
      }
      if (tax < 0) {
        newErrors[`lines.${index}`] = {
          ...newErrors[`lines.${index}`],
          tax_amount: "Cannot be negative",
        };
      }
    });

    if (tStock === 0 && lines.length > 0) {
      newErrors.lines = "Total stock quantity must be greater than zero";
    }
    if (tTotal < 0 && lines.length > 0) {
      newErrors.lines = "Total amount cannot be negative";
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
        supplier_id: parseInt(formData.supplier_id),
        supplier_invoice_date: formData.supplier_invoice_date || undefined,
        financial_year_id: formData.financial_year_id
          ? parseInt(formData.financial_year_id)
          : undefined,
        accounting_period_id: formData.accounting_period_id
          ? parseInt(formData.accounting_period_id)
          : undefined,
        lines: lines.map((line: unknown, idx: unknown) => ({
          warehouse_location_id: line.warehouse_location_id
            ? parseInt(line.warehouse_location_id)
            : undefined,
          product_id: parseInt(line.product_id),
          product_batch_id: line.product_batch_id
            ? parseInt(line.product_batch_id)
            : undefined,
          batch_number: line.batch_number || undefined,
          manufacture_date: line.manufacture_date || undefined,
          expiry_date: line.expiry_date || undefined,
          quantity_received: parseFloat(line.quantity_received) || 0,
          free_quantity: parseFloat(line.free_quantity) || 0,
          unit_cost: parseFloat(line.unit_cost) || 0,
          discount_amount: parseFloat(line.discount_amount) || 0,
          tax_amount: parseFloat(line.tax_amount) || 0,
          selling_price: parseFloat(line.selling_price) || 0,
          mrp: parseFloat(line.mrp) || 0,
          line_remarks: line.line_remarks || "",
          line_order: idx + 1,
        })),
      };

      if (isEdit) {
        await inventoryApi.updateGRN(id, payload);
        toast.success("GRN updated successfully");
      } else {
        await inventoryApi.createGRN(payload);
        toast.success("GRN created successfully");
      }
      navigate("/admin/inventory/grns");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.errors ||
          "Failed to save GRN"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBranchChange = (e: any) => {
    setFormData({ ...formData, branch_id: e.target.value, warehouse_id: "" });
  };

  const handleWarehouseChange = (e: any) => {
    setFormData({ ...formData, warehouse_id: e.target.value });
    // Clear warehouse locations
    setLines(lines.map((l: unknown) => ({ ...l, warehouse_location_id: "" })));
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="mx-auto max-w-[1600px] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/inventory/grns")}
            className="rounded-full bg-white p-2 shadow transition-colors hover:bg-gray-50 dark:bg-navy-800 dark:hover:bg-navy-700"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
              {isEdit ? "Edit Goods Receipt Note" : "Create Goods Receipt Note"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Enter incoming inventory details
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Draft"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-6 lg:col-span-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
              Document Header
            </h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Branch *
                </label>
                <select
                  value={formData.branch_id}
                  onChange={handleBranchChange}
                  className={`w-full rounded-xl border bg-white px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500 dark:bg-navy-900 dark:text-white ${
                    errors.branch_id
                      ? "border-red-500"
                      : "border-gray-200 dark:border-navy-600"
                  }`}
                >
                  <option value="">Select Branch</option>
                  {branches.map((b: unknown) => (
                    <option key={b.id} value={b.id}>
                      {b.branch_name}
                    </option>
                  ))}
                </select>
                {errors.branch_id && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.branch_id}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Supplier *
                </label>
                <select
                  value={formData.supplier_id}
                  onChange={(e: any) =>
                    setFormData({ ...formData, supplier_id: e.target.value })
                  }
                  className={`w-full rounded-xl border bg-white px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500 dark:bg-navy-900 dark:text-white ${
                    errors.supplier_id
                      ? "border-red-500"
                      : "border-gray-200 dark:border-navy-600"
                  }`}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s: unknown) => (
                    <option key={s.id} value={s.id}>
                      {s.supplier_name}
                    </option>
                  ))}
                </select>
                {errors.supplier_id && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.supplier_id}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Warehouse *
                </label>
                <select
                  value={formData.warehouse_id}
                  onChange={handleWarehouseChange}
                  className={`w-full rounded-xl border bg-white px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500 dark:bg-navy-900 dark:text-white ${
                    errors.warehouse_id
                      ? "border-red-500"
                      : "border-gray-200 dark:border-navy-600"
                  }`}
                >
                  <option value="">Select Warehouse</option>
                  {warehouses
                    .filter(
                      (w: unknown) =>
                        !formData.branch_id ||
                        w.branch_id === parseInt(formData.branch_id)
                    )
                    .map((w: unknown) => (
                      <option key={w.id} value={w.id}>
                        {w.warehouse_name}
                      </option>
                    ))}
                </select>
                {errors.warehouse_id && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.warehouse_id}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  GRN Date *
                </label>
                <input
                  type="date"
                  value={formData.grn_date}
                  onChange={(e: any) =>
                    setFormData({ ...formData, grn_date: e.target.value })
                  }
                  className={`w-full rounded-xl border bg-white px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500 dark:bg-navy-900 dark:text-white ${
                    errors.grn_date
                      ? "border-red-500"
                      : "border-gray-200 dark:border-navy-600"
                  }`}
                />
                {errors.grn_date && (
                  <p className="mt-1 text-xs text-red-500">{errors.grn_date}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Supplier Invoice Number
                </label>
                <input
                  type="text"
                  value={formData.supplier_invoice_number}
                  onChange={(e: any) =>
                    setFormData({
                      ...formData,
                      supplier_invoice_number: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Supplier Invoice Date
                </label>
                <input
                  type="date"
                  value={formData.supplier_invoice_date}
                  onChange={(e: any) =>
                    setFormData({
                      ...formData,
                      supplier_invoice_date: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Purchase Order Number
                </label>
                <input
                  type="text"
                  value={formData.purchase_order_number}
                  onChange={(e: any) =>
                    setFormData({
                      ...formData,
                      purchase_order_number: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={formData.reference_number}
                  onChange={(e: any) =>
                    setFormData({
                      ...formData,
                      reference_number: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                />
              </div>

              <div className="lg:col-span-3">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e: any) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <GRNLinesTable
              lines={lines}
              setLines={setLines}
              warehouseId={formData.warehouse_id}
              errors={errors}
            />
          </div>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <GRNTotalsCard lines={lines} />

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
              Financial Context (Optional)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-400">
                  Financial Year
                </label>
                <select
                  value={formData.financial_year_id}
                  onChange={(e: any) =>
                    setFormData({
                      ...formData,
                      financial_year_id: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                  disabled={financialYears.length === 0}
                >
                  <option value="">None selected</option>
                  {financialYears.map((fy: unknown) => (
                    <option key={fy.id} value={fy.id}>
                      {fy.year_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-400">
                  Accounting Period
                </label>
                <select
                  value={formData.accounting_period_id}
                  onChange={(e: any) =>
                    setFormData({
                      ...formData,
                      accounting_period_id: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                  disabled={accountingPeriods.length === 0}
                >
                  <option value="">None selected</option>
                  {accountingPeriods.map((ap: unknown) => (
                    <option key={ap.id} value={ap.id}>
                      {ap.period_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GRNFormPage;
