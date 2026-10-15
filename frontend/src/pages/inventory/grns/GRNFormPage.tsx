import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Save, ArrowLeft, Sparkles } from "lucide-react";
import { PageTitleCard } from "../../../components/common/PageTitleCard";
import { AiAutoFillModal } from "../../../components/common/AiAutoFillModal";
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
    grn_date: new Date().toISOString().split('T')[0],
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
    let matchedSupId = formData.supplier_id;
    if (aiData.supplier_id) {
      matchedSupId = String(aiData.supplier_id);
    } else if (aiData.supplier_name && suppliers.length > 0) {
      const match = (suppliers as any[]).find(
        (s: any) =>
          s.supplier_name?.toLowerCase().includes(aiData.supplier_name.toLowerCase()) ||
          aiData.supplier_name.toLowerCase().includes(s.supplier_name?.toLowerCase()) ||
          s.supplier_code?.toLowerCase() === aiData.supplier_name.toLowerCase()
      );
      if (match) matchedSupId = String(match.id);
    }

    let matchedWhId = formData.warehouse_id;
    let matchedBrId = formData.branch_id;
    if (aiData.warehouse_id) {
      matchedWhId = String(aiData.warehouse_id);
    } else if (aiData.warehouse_name && warehouses.length > 0) {
      const match = (warehouses as any[]).find(
        (w: any) =>
          w.warehouse_name?.toLowerCase().includes(aiData.warehouse_name.toLowerCase()) ||
          aiData.warehouse_name.toLowerCase().includes(w.warehouse_name?.toLowerCase()) ||
          w.warehouse_code?.toLowerCase() === aiData.warehouse_name.toLowerCase()
      );
      if (match) {
        matchedWhId = String(match.id);
        if (match.branch_id) matchedBrId = String(match.branch_id);
      }
    }

    if (!matchedWhId && warehouses.length > 0) {
      matchedWhId = String((warehouses[0] as any).id);
      if ((warehouses[0] as any).branch_id) matchedBrId = String((warehouses[0] as any).branch_id);
    }
    if (!matchedBrId && branches && branches.length > 0) {
      matchedBrId = String(branches[0].id);
    }

    setFormData((prev: any) => ({
      ...prev,
      supplier_id: matchedSupId || prev.supplier_id,
      warehouse_id: matchedWhId || prev.warehouse_id,
      branch_id: matchedBrId || prev.branch_id,
      grn_date: aiData.grn_date || prev.grn_date,
      supplier_invoice_number: aiData.supplier_invoice_number || prev.supplier_invoice_number,
      supplier_invoice_date: aiData.supplier_invoice_date || prev.supplier_invoice_date,
      remarks: aiData.remarks || prev.remarks,
    }));

    const rawLines = aiData.items || aiData.lines;
    if (Array.isArray(rawLines) && rawLines.length > 0) {
      const mapped = rawLines.map((l: any, idx: number) => {
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
        const qty = Number(l.quantity_received || l.quantity || 1);
        const cost = Number(l.unit_cost || prod?.unit_price || 0);

        return {
          id: `line-${idx}-${Date.now()}`,
          product_id: prod ? prod.id : "",
          product_name: prod ? prod.product_name : (l.product_name || "Pharmaceutical Item"),
          product_code: prod ? prod.product_code : "",
          batch_number: l.batch_number || `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
          manufacture_date: l.manufacture_date || "",
          expiry_date: l.expiry_date || "",
          warehouse_location_id: "",
          quantity_received: qty,
          unit_cost: cost,
          discount_percentage: 0,
          discount_amount: 0,
          tax_percentage: 0,
          tax_amount: 0,
          line_total: qty * cost,
          remarks: l.remarks || "",
        };
      });
      setLines(mapped as any);
    }
  };

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
        inventoryApi.getSuppliers({ limit: 1000, status: "active" })
      ]);
      if (wRes.success !== false) setWarehouses(wRes.data?.data || wRes.data || []);
      if (sRes.success !== false) setSuppliers(sRes.data?.data || sRes.data || []);
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
          grn_date: data.grn_date ? data.grn_date.split('T')[0] : "",
          supplier_invoice_number: data.supplier_invoice_number || "",
          supplier_invoice_date: data.supplier_invoice_date ? data.supplier_invoice_date.split('T')[0] : "",
          purchase_order_number: data.purchase_order_number || "",
          reference_number: data.reference_number || "",
          remarks: data.remarks || "",
          financial_year_id: data.financial_year_id || "",
          accounting_period_id: data.accounting_period_id || "",
        });
        
        setLines((data.lines || []).map((line: unknown) => ({
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
        })));
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
    if (!formData.warehouse_id) newErrors.warehouse_id = "Warehouse is required";
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
      tTotal += (qty * cost) - disc + tax;

      if (!line.product_id) {
        newErrors[`lines.${index}`] = { ...newErrors[`lines.${index}`], product_id: "Product is required" };
      }
      if (line.product?.requires_batch_tracking && !line.product_batch_id && !line.batch_number) {
        newErrors[`lines.${index}`] = { ...newErrors[`lines.${index}`], batch: "Batch is required" };
      }
      if (line.product?.requires_expiry_tracking && !line.expiry_date && !line.batch?.expiry_date) {
         newErrors[`lines.${index}`] = { ...newErrors[`lines.${index}`], expiry_date: "Expiry Date is required" };
      }
      if (qty <= 0) {
        newErrors[`lines.${index}`] = { ...newErrors[`lines.${index}`], quantity_received: "Qty > 0" };
      }
      if (free < 0) {
        newErrors[`lines.${index}`] = { ...newErrors[`lines.${index}`], free_quantity: "Cannot be negative" };
      }
      if (cost < 0) {
        newErrors[`lines.${index}`] = { ...newErrors[`lines.${index}`], unit_cost: "Cannot be negative" };
      }
      if (disc < 0) {
         newErrors[`lines.${index}`] = { ...newErrors[`lines.${index}`], discount_amount: "Cannot be negative" };
      }
      if (tax < 0) {
         newErrors[`lines.${index}`] = { ...newErrors[`lines.${index}`], tax_amount: "Cannot be negative" };
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
        financial_year_id: formData.financial_year_id ? parseInt(formData.financial_year_id) : undefined,
        accounting_period_id: formData.accounting_period_id ? parseInt(formData.accounting_period_id) : undefined,
        lines: lines.map((line: unknown, idx: unknown) => ({
          warehouse_location_id: line.warehouse_location_id ? parseInt(line.warehouse_location_id) : undefined,
          product_id: parseInt(line.product_id),
          product_batch_id: line.product_batch_id ? parseInt(line.product_batch_id) : undefined,
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
      toast.error(error.response?.data?.message || error.response?.data?.errors || "Failed to save GRN");
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
    <div className="p-6 max-w-[1600px] mx-auto pb-24">
      <PageTitleCard
        title={isEdit ? "Edit Goods Receipt Note" : "New Goods Receipt Note (GRN)"}
        description="Receive incoming pharmaceutical consignments, record vendor invoices, and track batch QA quarantine."
        moduleTag="Inventory"
        accent="emerald"
        backTo="/admin/inventory/grns"
        quote={{
          text: "Pharmaceutical warehouse receipt with strict batch inspection and NMRA compliance verification.",
          author: "Ceylon Med Regulatory Standard",
        }}
        actions={
          <div className="flex items-center gap-3">
            {!isEdit && (
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
              onClick={() => navigate("/admin/inventory/grns")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm font-medium cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Draft"}
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white  rounded-2xl shadow-sm border border-gray-100  p-6">
            <h3 className="text-lg font-semibold text-gray-900  mb-6">Document Header</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700  mb-1.5">Branch *</label>
                <select
                  value={formData.branch_id}
                  onChange={handleBranchChange}
                  className={`w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white  text-gray-900  ${errors.branch_id ? "border-red-500" : "border-gray-200 "}`}
                >
                  <option value="">Select Branch</option>
                  {branches.map((b: unknown) => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                </select>
                {errors.branch_id && <p className="text-xs text-red-500 mt-1">{errors.branch_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700  mb-1.5">Supplier *</label>
                <select
                  value={formData.supplier_id}
                  onChange={(e: any) => setFormData({ ...formData, supplier_id: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white  text-gray-900  ${errors.supplier_id ? "border-red-500" : "border-gray-200 "}`}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s: unknown) => <option key={s.id} value={s.id}>{s.supplier_name}</option>)}
                </select>
                {errors.supplier_id && <p className="text-xs text-red-500 mt-1">{errors.supplier_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700  mb-1.5">Warehouse *</label>
                <select
                  value={formData.warehouse_id}
                  onChange={handleWarehouseChange}
                  className={`w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white  text-gray-900  ${errors.warehouse_id ? "border-red-500" : "border-gray-200 "}`}
                >
                  <option value="">Select Warehouse</option>
                  {warehouses
                    .filter((w: unknown) => !formData.branch_id || w.branch_id === parseInt(formData.branch_id))
                    .map((w: unknown) => <option key={w.id} value={w.id}>{w.warehouse_name}</option>)}
                </select>
                {errors.warehouse_id && <p className="text-xs text-red-500 mt-1">{errors.warehouse_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700  mb-1.5">GRN Date *</label>
                <input
                  type="date"
                  value={formData.grn_date}
                  onChange={(e: any) => setFormData({ ...formData, grn_date: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white  text-gray-900  ${errors.grn_date ? "border-red-500" : "border-gray-200 "}`}
                />
                {errors.grn_date && <p className="text-xs text-red-500 mt-1">{errors.grn_date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700  mb-1.5">Supplier Invoice Number</label>
                <input
                  type="text"
                  value={formData.supplier_invoice_number}
                  onChange={(e: any) => setFormData({ ...formData, supplier_invoice_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200  rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white  text-gray-900 "
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700  mb-1.5">Supplier Invoice Date</label>
                <input
                  type="date"
                  value={formData.supplier_invoice_date}
                  onChange={(e: any) => setFormData({ ...formData, supplier_invoice_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200  rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white  text-gray-900 "
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700  mb-1.5">Purchase Order Number</label>
                <input
                  type="text"
                  value={formData.purchase_order_number}
                  onChange={(e: any) => setFormData({ ...formData, purchase_order_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200  rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white  text-gray-900 "
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700  mb-1.5">Reference Number</label>
                <input
                  type="text"
                  value={formData.reference_number}
                  onChange={(e: any) => setFormData({ ...formData, reference_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200  rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white  text-gray-900 "
                />
              </div>

              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700  mb-1.5">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e: any) => setFormData({ ...formData, remarks: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200  rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white  text-gray-900 "
                 placeholder="Enter text..." />
              </div>
            </div>
          </div>

          <div className="bg-white  rounded-2xl shadow-sm border border-gray-100  p-6">
            <GRNLinesTable 
              lines={lines} 
              setLines={setLines} 
              warehouseId={formData.warehouse_id}
              errors={errors}
            />
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <GRNTotalsCard lines={lines} />
          
          <div className="bg-white  rounded-2xl shadow-sm border border-gray-100  p-6">
            <h3 className="text-sm font-semibold text-gray-900  mb-4">Financial Context (Optional)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700  mb-1">Financial Year</label>
                <select
                  value={formData.financial_year_id}
                  onChange={(e: any) => setFormData({ ...formData, financial_year_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200  rounded-lg text-sm bg-gray-50  text-gray-900 "
                  disabled={financialYears.length === 0}
                >
                  <option value="">None selected</option>
                  {financialYears.map((fy: unknown) => <option key={fy.id} value={fy.id}>{fy.year_name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700  mb-1">Accounting Period</label>
                <select
                  value={formData.accounting_period_id}
                  onChange={(e: any) => setFormData({ ...formData, accounting_period_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200  rounded-lg text-sm bg-gray-50  text-gray-900 "
                  disabled={accountingPeriods.length === 0}
                >
                  <option value="">None selected</option>
                  {accountingPeriods.map((ap: unknown) => <option key={ap.id} value={ap.id}>{ap.period_name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AiAutoFillModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        formType="grn"
        onApply={handleAiApply}
        contextData={{
          suppliers,
          warehouses,
          products,
        }}
      />
    </div>
  );
};

export default GRNFormPage;
