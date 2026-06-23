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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/inventory/product-batches")} className="p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            Batch: {batch.batch_number}
          </h1>
          <BatchStatusBadge status={batch.batch_status} />
          {batch.is_blocked && <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded font-semibold border border-red-200">BLOCKED</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`/inventory/product-batches/${id}/edit`)} className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-100 transition-colors shadow-sm text-sm font-medium">
            <Edit className="h-4 w-4" /> Edit
          </button>
          {!batch.is_blocked ? (
            <button onClick={() => setBlockModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors shadow-sm text-sm font-medium">
              <Lock className="h-4 w-4" /> Block
            </button>
          ) : (
            <button onClick={() => setUnblockModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors shadow-sm text-sm font-medium">
              <Unlock className="h-4 w-4" /> Unblock
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
          <div>
            <p className="text-sm text-gray-500">Product</p>
            <p className="font-medium text-lg text-navy-700 dark:text-white">{batch.product?.product_name || "-"}</p>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{batch.product?.product_code}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Supplier</p>
            <p className="font-medium">{batch.supplier?.supplier_name || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Manufacture Date</p>
            <p className="font-medium">{batch.manufacture_date ? new Date(batch.manufacture_date).toLocaleDateString() : "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Expiry Date</p>
            <p className="font-medium">{batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Purchase Rate</p>
            <p className="font-medium font-mono">Rs. {Number(batch.purchase_rate).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Selling Price</p>
            <p className="font-medium font-mono">Rs. {Number(batch.selling_price).toFixed(2)}</p>
          </div>
          {batch.is_blocked && (
            <div className="col-span-2 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50 mt-2">
              <p className="text-sm text-red-600 dark:text-red-400 font-semibold mb-1">Block Reason</p>
              <p className="text-sm text-red-800 dark:text-red-300">{batch.block_reason}</p>
            </div>
          )}
        </div>
      </div>

      {blockModalOpen && (
        <BlockBatchModal isOpen={blockModalOpen} onClose={() => setBlockModalOpen(false)} onSave={() => { setBlockModalOpen(false); fetchBatch(); }} batch={batch} />
      )}
      {unblockModalOpen && (
        <UnblockBatchModal isOpen={unblockModalOpen} onClose={() => setUnblockModalOpen(false)} onSave={() => { setUnblockModalOpen(false); fetchBatch(); }} batch={batch} />
      )}
    </div>
  );
};
export default ProductBatchDetailsPage;
