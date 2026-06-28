import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Save, ArrowLeft } from "lucide-react";
import { inventoryApi } from "../../../api/inventoryApi";
import ProductSelect from "../../../components/inventory/ProductSelect";
import SupplierSelect from "../../../components/inventory/SupplierSelect";
import ManufacturerSelect from "../../../components/inventory/ManufacturerSelect";

const ProductBatchFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [productData, setProductData] = useState(null);

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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/inventory/product-batches")} className="p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            {isEdit ? "Edit Batch" : "New Batch"}
          </h1>
        </div>
        <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors shadow-sm text-sm font-medium disabled:opacity-50">
          <Save className="h-4 w-4" /> {loading ? "Saving..." : "Save Batch"}
        </button>
      </div>

      <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
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
            <input type="text" name="batch_number" value={formData.batch_number} onChange={handleChange} required className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-navy-700" placeholder="e.g. BAT-202606A" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select name="batch_status" value={formData.batch_status} onChange={handleChange} className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-navy-700">
              <option value="active">Active</option>
              <option value="near_expiry">Near Expiry</option>
              <option value="expired">Expired</option>
              <option value="recalled">Recalled</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Manufacture Date</label>
            <input type="date" name="manufacture_date" value={formData.manufacture_date} onChange={handleChange} className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-navy-700" placeholder="e.g. 2026-06-27" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Expiry Date {productData?.requires_expiry_tracking && <span className="text-red-500">*</span>}
            </label>
            <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleChange} className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-navy-700" placeholder="e.g. 2028-06-27" />
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
            <input type="number" step="0.01" name="purchase_rate" value={formData.purchase_rate} onChange={handleChange} className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-navy-700" placeholder="e.g. 150.00" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Selling Price</label>
            <input type="number" step="0.01" name="selling_price" value={formData.selling_price} onChange={handleChange} className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-navy-700" placeholder="e.g. 220.00" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">MRP</label>
            <input type="number" step="0.01" name="mrp" value={formData.mrp} onChange={handleChange} className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-navy-700" placeholder="e.g. 250.00" />
          </div>
        </form>
      </div>
    </div>
  );
};
export default ProductBatchFormPage;
