import { useState, useEffect } from "react";
import { Plus, Search, Eye, Edit, Lock, Unlock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import DataTable from "../../../components/common/DataTable";
import PermissionGuard from "../../../auth/PermissionGuard";
import { useAuth } from "../../../auth/AuthContext";
import { inventoryApi } from "../../../api/inventoryApi";
import BatchStatusBadge from "../../../components/inventory/BatchStatusBadge";
import BlockBatchModal from "./BlockBatchModal";
import UnblockBatchModal from "./UnblockBatchModal";

const ProductBatchesPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalRecords, setTotalRecords] = useState(0);

  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [unblockModalOpen, setUnblockModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.pageSize, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await inventoryApi.getProductBatches({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search,
      });
      if (response.data?.success) {
        setData(response.data.data);
        setTotalRecords(response.data.pagination.total);
      }
    } catch (error) {
      toast.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = (row: unknown) => {
    setSelectedBatch(row);
    setBlockModalOpen(true);
  };

  const handleUnblock = (row: unknown) => {
    setSelectedBatch(row);
    setUnblockModalOpen(true);
  };

  const columns = [
    { header: "Product", accessorKey: "product.product_name" },
    { header: "Batch", accessorKey: "batch_number" },
    { header: "Mfg Date", accessorKey: "manufacture_date", cell: ({ row }: { row?: unknown }) => row.original.manufacture_date ? new Date(row.original.manufacture_date).toLocaleDateString() : "-" },
    { 
      header: "Exp Date", 
      accessorKey: "expiry_date", 
      cell: ({ row }: { row?: unknown }) => {
        if (!row.original.expiry_date) return "-";
        const isExpired = new Date(row.original.expiry_date) < new Date();
        const dateStr = new Date(row.original.expiry_date).toLocaleDateString();
        return <span className={isExpired ? "text-red-600 font-medium" : ""}>{dateStr}</span>;
      }
    },
    { header: "Purchase Rate", accessorKey: "purchase_rate", cell: ({ row }: { row?: unknown }) => Number(row.original.purchase_rate).toFixed(2) },
    { header: "Selling Price", accessorKey: "selling_price", cell: ({ row }: { row?: unknown }) => Number(row.original.selling_price).toFixed(2) },
    { 
      header: "Status", 
      id: "status",
      cell: ({ row }: { row?: unknown }) => (
        <div className="flex gap-2">
          <BatchStatusBadge status={row.original.batch_status} />
          {row.original.is_blocked && <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">Blocked</span>}
        </div>
      ) 
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }: { row?: unknown }) => (
        <div className="flex items-center gap-2">
          <PermissionGuard permission="inventory.product_batch.view">
            <button onClick={() => navigate(`/inventory/product-batches/${row.original.id}`)} className="p-1 text-gray-500 hover:text-brand-600 transition-colors" title="View">
              <Eye className="w-4 h-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard permission="inventory.product_batch.update">
            <button onClick={() => navigate(`/inventory/product-batches/${row.original.id}/edit`)} className="p-1 text-gray-500 hover:text-brand-600 transition-colors" title="Edit">
              <Edit className="w-4 h-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard permission="inventory.product_batch.block">
            {!row.original.is_blocked ? (
              <button onClick={() => handleBlock(row.original)} className="p-1 text-gray-500 hover:text-red-600 transition-colors" title="Block">
                <Lock className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => handleUnblock(row.original)} className="p-1 text-gray-500 hover:text-green-600 transition-colors" title="Unblock">
                <Unlock className="w-4 h-4" />
              </button>
            )}
          </PermissionGuard>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Product Batches</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track inventory batches</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search..." value={search} onChange={(e: any) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-700 text-gray-700 dark:text-white" />
          </div>
          <PermissionGuard permission="inventory.product_batch.create">
            <button onClick={() => navigate("/inventory/product-batches/create")} className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors shadow-sm text-sm font-medium">
              <Plus className="h-4 w-4" /> Add Batch
            </button>
          </PermissionGuard>
        </div>
      </div>
      <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
        <DataTable columns={columns} data={data} loading={loading} pagination={pagination} onPaginationChange={setPagination} pageCount={Math.ceil(totalRecords / pagination.pageSize)} />
      </div>

      {blockModalOpen && (
        <BlockBatchModal isOpen={blockModalOpen} onClose={() => setBlockModalOpen(false)} onSave={() => { setBlockModalOpen(false); fetchData(); }} batch={selectedBatch} />
      )}
      {unblockModalOpen && (
        <UnblockBatchModal isOpen={unblockModalOpen} onClose={() => setUnblockModalOpen(false)} onSave={() => { setUnblockModalOpen(false); fetchData(); }} batch={selectedBatch} />
      )}
    </div>
  );
};
export default ProductBatchesPage;
