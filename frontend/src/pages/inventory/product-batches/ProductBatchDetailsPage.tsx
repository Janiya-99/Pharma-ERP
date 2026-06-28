import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Lock, Unlock } from "lucide-react";
import { toast } from "react-hot-toast";
import { inventoryApi } from "../../../api/inventoryApi";
import BatchStatusBadge from "../../../components/inventory/BatchStatusBadge";
import BlockBatchModal from "./BlockBatchModal";
import UnblockBatchModal from "./UnblockBatchModal";

const ProductBatchDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [unblockModalOpen, setUnblockModalOpen] = useState(false);

  useEffect(() => {
    fetchBatch();
  }, [id]);

  const fetchBatch = async () => {
    try {
      const response = await inventoryApi.getProductBatchById(id);
      if (response.data?.success) {
        setBatch(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to load batch details");
      navigate("/inventory/product-batches");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!batch) return <div className="p-6 text-center">Batch not found</div>;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/inventory/product-batches")}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-navy-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            Batch: {batch.batch_number}
          </h1>
          <BatchStatusBadge status={batch.batch_status} />
          {batch.is_blocked && (
            <span className="rounded border border-red-200 bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
              BLOCKED
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/inventory/product-batches/${id}/edit`)}
            className="flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-2 text-sm font-medium text-brand-600 shadow-sm transition-colors hover:bg-brand-100"
          >
            <Edit className="h-4 w-4" /> Edit
          </button>
          {!batch.is_blocked ? (
            <button
              onClick={() => setBlockModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition-colors hover:bg-red-100"
            >
              <Lock className="h-4 w-4" /> Block
            </button>
          ) : (
            <button
              onClick={() => setUnblockModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-sm font-medium text-green-600 shadow-sm transition-colors hover:bg-green-100"
            >
              <Unlock className="h-4 w-4" /> Unblock
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          <div>
            <p className="text-sm text-gray-500">Product</p>
            <p className="text-lg font-medium text-navy-700 dark:text-white">
              {batch.product?.product_name || "-"}
            </p>
            <p className="mt-0.5 font-mono text-xs text-gray-400">
              {batch.product?.product_code}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Supplier</p>
            <p className="font-medium">
              {batch.supplier?.supplier_name || "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Manufacture Date</p>
            <p className="font-medium">
              {batch.manufacture_date
                ? new Date(batch.manufacture_date).toLocaleDateString()
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Expiry Date</p>
            <p className="font-medium">
              {batch.expiry_date
                ? new Date(batch.expiry_date).toLocaleDateString()
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Purchase Rate</p>
            <p className="font-mono font-medium">
              Rs. {Number(batch.purchase_rate).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Selling Price</p>
            <p className="font-mono font-medium">
              Rs. {Number(batch.selling_price).toFixed(2)}
            </p>
          </div>
          {batch.is_blocked && (
            <div className="col-span-2 mt-2 rounded-xl border border-red-100 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
              <p className="mb-1 text-sm font-semibold text-red-600 dark:text-red-400">
                Block Reason
              </p>
              <p className="text-sm text-red-800 dark:text-red-300">
                {batch.block_reason}
              </p>
            </div>
          )}
        </div>
      </div>

      {blockModalOpen && (
        <BlockBatchModal
          isOpen={blockModalOpen}
          onClose={() => setBlockModalOpen(false)}
          onSave={() => {
            setBlockModalOpen(false);
            fetchBatch();
          }}
          batch={batch}
        />
      )}
      {unblockModalOpen && (
        <UnblockBatchModal
          isOpen={unblockModalOpen}
          onClose={() => setUnblockModalOpen(false)}
          onSave={() => {
            setUnblockModalOpen(false);
            fetchBatch();
          }}
          batch={batch}
        />
      )}
    </div>
  );
};
export default ProductBatchDetailsPage;
