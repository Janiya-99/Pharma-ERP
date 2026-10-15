import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { inventoryApi } from "../../../api/inventoryApi";
import { toast } from "react-hot-toast";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import { PageTitleCard } from "../../../components/common/PageTitleCard";
import { AiAutoFillModal } from "../../../components/common/AiAutoFillModal";
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
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    inventoryApi
      .getProducts({ limit: 100 })
      .then((res: any) => {
        const list = res.data?.data?.items || res.data?.data || res.data || [];
        if (Array.isArray(list)) setProducts(list);
      })
      .catch(console.error);
  }, []);

  const handleAiApply = (aiData: any) => {
    let sourceWhId = formData.source_warehouse_id;
    let destWhId = formData.destination_warehouse_id;

    if (aiData.from_warehouse_id) {
      sourceWhId = String(aiData.from_warehouse_id);
    } else if (aiData.from_warehouse_name && warehouses.length > 0) {
      const match = warehouses.find(
        (w: any) =>
          w.warehouse_name?.toLowerCase().includes(aiData.from_warehouse_name.toLowerCase()) ||
          aiData.from_warehouse_name.toLowerCase().includes(w.warehouse_name?.toLowerCase()) ||
          w.warehouse_code?.toLowerCase() === aiData.from_warehouse_name.toLowerCase()
      );
      if (match) sourceWhId = String(match.id);
    }

    if (aiData.to_warehouse_id) {
      destWhId = String(aiData.to_warehouse_id);
    } else if (aiData.to_warehouse_name && warehouses.length > 0) {
      const match = warehouses.find(
        (w: any) =>
          w.warehouse_name?.toLowerCase().includes(aiData.to_warehouse_name.toLowerCase()) ||
          aiData.to_warehouse_name.toLowerCase().includes(w.warehouse_name?.toLowerCase()) ||
          w.warehouse_code?.toLowerCase() === aiData.to_warehouse_name.toLowerCase()
      );
      if (match) destWhId = String(match.id);
    }

    // Default if not matched
    if (!sourceWhId && warehouses.length > 0) sourceWhId = String(warehouses[0].id);
    if (!destWhId && warehouses.length > 1) destWhId = String(warehouses[1].id);

    setFormData((prev) => ({
      ...prev,
      source_warehouse_id: sourceWhId,
      destination_warehouse_id: destWhId,
      transfer_date: aiData.transfer_date || prev.transfer_date,
      reference_no: aiData.reference_number || aiData.reference_no || prev.reference_no,
      remarks: aiData.remarks || prev.remarks,
    }));

    if (Array.isArray(aiData.lines) && aiData.lines.length > 0) {
      const mapped = aiData.lines.map((l: any) => {
        let matchedProduct = null;
        if (l.product_id) {
          matchedProduct = products.find((p: any) => String(p.id) === String(l.product_id));
        }
        if (!matchedProduct && l.product_name && products.length > 0) {
          const searchName = l.product_name.toLowerCase();
          matchedProduct = products.find(
            (p: any) =>
              p.product_name?.toLowerCase().includes(searchName) ||
              searchName.includes(p.product_name?.toLowerCase()) ||
              p.product_code?.toLowerCase() === searchName
          );
        }
        const prod = matchedProduct || products[0] || null;

        return {
          id: `temp-${Date.now()}-${Math.random()}`,
          product_id: prod ? prod.id : null,
          product: prod,
          product_batch_id: null,
          batch: null,
          source_location_id: "",
          destination_location_id: "",
          transfer_quantity: Number(l.quantity || l.transfer_quantity || 1),
          available_quantity: null,
          stock_balance_loading: false,
          stock_balance_data: null,
        };
      });
      setLines(mapped);
    }
  };

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
    <div className="p-6 max-w-[1600px] mx-auto pb-24">
      <PageTitleCard
        title={isEditMode ? "Edit Stock Transfer" : "New Inter-Warehouse Stock Transfer"}
        description="Transfer pharmaceutical formulations between cold-chain and central medical depots."
        moduleTag="Inventory"
        accent="emerald"
        backTo="/inventory/stock-transfers"
        quote={{
          text: "Cold-chain validation and chain-of-custody transfer logging compliant with WHO GDP.",
          author: "Ceylon Med Supply Chain Guidelines",
        }}
        actions={
          <div className="flex items-center gap-3">
            {!isEditMode && (
              <button
                type="button"
                onClick={() => setIsAiModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 font-medium text-sm shadow-sm transition-all shadow-indigo-100 cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
                <span>✨ AI Auto-Fill</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate("/inventory/stock-transfers")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 focus:ring-4 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-brand-500/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Draft"}
            </button>
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Section */}
        <div className="bg-white  rounded-xl shadow-sm border border-gray-100  p-6">
          <h3 className="text-lg font-semibold text-gray-900  mb-4">Transfer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1">
                Source Warehouse *
              </label>
              <select
                name="source_warehouse_id"
                value={formData.source_warehouse_id}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white  text-gray-900  ${
                  errors.source_warehouse_id ? "border-red-500" : "border-gray-200 "
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
              <label className="block text-sm font-medium text-gray-700  mb-1">
                Destination Warehouse *
              </label>
              <select
                name="destination_warehouse_id"
                value={formData.destination_warehouse_id}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white  text-gray-900  ${
                  errors.destination_warehouse_id ? "border-red-500" : "border-gray-200 "
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
              <label className="block text-sm font-medium text-gray-700  mb-1">
                Transfer Date *
              </label>
              <input
                type="date"
                name="transfer_date"
                value={formData.transfer_date}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white  text-gray-900  ${
                  errors.transfer_date ? "border-red-500" : "border-gray-200 "
                }`}
              />
              {errors.transfer_date && <p className="mt-1 text-sm text-red-500">{errors.transfer_date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1">
                Reference No
              </label>
              <input
                type="text"
                name="reference_no"
                value={formData.reference_no}
                onChange={handleChange}
                placeholder="Optional external ref"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 bg-white   text-gray-900 "
              />
            </div>
            
            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-sm font-medium text-gray-700  mb-1">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={2}
                placeholder="Internal notes..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 bg-white   text-gray-900 "
              />
            </div>
          </div>
        </div>

        {/* Lines Section */}
        <div className="bg-white  rounded-xl shadow-sm border border-gray-100  p-6">
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
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50    "
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

      <AiAutoFillModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        formType="stock_transfer"
        title="AI Stock Transfer Auto-Fill"
        contextData={{
          warehouses: warehouses.map((w) => ({
            id: w.id,
            name: w.warehouse_name,
          })),
          products: products.map((p) => ({
            id: p.id,
            name: p.product_name,
            code: p.product_code,
            unit_price: p.unit_price,
          })),
        }}
        onApply={handleAiApply}
      />
    </div>
  );
};

export default StockTransferFormPage;
