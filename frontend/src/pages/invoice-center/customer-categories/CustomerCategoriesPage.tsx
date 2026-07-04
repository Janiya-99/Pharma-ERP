import React, { useState, useEffect } from "react";
import { useAuth } from "../../../auth/AuthContext";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import CustomerCategoryFormModal from "./CustomerCategoryFormModal";
import PermissionGuard from "../../../auth/PermissionGuard";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface Category {
  id: number;
  category_code: string;
  category_name: string;
  description?: string;
  credit_limit?: number;
  credit_days?: number;
  discount_percentage?: number;
  status: string;
}

const CustomerCategoriesPage: React.FC = () => {
  const { activeSoftware } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    category: Category | null;
  }>({
    isOpen: false,
    category: null,
  });
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await invoiceCenterApi.getCustomerCategories({
        search,
        limit: 100,
      });
      if (response.data?.success) {
        setCategories(response.data.data || []);
      }
    } catch (err) {
      console.error("Fetch categories error:", err);
      setError("Failed to load customer categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSoftware?.software_code === "INVOICE_CENTER") {
      fetchCategories();
    }
  }, [activeSoftware, search]);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`))
      return;
    try {
      await invoiceCenterApi.deleteCustomerCategory(id);
      fetchCategories();
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(
        err.response?.data?.message ||
          "Cannot delete category. It might be linked to customers."
      );
    }
  };

  if (activeSoftware?.software_code !== "INVOICE_CENTER") {
    return (
      <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 m-6 rounded-2xl border p-8 text-center font-medium">
        Please switch to Invoice Center module to access this page.
      </div>
    );
  }

  const formatLKR = (val?: number) =>
    `LKR ${Number(val || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
    })}`;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">
            Customer Categories
          </h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Classify customer accounts and establish default credit/discount
            policies
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategories}
            disabled={loading}
            className="rounded-xl bg-gray-50 p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600"
            title="Refresh"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <PermissionGuard permission="invoice_center.customer_category.create">
            <button
              onClick={() => setModalState({ isOpen: true, category: null })}
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-600"
            >
              <Plus className="h-4 w-4" /> Add Category
            </button>
          </PermissionGuard>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-rose-200 text-rose-700 flex items-center gap-2 rounded-xl border p-4 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-navy-700 dark:bg-navy-800">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by code or name..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:bg-navy-700/50">
                <th className="px-4 py-3.5">Code</th>
                <th className="px-4 py-3.5">Category Name</th>
                <th className="px-4 py-3.5">Description</th>
                <th className="px-4 py-3.5">Default Credit Limit</th>
                <th className="px-4 py-3.5">Credit Days</th>
                <th className="px-4 py-3.5">Discount %</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm dark:divide-navy-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="animate-pulse py-12 text-center font-medium text-gray-400"
                  >
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    No categories found matching criteria.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="transition-colors hover:bg-gray-50/80 dark:hover:bg-navy-700/50"
                  >
                    <td className="px-4 py-3.5 font-mono font-semibold text-navy-900 dark:text-white">
                      {cat.category_code}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-navy-900 dark:text-white">
                      {cat.category_name}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3.5 text-gray-600 dark:text-gray-400">
                      {cat.description || "—"}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-700 dark:text-gray-300">
                      {formatLKR(cat.credit_limit)}
                    </td>
                    <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300">
                      {cat.credit_days || 0} Days
                    </td>
                    <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300">
                      {cat.discount_percentage || 0}%
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          cat.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 border"
                            : "bg-gray-100 text-gray-600 dark:bg-navy-700 dark:text-gray-300"
                        }`}
                      >
                        {cat.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <PermissionGuard permission="invoice_center.customer_category.update">
                          <button
                            onClick={() =>
                              setModalState({ isOpen: true, category: cat })
                            }
                            className="rounded-lg p-1.5 text-indigo-600 transition-colors hover:bg-indigo-50 dark:hover:bg-navy-700"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </PermissionGuard>
                        <PermissionGuard permission="invoice_center.customer_category.delete">
                          <button
                            onClick={() =>
                              handleDelete(cat.id, cat.category_name)
                            }
                            className="text-rose-600 hover:bg-rose-50 rounded-lg p-1.5 transition-colors dark:hover:bg-navy-700"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CustomerCategoryFormModal
        isOpen={modalState.isOpen}
        category={modalState.category}
        onClose={() => setModalState({ isOpen: false, category: null })}
        onSuccess={fetchCategories}
      />
    </div>
  );
};

export default CustomerCategoriesPage;
