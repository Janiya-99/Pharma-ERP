import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../api/financeApi";
import PageHeader from "../../../components/common/PageHeader";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DepreciationMethodBadge } from "../../../components/finance/FixedAssetBadges";
import { useAuth } from "../../../auth/AuthContext";
import Modal from "../../../components/common/Modal";

const FixedAssetCategoryDetailsPage = () => {
  const { id } = useParams();
  const history = useHistory();
  const { hasPermission } = useAuth();

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const res = await financeApi.getFixedAssetCategoryById(id);
      setCategory(res.data?.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to load category details"
      );
      history.push("/admin/finance/fixed-asset-categories");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await financeApi.deleteFixedAssetCategory(id);
      toast.success("Category deleted successfully");
      history.push("/admin/finance/fixed-asset-categories");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete category");
      setDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!category) return null;

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-gray-50 pb-10 dark:bg-navy-900">
      <PageHeader
        title="Category Details"
        breadcrumb={[
          { label: "Finance" },
          {
            label: "Fixed Asset Categories",
            path: "/admin/finance/fixed-asset-categories",
          },
          { label: category.category_code },
        ]}
      />

      <div className="mx-auto w-full max-w-5xl px-6">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() =>
              history.push("/admin/finance/fixed-asset-categories")
            }
            className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-navy-700 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to List
          </button>

          <div className="flex items-center gap-3">
            {hasPermission("finance.fixed_asset_category.update") && (
              <button
                onClick={() =>
                  history.push(
                    `/admin/finance/fixed-asset-categories/${id}/edit`
                  )
                }
                className="flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-2 text-sm font-medium text-brand-600 transition-all hover:bg-brand-100 dark:bg-navy-800 dark:text-brand-400 dark:hover:bg-navy-700"
              >
                <Edit className="h-4 w-4" /> Edit
              </button>
            )}
            {hasPermission("finance.fixed_asset_category.delete") && (
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-100 dark:bg-navy-800 dark:text-red-400 dark:hover:bg-navy-700"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
                {category.category_name}
              </h2>
              <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                Code: {category.category_code}
              </p>
            </div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                category.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {category.status === "active" ? "Active" : "Inactive"}
            </span>
          </div>
          {category.description && (
            <div className="mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {category.description}
              </p>
            </div>
          )}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <h3 className="mb-4 border-b border-gray-100 pb-3 text-lg font-bold text-navy-700 dark:border-navy-700 dark:text-white">
              Depreciation Defaults
            </h3>
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">
                  Useful Life
                </p>
                <p className="text-sm font-medium text-navy-700 dark:text-white">
                  {category.default_useful_life_months} Months
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">
                  Depreciation Method
                </p>
                <div className="mt-1">
                  <DepreciationMethodBadge
                    method={category.default_depreciation_method}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <h3 className="mb-4 border-b border-gray-100 pb-3 text-lg font-bold text-navy-700 dark:border-navy-700 dark:text-white">
              System Info
            </h3>
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">
                  Created At
                </p>
                <p className="text-sm font-medium text-navy-700 dark:text-white">
                  {new Date(category.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <h3 className="mb-6 border-b border-gray-100 pb-3 text-lg font-bold text-navy-700 dark:border-navy-700 dark:text-white">
            Default Chart of Accounts Mapping
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">
                Asset Account
              </p>
              <p className="text-sm font-medium text-navy-700 dark:text-white">
                {category.default_asset_account?.account_code} -{" "}
                {category.default_asset_account?.account_name}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">
                Accumulated Depreciation Account
              </p>
              <p className="text-sm font-medium text-navy-700 dark:text-white">
                {
                  category.default_accumulated_depreciation_account
                    ?.account_code
                }{" "}
                -{" "}
                {
                  category.default_accumulated_depreciation_account
                    ?.account_name
                }
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">
                Depreciation Expense Account
              </p>
              <p className="text-sm font-medium text-navy-700 dark:text-white">
                {category.default_depreciation_expense_account?.account_code} -{" "}
                {category.default_depreciation_expense_account?.account_name}
              </p>
            </div>
            <div></div>
            <div>
              <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">
                Gain on Disposal Account
              </p>
              <p className="text-sm font-medium text-navy-700 dark:text-white">
                {category.default_gain_on_disposal_account ? (
                  `${category.default_gain_on_disposal_account.account_code} - ${category.default_gain_on_disposal_account.account_name}`
                ) : (
                  <span className="italic text-gray-400">Not set</span>
                )}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">
                Loss on Disposal Account
              </p>
              <p className="text-sm font-medium text-navy-700 dark:text-white">
                {category.default_loss_on_disposal_account ? (
                  `${category.default_loss_on_disposal_account.account_code} - ${category.default_loss_on_disposal_account.account_name}`
                ) : (
                  <span className="italic text-gray-400">Not set</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Category"
      >
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          Are you sure you want to delete category{" "}
          <span className="font-bold text-navy-700 dark:text-white">
            {category.category_code}
          </span>
          ?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteModalOpen(false)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700"
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-red-600 disabled:opacity-50"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default FixedAssetCategoryDetailsPage;
