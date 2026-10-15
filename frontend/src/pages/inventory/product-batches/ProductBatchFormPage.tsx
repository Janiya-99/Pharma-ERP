import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Save, ArrowLeft, Sparkles } from "lucide-react";
import { PageTitleCard } from "../../../components/common/PageTitleCard";
import { AiAutoFillModal } from "../../../components/common/AiAutoFillModal";
import { inventoryApi } from "../../../api/inventoryApi";
import ProductSelect from "../../../components/inventory/ProductSelect";
import SupplierSelect from "../../../components/inventory/SupplierSelect";
import ManufacturerSelect from "../../../components/inventory/ManufacturerSelect";
import { DatePicker } from "../../../components/ui/date-picker";

const ProductBatchFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [productData, setProductData] = useState(null);
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
    let matchedProductId = "";
    if (aiData.product_id) {
      matchedProductId = String(aiData.product_id);
    } else if (aiData.product_name && products.length > 0) {
      const match = products.find(
        (p: any) =>
          p.product_name?.toLowerCase().includes(aiData.product_name.toLowerCase()) ||
          aiData.product_name.toLowerCase().includes(p.product_name?.toLowerCase()) ||
          p.product_code?.toLowerCase() === aiData.product_name.toLowerCase()
      );
      if (match) matchedProductId = String(match.id);
    }

    setFormData((prev: any) => ({
      ...prev,
      product_id: matchedProductId || prev.product_id,
      batch_number: aiData.batch_number || prev.batch_number,
      manufacture_date: aiData.manufacture_date || prev.manufacture_date,
      expiry_date: aiData.expiry_date || prev.expiry_date,
      purchase_rate: aiData.purchase_rate !== undefined ? aiData.purchase_rate : prev.purchase_rate,
      selling_price: aiData.selling_price !== undefined ? aiData.selling_price : prev.selling_price,
      mrp: aiData.mrp !== undefined ? aiData.mrp : prev.mrp,
      batch_status: aiData.status || aiData.batch_status || prev.batch_status,
    }));
  };

  const [formData, setFormData] = useState({
    product_id: "",
    batch_number: "",
    manufacture_date: "",
    expiry_date: "",
    supplier_id: "",
    manufacturer_id: "",
    purchase_rate: 0,
    selling_price: 0,
    mrp: 0,
    batch_status: "active"
  });

  useEffect(() => {
    if (isEdit) {
      loadBatch();
    }
  }, [id]);

  useEffect(() => {
    if (formData.product_id) {
      // Fetch product to know if expiry tracking is required
      inventoryApi.getProductById(formData.product_id).then((res: unknown) => {
        if(res.data?.success) setProductData(res.data.data);
      });
    } else {
      setProductData(null);
    }
  }, [formData.product_id]);

  const loadBatch = async () => {
    try {
      const response = await inventoryApi.getProductBatchById(id);
      if (response.data?.success) {
        const batch = response.data.data;
        setFormData({
          ...batch,
          manufacture_date: batch.manufacture_date ? batch.manufacture_date.split('T')[0] : "",
          expiry_date: batch.expiry_date ? batch.expiry_date.split('T')[0] : ""
        });
      }
    } catch (error) {
      toast.error("Failed to load batch");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: unknown) => ({ ...prev, [name]: value }));
  };

  const handleCustomChange = (name: unknown, value: unknown) => {
    setFormData((prev: unknown) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (productData?.requires_expiry_tracking && !formData.expiry_date) {
      toast.error("Expiry date is required for this product.");
      return;
    }

    const payload = {
      ...formData,
      purchase_rate: Number(formData.purchase_rate),
      selling_price: Number(formData.selling_price),
      mrp: Number(formData.mrp),
      manufacture_date: formData.manufacture_date ? new Date(formData.manufacture_date).toISOString() : null,
      expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null,
    };

    setLoading(true);
    try {
      if (isEdit) {
        await inventoryApi.updateProductBatch(id, payload);
        toast.success("Batch updated successfully");
      } else {
        await inventoryApi.createProductBatch(payload);
        toast.success("Batch created successfully");
      }
      navigate("/inventory/product-batches");
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto pb-24">
      <PageTitleCard
        title={isEdit ? "Edit Product Batch" : "New Product Batch"}
        description="Register pharmaceutical batch numbers, manufacture & expiry dates, pricing, and QC tracking."
        moduleTag="Inventory"
        accent="emerald"
        backTo="/inventory/product-batches"
        quote={{
          text: "Strict batch-level isolation ensuring end-to-end pharmaceutical recall traceability.",
          author: "Ceylon Med Quality Assurance Standards",
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
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors shadow-sm text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-4 w-4" /> {loading ? "Saving..." : "Save Batch"}
            </button>
          </div>
        }
      />

      <div className="bg-white  rounded-2xl shadow-sm border border-gray-100  p-6">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Product <span className="text-red-500">*</span></label>
            <ProductSelect value={formData.product_id} onChange={(v: unknown) => handleCustomChange("product_id", v)} disabled={isEdit} />
            {productData && (
              <p className="text-xs text-brand-600 mt-1">
                {productData.requires_batch_tracking && "Batch Tracking Required. "}
                {productData.requires_expiry_tracking && "Expiry Tracking Required."}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Batch Number <span className="text-red-500">*</span></label>
            <input type="text" name="batch_number" value={formData.batch_number} onChange={handleChange} required className="w-full px-3 py-2 border rounded-xl bg-white " placeholder="e.g. BAT-202606A" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select name="batch_status" value={formData.batch_status} onChange={handleChange} className="w-full px-3 py-2 border rounded-xl bg-white ">
              <option value="active">Active</option>
              <option value="near_expiry">Near Expiry</option>
              <option value="expired">Expired</option>
              <option value="recalled">Recalled</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Manufacture Date</label>
            <DatePicker
              value={formData.manufacture_date}
              onChange={(value) => setFormData((prev: any) => ({ ...prev, manufacture_date: value }))}
              placeholder="Manufacture date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Expiry Date {productData?.requires_expiry_tracking && <span className="text-red-500">*</span>}
            </label>
            <DatePicker
              value={formData.expiry_date}
              onChange={(value) => setFormData((prev: any) => ({ ...prev, expiry_date: value }))}
              placeholder="Expiry date"
              clearable={!productData?.requires_expiry_tracking}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Supplier</label>
            <SupplierSelect value={formData.supplier_id} onChange={(v: unknown) => handleCustomChange("supplier_id", v)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Manufacturer</label>
            <ManufacturerSelect value={formData.manufacturer_id} onChange={(v: unknown) => handleCustomChange("manufacturer_id", v)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Purchase Rate</label>
            <input type="number" step="0.01" name="purchase_rate" value={formData.purchase_rate} onChange={handleChange} className="w-full px-3 py-2 border rounded-xl bg-white " placeholder="e.g. 150.00" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Selling Price</label>
            <input type="number" step="0.01" name="selling_price" value={formData.selling_price} onChange={handleChange} className="w-full px-3 py-2 border rounded-xl bg-white " placeholder="e.g. 220.00" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">MRP</label>
            <input type="number" step="0.01" name="mrp" value={formData.mrp} onChange={handleChange} className="w-full px-3 py-2 border rounded-xl bg-white " placeholder="e.g. 250.00" />
          </div>
        </form>
      </div>

      <AiAutoFillModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        formType="product_batch"
        title="AI Product Batch Auto-Fill"
        contextData={{
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
export default ProductBatchFormPage;
