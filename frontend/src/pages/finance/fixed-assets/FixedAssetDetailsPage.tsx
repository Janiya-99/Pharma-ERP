import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../api/financeApi";
import PageHeader from "../../../components/common/PageHeader";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../auth/AuthContext";
import Modal from "../../../components/common/Modal";
import AssetValueCard from "../../../components/finance/AssetValueCard";
import {
  FixedAssetStatusBadge,
  DepreciationMethodBadge,
} from "../../../components/finance/FixedAssetBadges";

const FixedAssetDetailsPage = () => {
  const { id } = useParams();
  const history = useHistory();
  const { hasPermission } = useAuth();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAsset();
  }, [id]);

  const fetchAsset = async () => {
    try {
      setLoading(true);
      const res = await financeApi.getFixedAssetById(id);
      setAsset(res.data?.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to load asset details"
      );
      history.push("/admin/finance/fixed-assets");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await financeApi.deleteFixedAsset(id);
      toast.success("Fixed asset deleted successfully");
      history.push("/admin/finance/fixed-assets");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete fixed asset"
      );
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

  if (!asset) return null;

  const depreciableAmount =
    Number(asset.acquisition_cost || 0) - Number(asset.residual_value || 0);
  const monthlyDepreciation = asset.useful_life_months
    ? depreciableAmount / asset.useful_life_months
    : 0;

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-gray-50 pb-10 dark:bg-navy-900">
      <PageHeader
        title="Fixed Asset Details"
        breadcrumb={[
          { label: "Finance" },
          { label: "Fixed Assets", path: "/admin/finance/fixed-assets" },
          { label: asset.asset_code },
        ]}
      />

      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => history.push("/admin/finance/fixed-assets")}
            className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-navy-700 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to List
          </button>

          <div className="flex items-center gap-3">
            {hasPermission("finance.fixed_asset.update") &&
              asset.asset_status === "active" && (
                <button
                  onClick={() =>
                    history.push(`/admin/finance/fixed-assets/${id}/edit`)
                  }
                  className="flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-2 text-sm font-medium text-brand-600 transition-all hover:bg-brand-100 dark:bg-navy-800 dark:text-brand-400 dark:hover:bg-navy-700"
                >
                  <Edit className="h-4 w-4" /> Edit
                </button>
              )}
            {hasPermission("finance.fixed_asset.delete") &&
              asset.asset_status === "active" &&
              asset.accumulated_depreciation === 0 && (
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-100 dark:bg-navy-800 dark:text-red-400 dark:hover:bg-navy-700"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              )}
          </div>
        </div>

        {/* Header Section */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="mb-1 flex items-center gap-3">
                <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
                  {asset.asset_name}
                </h2>
                <FixedAssetStatusBadge status={asset.asset_status} />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Code: {asset.asset_code} | Branch: {asset.branch?.branch_name} |
                Category: {asset.category?.category_name}
              </p>
            </div>
            <div className="flex flex-col md:items-end">
              <span className="text-sm text-gray-500">Status</span>
              <span
                className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                  asset.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {asset.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          {asset.description && (
            <div className="mt-4 border-t border-gray-100 pt-4 dark:border-navy-700">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {asset.description}
              </p>
            </div>
          )}
        </div>

        {/* Financial Summary */}
        <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
          Financial Summary
        </h3>
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AssetValueCard
            title="Acquisition Cost"
            amount={asset.acquisition_cost}
          />
          <AssetValueCard
            title="Residual Value"
            amount={asset.residual_value}
          />
          <AssetValueCard
            title="Depreciable Amount"
            amount={depreciableAmount}
          />
          <AssetValueCard
            title="Accumulated Depreciation"
            amount={asset.accumulated_depreciation}
            className="border-red-100 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/10"
          />
          <AssetValueCard
            title="Net Book Value"
            amount={asset.net_book_value}
            className="border-brand-200 bg-brand-50/50 dark:border-brand-700 dark:bg-brand-900/20"
          />
          <AssetValueCard
            title="Monthly Depreciation"
            amount={monthlyDepreciation}
          />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Purchase Details */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <h3 className="mb-4 border-b border-gray-100 pb-3 text-lg font-bold text-navy-700 dark:border-navy-700 dark:text-white">
              Purchase & Asset Details
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Purchase Date</span>
                <span className="text-sm font-medium text-navy-700 dark:text-white">
                  {new Date(asset.purchase_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Acquisition Date</span>
                <span className="text-sm font-medium text-navy-700 dark:text-white">
                  {new Date(asset.acquisition_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Supplier Name</span>
                <span className="text-sm font-medium text-navy-700 dark:text-white">
                  {asset.supplier_name || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Invoice Number</span>
                <span className="text-sm font-medium text-navy-700 dark:text-white">
                  {asset.invoice_number || "-"}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-50 pt-2 dark:border-navy-700/50">
                <span className="text-sm text-gray-500">Serial Number</span>
                <span className="text-sm font-medium text-navy-700 dark:text-white">
                  {asset.serial_number || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Model Number</span>
                <span className="text-sm font-medium text-navy-700 dark:text-white">
                  {asset.model_number || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Manufacturer</span>
                <span className="text-sm font-medium text-navy-700 dark:text-white">
                  {asset.manufacturer || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Depreciation Settings */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <h3 className="mb-4 border-b border-gray-100 pb-3 text-lg font-bold text-navy-700 dark:border-navy-700 dark:text-white">
              Depreciation Settings
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Useful Life</span>
                <span className="text-sm font-medium text-navy-700 dark:text-white">
                  {asset.useful_life_months} Months
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Method</span>
                <DepreciationMethodBadge method={asset.depreciation_method} />
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Start Date</span>
                <span className="text-sm font-medium text-navy-700 dark:text-white">
                  {new Date(asset.depreciation_start_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">
                  Last Depreciation Date
                </span>
                <span className="text-sm font-medium text-navy-700 dark:text-white">
                  {asset.last_depreciation_date
                    ? new Date(
                        asset.last_depreciation_date
                      ).toLocaleDateString()
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Accounting Setup */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <h3 className="mb-6 border-b border-gray-100 pb-3 text-lg font-bold text-navy-700 dark:border-navy-700 dark:text-white">
            Accounting Integration Setup
          </h3>
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
            <div className="flex flex-col">
              <span className="mb-1 text-xs text-gray-500">Asset Account</span>
              <span className="text-sm font-medium text-navy-700 dark:text-white">
                {asset.asset_account?.account_code} -{" "}
                {asset.asset_account?.account_name}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="mb-1 text-xs text-gray-500">
                Accumulated Depreciation Account
              </span>
              <span className="text-sm font-medium text-navy-700 dark:text-white">
                {asset.accumulated_depreciation_account?.account_code} -{" "}
                {asset.accumulated_depreciation_account?.account_name}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="mb-1 text-xs text-gray-500">
                Depreciation Expense Account
              </span>
              <span className="text-sm font-medium text-navy-700 dark:text-white">
                {asset.depreciation_expense_account?.account_code} -{" "}
                {asset.depreciation_expense_account?.account_name}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="mb-1 text-xs text-gray-500">
                Gain on Disposal Account
              </span>
              <span className="text-sm font-medium text-navy-700 dark:text-white">
                {asset.gain_on_disposal_account
                  ? `${asset.gain_on_disposal_account.account_code} - ${asset.gain_on_disposal_account.account_name}`
                  : "-"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="mb-1 text-xs text-gray-500">
                Loss on Disposal Account
              </span>
              <span className="text-sm font-medium text-navy-700 dark:text-white">
                {asset.loss_on_disposal_account
                  ? `${asset.loss_on_disposal_account.account_code} - ${asset.loss_on_disposal_account.account_name}`
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Fixed Asset"
      >
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          Are you sure you want to delete fixed asset{" "}
          <span className="font-bold text-navy-700 dark:text-white">
            {asset.asset_code}
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

export default FixedAssetDetailsPage;
