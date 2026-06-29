import React, { useState, useEffect } from "react";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

interface Category {
  id: number;
  category_code: string;
  category_name: string;
  description?: string;
  credit_limit?: number;
  credit_days?: number;
  price_list_id?: number;
  discount_percentage?: number;
  status: string;
}

interface CustomerCategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: Category | null;
}

const CustomerCategoryFormModal: React.FC<CustomerCategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  category = null,
}) => {
  const [formData, setFormData] = useState({
    category_code: "",
    category_name: "",
    description: "",
    credit_limit: "",
    credit_days: "",
    price_list_id: "",
    discount_percentage: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setFormData({
        category_code: category.category_code || "",
        category_name: category.category_name || "",
        description: category.description || "",
        credit_limit:
          category.credit_limit !== undefined
            ? String(category.credit_limit)
            : "",
        credit_days:
          category.credit_days !== undefined
            ? String(category.credit_days)
            : "",
        price_list_id:
          category.price_list_id !== undefined
            ? String(category.price_list_id)
            : "",
        discount_percentage:
          category.discount_percentage !== undefined
            ? String(category.discount_percentage)
            : "",
        status: category.status || "active",
      });
    } else {
      setFormData({
        category_code: "",
        category_name: "",
        description: "",
        credit_limit: "",
        credit_days: "",
        price_list_id: "",
        discount_percentage: "",
        status: "active",
      });
    }
    setError(null);
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_code.trim() || !formData.category_name.trim()) {
      setError("Category Code and Name are required.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      credit_limit: Number(formData.credit_limit) || 0,
      credit_days: Number(formData.credit_days) || 0,
      price_list_id: formData.price_list_id
        ? Number(formData.price_list_id)
        : 0,
      discount_percentage: Number(formData.discount_percentage) || 0,
    };

    try {
      if (category?.id) {
        await invoiceCenterApi.updateCustomerCategory(category.id, payload);
      } else {
        await invoiceCenterApi.createCustomerCategory(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Save category error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save category. Code or name might already exist."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl dark:border-navy-700 dark:bg-navy-800">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-6 dark:border-navy-700 dark:bg-navy-900/50">
          <h3 className="text-lg font-bold text-navy-900 dark:text-white">
            {category ? "Edit Customer Category" : "Create Customer Category"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="bg-rose-50 border-rose-200 text-rose-600 rounded-xl border p-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Category Code *
              </label>
              <input
                type="text"
                required
                disabled={Boolean(category)}
                value={formData.category_code}
                onChange={(e) =>
                  setFormData({ ...formData, category_code: e.target.value })
                }
                placeholder="e.g. CAT-VIP"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 disabled:bg-gray-100 disabled:opacity-70 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={formData.category_name}
                onChange={(e) =>
                  setFormData({ ...formData, category_name: e.target.value })
                }
                placeholder="e.g. VIP Hospitals"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of this customer category..."
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Default Credit Limit (LKR)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.credit_limit}
                onChange={(e) =>
                  setFormData({ ...formData, credit_limit: e.target.value })
                }
                placeholder="0.00"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Default Credit Days
              </label>
              <input
                type="number"
                min="0"
                value={formData.credit_days}
                onChange={(e) =>
                  setFormData({ ...formData, credit_days: e.target.value })
                }
                placeholder="30"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Default Discount (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.discount_percentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount_percentage: e.target.value,
                  })
                }
                placeholder="0.0"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-navy-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-navy-600 dark:text-gray-300 dark:hover:bg-navy-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-brand-600 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : category
                ? "Update Category"
                : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerCategoryFormModal;
