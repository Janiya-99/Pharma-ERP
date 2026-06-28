import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { inventoryApi } from "../../../api/inventoryApi";
import { toast } from "react-hot-toast";
import { ArrowLeft, Save } from "lucide-react";
import StockTransferLinesTable from "./StockTransferLinesTable";
import { StockTransferLine, Warehouse } from "../../../types/inventory";

const StockTransferFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    source_warehouse_id: "",
    destination_warehouse_id: "",
    transfer_date: new Date().toISOString().split("T")[0],
    reference_no: "",
    remarks: "",
  });

  const [lines, setLines] = useState<StockTransferLine[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  useEffect(() => {
    fetchWarehouses();
    if (isEditMode) {
      fetchTransfer();
    } else {
      // Add one empty line by default
      setLines([{
        id: `temp-${Date.now()}`,
        product_id: null,
        product: null,
        product_batch_id: null,
        batch: null,
        source_location_id: "",
        destination_location_id: "",
        transfer_quantity: 0,
        available_quantity: null,
        stock_balance_loading: false,
        stock_balance_data: null,
      }]);
    }
  }, [id]);

  const fetchWarehouses = async () => {
    try {
      const res = await inventoryApi.getWarehouses({ limit: 1000, status: "active" }) as any;
      if (res.success !== false) {
        setWarehouses(Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []));
      }
    } catch (err) {}
  };

  const fetchTransfer = async () => {
    try {
      setLoading(true);
      const res = await inventoryApi.getStockTransferById(id!) as any;
      if (res.success !== false) {
        const transfer = res.data;
        if (transfer.approval_status !== "draft" && transfer.approval_status !== "rejected") {
          toast.error("Only draft or rejected transfers can be edited");
          navigate("/inventory/stock-transfers");
          return;
        }

        setFormData({
          source_warehouse_id: transfer.source_warehouse_id?.toString() || "",
          destination_warehouse_id: transfer.destination_warehouse_id?.toString() || "",
          transfer_date: transfer.transfer_date ? transfer.transfer_date.split("T")[0] : "",
          reference_no: transfer.reference_no || "",
          remarks: transfer.remarks || "",
        });

        if (transfer.lines) {
          setLines(transfer.lines.map((l: any): StockTransferLine => ({
            id: l.id,
            product_id: l.product_id,
            product: l.product,
            product_batch_id: l.product_batch_id,
            batch: l.product_batch,
            source_location_id: l.source_location_id,
            destination_location_id: l.destination_location_id,
            transfer_quantity: parseFloat(l.transfer_quantity),
            available_quantity: null,
            stock_balance_loading: false,
            stock_balance_data: null,
            // we will fetch available stock for each line shortly
          })));
        }
      }
    } catch (err) {
      toast.error("Failed to load transfer");
      navigate("/inventory/stock-transfers");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.source_warehouse_id) newErrors.source_warehouse_id = "Source warehouse is required";
    if (!formData.destination_warehouse_id) newErrors.destination_warehouse_id = "Destination warehouse is required";
    if (!formData.transfer_date) newErrors.transfer_date = "Transfer date is required";

    if (lines.length === 0) {
      newErrors.lines = "At least one line item is required";
    }

    lines.forEach((line, index) => {
      if (!line.product_id) newErrors[`lines.${index}.product_id`] = "Required";
      if (line.product?.requires_batch_tracking && !line.product_batch_id) {
        newErrors[`lines.${index}.product_batch_id`] = "Required";
      }
      if (!line.source_location_id) newErrors[`lines.${index}.source_location_id`] = "Required";
      if (!line.destination_location_id) newErrors[`lines.${index}.destination_location_id`] = "Required";
      
      const qty = parseFloat(line.transfer_quantity as string || "0");
      if (qty <= 0) newErrors[`lines.${index}.transfer_quantity`] = "Must be > 0";
      
      if (line.available_quantity !== null && line.available_quantity !== undefined && qty > Number(line.available_quantity)) {
        newErrors[`lines.${index}.transfer_quantity`] = "Exceeds available stock";
      }

      if (formData.source_warehouse_id === formData.destination_warehouse_id && line.source_location_id === line.destination_location_id) {
        newErrors[`lines.${index}.destination_location_id`] = "Must differ from source location";
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
        source_warehouse_id: parseInt(formData.source_warehouse_id as string),
        destination_warehouse_id: parseInt(formData.destination_warehouse_id as string),
        transfer_date: new Date(formData.transfer_date).toISOString(),
        reference_no: formData.reference_no,
        remarks: formData.remarks,
        lines: lines.map((l) => ({
          product_id: Number(l.product_id),
          product_batch_id: l.product_batch_id ? Number(l.product_batch_id) : null,
          source_location_id: Number(l.source_location_id),
          destination_location_id: Number(l.destination_location_id),
          transfer_quantity: parseFloat(l.transfer_quantity as string),
        })),
      };

      if (isEditMode) {
        await inventoryApi.updateStockTransfer(id!, payload);
        toast.success("Stock Transfer updated successfully");
      } else {
        await inventoryApi.createStockTransfer(payload);
        toast.success("Stock Transfer created successfully");
      }
      navigate("/inventory/stock-transfers");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/inventory/stock-transfers")}
          className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg dark:bg-navy-800 dark:border-navy-700 dark:hover:text-gray-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? "Edit Stock Transfer" : "New Stock Transfer"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isEditMode ? "Update draft transfer details" : "Create a new stock transfer draft"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Section */}
        <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transfer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source Warehouse *
              </label>
              <select
                name="source_warehouse_id"
                value={formData.source_warehouse_id}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white ${
                  errors.source_warehouse_id ? "border-red-500" : "border-gray-200 dark:border-navy-600"
                }`}
              >
                <option value="">Select Source...</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.warehouse_name}</option>
                ))}
              </select>
              {errors.source_warehouse_id && <p className="mt-1 text-sm text-red-500">{errors.source_warehouse_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Destination Warehouse *
              </label>
              <select
                name="destination_warehouse_id"
                value={formData.destination_warehouse_id}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white ${
                  errors.destination_warehouse_id ? "border-red-500" : "border-gray-200 dark:border-navy-600"
                }`}
              >
                <option value="">Select Destination...</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.warehouse_name}</option>
                ))}
              </select>
              {errors.destination_warehouse_id && <p className="mt-1 text-sm text-red-500">{errors.destination_warehouse_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Transfer Date *
              </label>
              <input
                type="date"
                name="transfer_date"
                value={formData.transfer_date}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white ${
                  errors.transfer_date ? "border-red-500" : "border-gray-200 dark:border-navy-600"
                }`}
              />
              {errors.transfer_date && <p className="mt-1 text-sm text-red-500">{errors.transfer_date}</p>}
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
                placeholder="Optional external ref"
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
                placeholder="Internal notes..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 dark:border-navy-600 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Lines Section */}
        <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
          {!formData.source_warehouse_id || !formData.destination_warehouse_id ? (
            <div className="text-center py-8 text-gray-500">
              Please select Source and Destination warehouses to manage transfer lines.
            </div>
          ) : (
            <StockTransferLinesTable
              lines={lines}
              setLines={setLines}
              sourceWarehouseId={parseInt(formData.source_warehouse_id)}
              destinationWarehouseId={parseInt(formData.destination_warehouse_id)}
              errors={errors}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/inventory/stock-transfers")}
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

export default StockTransferFormPage;
