import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Modal from "../../../components/common/Modal";
import { inventoryApi } from "../../../api/inventoryApi";
import { useAuth } from "../../../auth/AuthContext";
import ProductCategorySelect from "../../../components/inventory/ProductCategorySelect";
import WarehouseSelect from "../../../components/inventory/WarehouseSelect";

const ProductCategoryFormModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}: {
  isOpen?: boolean;
  onClose?: unknown;
  onSave?: unknown;
  initialData?: unknown;
}) => {
  const [loading, setLoading] = useState(false);
  const { branches } = useAuth();

  const [formData, setFormData] = useState({
    category_code: "",
    category_name: "",
    parent_id: "",
    level: "",
    description: "",
    status: "active",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
      });
    } else {
      setFormData({
        category_code: "",
        category_name: "",
        parent_id: "",
        level: "",
        description: "",
        status: "active",
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: unknown) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCustomChange = (name: unknown, value: unknown) => {
    setFormData((prev: unknown) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        await inventoryApi.updateProductCategory(initialData.id, formData);
        toast.success("Updated successfully");
      } else {
        await inventoryApi.createProductCategory(formData);
        toast.success("Created successfully");
      }
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Product Category" : "Create Product Category"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="category_code"
            value={formData.category_code || ""}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="category_name"
            value={formData.category_name || ""}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Parent Category
          </label>
          <ProductCategorySelect
            value={formData.parent_id}
            onChange={(v: unknown) => handleCustomChange("parent_id", v)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Level <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="level"
            value={formData.level || ""}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
            required
          >
            <option value="">Select...</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-navy-600">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-navy-600 dark:text-gray-300 dark:hover:bg-navy-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductCategoryFormModal;
