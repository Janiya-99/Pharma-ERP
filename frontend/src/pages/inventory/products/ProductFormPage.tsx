import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { inventoryApi } from "../../../api/inventoryApi";
import ProductCategorySelect from "../../../components/inventory/ProductCategorySelect";
import GenericNameSelect from "../../../components/inventory/GenericNameSelect";
import DosageFormSelect from "../../../components/inventory/DosageFormSelect";
import ManufacturerSelect from "../../../components/inventory/ManufacturerSelect";
import ProductUnitSelect from "../../../components/inventory/ProductUnitSelect";

const ProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const [formData, setFormData] = useState({
    product_code: "",
    product_name: "",
    category_id: "",
    generic_name_id: "",
    dosage_form_id: "",
    manufacturer_id: "",
    base_unit_id: "",
    product_type: "medicine",
    strength: "",
    pack_size: "",
    nmra_registration_number: "",
    nmra_expiry_date: "",
    requires_batch_tracking: true,
    requires_expiry_tracking: true,
    storage_condition: "normal",
    reorder_level: 0,
    reorder_quantity: 0,
    purchase_account_id: "",
    sales_account_id: "",
    inventory_account_id: "",
    cogs_account_id: "",
    status: "active",
    barcodes: [],
  });

  useEffect(() => {
    if (isEdit) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await inventoryApi.getProductById(id);
      if (response.data?.success) {
        const prod = response.data.data;
        setFormData({
          ...prod,
          barcodes: prod.barcodes || [],
          nmra_expiry_date: prod.nmra_expiry_date
            ? prod.nmra_expiry_date.split("T")[0]
            : "",
        });
      }
    } catch (error) {
      toast.error("Failed to load product");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: unknown) => {
      const newData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      if (name === "product_type") {
        if (value === "medicine") {
          newData.requires_batch_tracking = true;
          newData.requires_expiry_tracking = true;
        } else if (value === "medical_device") {
          newData.requires_batch_tracking = true;
        }
      }
      return newData;
    });
  };

  const handleCustomChange = (name: unknown, value: unknown) => {
    setFormData((prev: unknown) => ({ ...prev, [name]: value }));
  };

  const addBarcode = () => {
    setFormData((prev: unknown) => ({
      ...prev,
      barcodes: [
        ...prev.barcodes,
        { barcode: "", barcode_type: "EAN13", status: "active" },
      ],
    }));
  };

  const updateBarcode = (index: unknown, field: unknown, value: unknown) => {
    setFormData((prev: unknown) => {
      const newBarcodes = [...prev.barcodes];
      newBarcodes[index] = { ...newBarcodes[index], [field]: value };
      return { ...prev, barcodes: newBarcodes };
    });
  };

  const removeBarcode = (index: unknown) => {
    setFormData((prev: unknown) => {
      const newBarcodes = [...prev.barcodes];
      newBarcodes.splice(index, 1);
      return { ...prev, barcodes: newBarcodes };
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Convert numeric fields
    const payload = {
      ...formData,
      reorder_level: Number(formData.reorder_level),
      reorder_quantity: Number(formData.reorder_quantity),
      purchase_account_id: formData.purchase_account_id
        ? Number(formData.purchase_account_id)
        : null,
      sales_account_id: formData.sales_account_id
        ? Number(formData.sales_account_id)
        : null,
      inventory_account_id: formData.inventory_account_id
        ? Number(formData.inventory_account_id)
        : null,
      cogs_account_id: formData.cogs_account_id
        ? Number(formData.cogs_account_id)
        : null,
      nmra_expiry_date: formData.nmra_expiry_date
        ? new Date(formData.nmra_expiry_date).toISOString()
        : null,
      barcodes: formData.barcodes.filter(
        (b: unknown) => b.barcode.trim() !== ""
      ),
    };

    setLoading(true);
    try {
      if (isEdit) {
        await inventoryApi.updateProduct(id, payload);
        toast.success("Product updated successfully");
      } else {
        await inventoryApi.createProduct(payload);
        toast.success("Product created successfully");
      }
      navigate("/inventory/products");
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="mx-auto max-w-6xl p-6 pb-24">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/inventory/products")}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-navy-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            {isEdit ? "Edit Product" : "New Product"}
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-600 disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {loading ? "Saving..." : "Save Product"}
        </button>
      </div>

      <form className="space-y-6">
        {/* Basic Details */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <h2 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
            Basic Details
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Product Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="product_code"
                value={formData.product_code}
                onChange={handleChange}
                required
                className="w-full rounded-xl border bg-white px-3 py-2 dark:bg-navy-700"
                placeholder="e.g. PRD-9876"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                required
                className="w-full rounded-xl border bg-white px-3 py-2 dark:bg-navy-700"
                placeholder="e.g. Paracetamol 500mg"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Product Type <span className="text-red-500">*</span>
              </label>
              <select
                name="product_type"
                value={formData.product_type}
                onChange={handleChange}
                className="w-full rounded-xl border bg-white px-3 py-2 dark:bg-navy-700"
              >
                <option value="medicine">Medicine</option>
                <option value="medical_device">Medical Device</option>
                <option value="consumable">Consumable</option>
                <option value="supplement">Supplement</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Category</label>
              <ProductCategorySelect
                value={formData.category_id}
                onChange={(v: unknown) => handleCustomChange("category_id", v)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Base Unit <span className="text-red-500">*</span>
              </label>
              <ProductUnitSelect
                value={formData.base_unit_id}
                onChange={(v: unknown) => handleCustomChange("base_unit_id", v)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-xl border bg-white px-3 py-2 dark:bg-navy-700"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pharma Details */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <h2 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
            Pharma Details
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Generic Name
              </label>
              <GenericNameSelect
                value={formData.generic_name_id}
                onChange={(v: unknown) =>
                  handleCustomChange("generic_name_id", v)
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Dosage Form
              </label>
              <DosageFormSelect
                value={formData.dosage_form_id}
                onChange={(v: unknown) =>
                  handleCustomChange("dosage_form_id", v)
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Manufacturer
              </label>
              <ManufacturerSelect
                value={formData.manufacturer_id}
                onChange={(v: unknown) =>
                  handleCustomChange("manufacturer_id", v)
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Strength</label>
              <input
                type="text"
                name="strength"
                value={formData.strength}
                onChange={handleChange}
                className="w-full rounded-xl border bg-white px-3 py-2 dark:bg-navy-700"
                placeholder="e.g. 500mg"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Pack Size
              </label>
              <input
                type="text"
                name="pack_size"
                value={formData.pack_size}
                onChange={handleChange}
                className="w-full rounded-xl border bg-white px-3 py-2 dark:bg-navy-700"
                placeholder="e.g. 10x10 Blister Pack"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                NMRA Reg Number
              </label>
              <input
                type="text"
                name="nmra_registration_number"
                value={formData.nmra_registration_number}
                onChange={handleChange}
                className="w-full rounded-xl border bg-white px-3 py-2 dark:bg-navy-700"
                placeholder="e.g. NMRA-REG-00123"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                NMRA Expiry Date
              </label>
              <input
                type="date"
                name="nmra_expiry_date"
                value={formData.nmra_expiry_date}
                onChange={handleChange}
                className="w-full rounded-xl border bg-white px-3 py-2 dark:bg-navy-700"
                placeholder="e.g. 2026-06-27"
              />
            </div>
          </div>
        </div>

        {/* Inventory Settings */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <h2 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
            Inventory Settings
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="requires_batch_tracking"
                  checked={formData.requires_batch_tracking}
                  onChange={handleChange}
                  className="h-4 w-4 rounded text-brand-500"
                />
                <span className="text-sm">Requires Batch Tracking</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="requires_expiry_tracking"
                  checked={formData.requires_expiry_tracking}
                  onChange={handleChange}
                  className="h-4 w-4 rounded text-brand-500"
                />
                <span className="text-sm">Requires Expiry Tracking</span>
              </label>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Storage Condition
              </label>
              <select
                name="storage_condition"
                value={formData.storage_condition}
                onChange={handleChange}
                className="w-full rounded-xl border bg-white px-3 py-2 dark:bg-navy-700"
              >
                <option value="normal">Normal</option>
                <option value="cool">Cool</option>
                <option value="cold_chain">Cold Chain</option>
                <option value="controlled_drug">Controlled Drug</option>
                <option value="hazardous">Hazardous</option>
                <option value="quarantine">Quarantine</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Reorder Level
              </label>
              <input
                type="number"
                step="0.001"
                name="reorder_level"
                value={formData.reorder_level}
                onChange={handleChange}
                className="w-full rounded-xl border bg-white px-3 py-2 dark:bg-navy-700"
                placeholder="e.g. 100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Reorder Quantity
              </label>
              <input
                type="number"
                step="0.001"
                name="reorder_quantity"
                value={formData.reorder_quantity}
                onChange={handleChange}
                className="w-full rounded-xl border bg-white px-3 py-2 dark:bg-navy-700"
                placeholder="e.g. 500"
              />
            </div>
          </div>
        </div>

        {/* Barcodes */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-700 dark:text-white">
              Barcodes
            </h2>
            <button
              type="button"
              onClick={addBarcode}
              className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
            >
              <Plus className="h-4 w-4" /> Add Barcode
            </button>
          </div>
          {formData.barcodes.length === 0 ? (
            <p className="text-sm text-gray-500">No barcodes added.</p>
          ) : (
            <div className="space-y-3">
              {formData.barcodes.map((bc: unknown, idx: unknown) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Barcode"
                    value={bc.barcode}
                    onChange={(e: any) =>
                      updateBarcode(idx, "barcode", e.target.value)
                    }
                    className="flex-1 rounded-xl border bg-white px-3 py-2 text-sm dark:bg-navy-700"
                  />
                  <select
                    value={bc.barcode_type}
                    onChange={(e: any) =>
                      updateBarcode(idx, "barcode_type", e.target.value)
                    }
                    className="w-32 rounded-xl border bg-white px-3 py-2 text-sm dark:bg-navy-700"
                  >
                    <option value="EAN13">EAN13</option>
                    <option value="UPCA">UPCA</option>
                    <option value="CODE128">CODE128</option>
                    <option value="CUSTOM">CUSTOM</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeBarcode(idx)}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
export default ProductFormPage;
