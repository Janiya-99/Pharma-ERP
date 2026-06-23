import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit } from "lucide-react";
import { toast } from "react-hot-toast";
import { inventoryApi } from "../../../api/inventoryApi";
import ProductTypeBadge from "../../../components/inventory/ProductTypeBadge";
import StorageConditionBadge from "../../../components/inventory/StorageConditionBadge";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await inventoryApi.getProductById(id);
        if (response.data?.success) {
          setProduct(response.data.data);
        }
      } catch (error) {
        toast.error("Failed to load product details");
        navigate("/inventory/products");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!product) return <div className="p-6 text-center">Product not found</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/inventory/products")} className="p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            {product.product_code} - {product.product_name}
          </h1>
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${product.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {product.status === "active" ? "Active" : "Inactive"}
          </span>
        </div>
        <button onClick={() => navigate(`/inventory/products/${id}/edit`)} className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-100 transition-colors shadow-sm text-sm font-medium">
          <Edit className="h-4 w-4" /> Edit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
            <h2 className="text-lg font-bold mb-4">Product Summary</h2>
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{product.category?.category_name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Product Type</p>
                <p className="mt-1"><ProductTypeBadge type={product.product_type} /></p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Generic Name</p>
                <p className="font-medium">{product.generic_name?.generic_name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dosage Form</p>
                <p className="font-medium">{product.dosage_form?.dosage_form_name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Manufacturer</p>
                <p className="font-medium">{product.manufacturer?.manufacturer_name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Base Unit</p>
                <p className="font-medium">{product.base_unit?.unit_name || "-"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
            <h2 className="text-lg font-bold mb-4">Pharma Details</h2>
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-sm text-gray-500">Strength</p>
                <p className="font-medium">{product.strength || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pack Size</p>
                <p className="font-medium">{product.pack_size || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">NMRA Reg. Number</p>
                <p className="font-medium">{product.nmra_registration_number || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">NMRA Expiry</p>
                <p className="font-medium">{product.nmra_expiry_date ? new Date(product.nmra_expiry_date).toLocaleDateString() : "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
            <h2 className="text-lg font-bold mb-4">Inventory Settings</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-gray-500">Batch Tracking</span>
                <span className="font-medium">{product.requires_batch_tracking ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-gray-500">Expiry Tracking</span>
                <span className="font-medium">{product.requires_expiry_tracking ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-gray-500">Storage</span>
                <StorageConditionBadge condition={product.storage_condition} />
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-gray-500">Reorder Level</span>
                <span className="font-medium">{product.reorder_level}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Reorder Qty</span>
                <span className="font-medium">{product.reorder_quantity}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
            <h2 className="text-lg font-bold mb-4">Barcodes</h2>
            {product.barcodes && product.barcodes.length > 0 ? (
              <div className="space-y-2">
                {product.barcodes.map((b: unknown) => (
                  <div key={b.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-navy-700 rounded-lg">
                    <span className="font-mono text-sm">{b.barcode}</span>
                    <span className="text-xs text-gray-500 uppercase">{b.barcode_type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No barcodes configured</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductDetailsPage;
