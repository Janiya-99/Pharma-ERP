import { useState, useEffect } from "react";
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
      toast.error(err.response?.data?.message || "Failed to load category details");
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
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!category) return null;

  return (
    <div className="flex flex-col h-full bg-gray-50  overflow-y-auto pb-10">
      <PageHeader
        title="Category Details"
        breadcrumb={[
          { label: "Finance" },
          { label: "Fixed Asset Categories", path: "/admin/finance/fixed-asset-categories" },
          { label: category.category_code },
        ]}
      />

      <div className="px-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => history.push("/admin/finance/fixed-asset-categories")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-navy-700   transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to List
          </button>
          
          <div className="flex items-center gap-3">
            {hasPermission("finance.fixed_asset_category.update") && (
              <button
                onClick={() => history.push(`/admin/finance/fixed-asset-categories/${id}/edit`)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 rounded-xl hover:bg-brand-100    transition-all"
              >
                <Edit className="w-4 h-4" /> Edit
              </button>
            )}
            {hasPermission("finance.fixed_asset_category.delete") && (
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100    transition-all"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
          </div>
        </div>

        <div className="bg-white  rounded-2xl shadow-sm border border-gray-100  p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-navy-700 ">{category.category_name}</h2>
              <p className="text-sm font-medium text-gray-500  mt-1">Code: {category.category_code}</p>
            </div>
            <span
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                category.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
              }`}
            >
              {category.status === "active" ? "Active" : "Inactive"}
            </span>
          </div>
          {category.description && (
            <div className="mb-4">
              <p className="text-sm text-gray-700 ">{category.description}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white  rounded-2xl shadow-sm border border-gray-100  p-6">
            <h3 className="text-lg font-bold text-navy-700  mb-4 border-b border-gray-100  pb-3">
              Depreciation Defaults
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Useful Life</p>
                <p className="text-sm font-medium text-navy-700 ">{category.default_useful_life_months} Months</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Depreciation Method</p>
                <div className="mt-1">
                  <DepreciationMethodBadge method={category.default_depreciation_method} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white  rounded-2xl shadow-sm border border-gray-100  p-6">
            <h3 className="text-lg font-bold text-navy-700  mb-4 border-b border-gray-100  pb-3">
              System Info
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Created At</p>
                <p className="text-sm font-medium text-navy-700 ">
                  {new Date(category.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white  rounded-2xl shadow-sm border border-gray-100  p-6 mb-6">
          <h3 className="text-lg font-bold text-navy-700  mb-6 border-b border-gray-100  pb-3">
            Default Chart of Accounts Mapping
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Asset Account</p>
              <p className="text-sm font-medium text-navy-700 ">
                {category.default_asset_account?.account_code} - {category.default_asset_account?.account_name}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Accumulated Depreciation Account</p>
              <p className="text-sm font-medium text-navy-700 ">
                {category.default_accumulated_depreciation_account?.account_code} - {category.default_accumulated_depreciation_account?.account_name}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Depreciation Expense Account</p>
              <p className="text-sm font-medium text-navy-700 ">
                {category.default_depreciation_expense_account?.account_code} - {category.default_depreciation_expense_account?.account_name}
              </p>
            </div>
            <div></div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Gain on Disposal Account</p>
              <p className="text-sm font-medium text-navy-700 ">
                {category.default_gain_on_disposal_account ? 
                  `${category.default_gain_on_disposal_account.account_code} - ${category.default_gain_on_disposal_account.account_name}` : 
                  <span className="text-gray-400 italic">Not set</span>}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Loss on Disposal Account</p>
              <p className="text-sm font-medium text-navy-700 ">
                {category.default_loss_on_disposal_account ? 
                  `${category.default_loss_on_disposal_account.account_code} - ${category.default_loss_on_disposal_account.account_name}` : 
                  <span className="text-gray-400 italic">Not set</span>}
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
        <p className="text-gray-700  mb-6">
          Are you sure you want to delete category{" "}
          <span className="font-bold text-navy-700 ">
            {category.category_code}
          </span>
          ?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50    "
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 text-sm font-bold text-white transition-all bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50"
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
