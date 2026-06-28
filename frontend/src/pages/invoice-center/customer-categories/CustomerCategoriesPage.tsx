import React, { useState, useEffect } from "react";
import { useAuth } from "../../../auth/AuthContext";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import CustomerCategoryFormModal from "./CustomerCategoryFormModal";
import PermissionGuard from "../../../auth/PermissionGuard";
import { Search, Plus, Edit, Trash2, RefreshCw, AlertCircle } from "lucide-react";

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
  const [modalState, setModalState] = useState<{ isOpen: boolean; category: Category | null }>({
    isOpen: false,
    category: null,
  });
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await invoiceCenterApi.getCustomerCategories({ search, limit: 100 });
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
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await invoiceCenterApi.deleteCustomerCategory(id);
      fetchCategories();
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Cannot delete category. It might be linked to customers.");
    }
  };

  if (activeSoftware?.software_code !== "INVOICE_CENTER") {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl font-medium border border-rose-200 dark:border-rose-800 m-6">
        Please switch to Invoice Center module to access this page.
      </div>
    );
  }

  const formatLKR = (val?: number) => `LKR ${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-navy-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-navy-700">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Customer Categories</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Classify customer accounts and establish default credit/discount policies</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategories}
            disabled={loading}
            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-navy-700 dark:hover:bg-navy-600 text-gray-600 dark:text-gray-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <PermissionGuard permission="invoice_center.customer_category.create">
            <button
              onClick={() => setModalState({ isOpen: true, category: null })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </PermissionGuard>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-navy-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by code or name..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-navy-700 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-navy-700/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Category Name</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Default Credit Limit</th>
                <th className="py-3.5 px-4">Credit Days</th>
                <th className="py-3.5 px-4">Discount %</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-navy-700 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 animate-pulse font-medium">Loading categories...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500 dark:text-gray-400">No categories found matching criteria.</td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/80 dark:hover:bg-navy-700/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-navy-900 dark:text-white">{cat.category_code}</td>
                    <td className="py-3.5 px-4 font-bold text-navy-900 dark:text-white">{cat.category_name}</td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">{cat.description || "—"}</td>
                    <td className="py-3.5 px-4 font-medium text-gray-700 dark:text-gray-300">{formatLKR(cat.credit_limit)}</td>
                    <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300">{cat.credit_days || 0} Days</td>
                    <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300">{cat.discount_percentage || 0}%</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        cat.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-100 text-gray-600 dark:bg-navy-700 dark:text-gray-300"
                      }`}>
                        {cat.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <PermissionGuard permission="invoice_center.customer_category.update">
                          <button
                            onClick={() => setModalState({ isOpen: true, category: cat })}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-navy-700 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </PermissionGuard>
                        <PermissionGuard permission="invoice_center.customer_category.delete">
                          <button
                            onClick={() => handleDelete(cat.id, cat.category_name)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-navy-700 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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
