import React, { useState, useEffect } from "react";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import DataTable from "../../../components/common/DataTable";
import PermissionGuard from "../../../auth/PermissionGuard";
import { useAuth } from "../../../auth/AuthContext";
import { inventoryApi } from "../../../api/inventoryApi";
import ProductTypeBadge from "../../../components/inventory/ProductTypeBadge";
import StorageConditionBadge from "../../../components/inventory/StorageConditionBadge";

const ProductsPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.pageSize, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await inventoryApi.getProducts({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search,
      });
      if (response.data?.success) {
        setData(response.data.data);
        setTotalRecords(response.data.pagination.total);
      }
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await inventoryApi.deleteProduct(id);
        toast.success("Product deleted successfully");
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete");
      }
    }
  };

  const columns = [
    { header: "Code", accessorKey: "product_code" },
    { header: "Name", accessorKey: "product_name" },
    { header: "Type", accessorKey: "product_type", cell: ({ row }: { row?: unknown }) => <ProductTypeBadge type={row.original.product_type} /> },
    { header: "Generic Name", accessorKey: "generic_name.generic_name" },
    { header: "Manufacturer", accessorKey: "manufacturer.manufacturer_name" },
    { 
      header: "Tracking", 
      id: "tracking",
      cell: ({ row }: { row?: unknown }) => (
        <div className="flex gap-1">
          {row.original.requires_batch_tracking && <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700">Batch</span>}
          {row.original.requires_expiry_tracking && <span className="px-2 py-0.5 rounded-full text-[10px] bg-orange-100 text-orange-700">Expiry</span>}
        </div>
      )
    },
    { header: "Storage", accessorKey: "storage_condition", cell: ({ row }: { row?: unknown }) => <StorageConditionBadge condition={row.original.storage_condition} /> },
    { header: "Status", accessorKey: "status", cell: ({ row }: { row?: unknown }) => <span className={`px-2 py-1 rounded-md text-xs font-medium ${row.original.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{row.original.status === "active" ? "Active" : "Inactive"}</span> },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }: { row?: unknown }) => (
        <div className="flex items-center gap-2">
          <PermissionGuard permission="inventory.product_master.view">
            <button onClick={() => navigate(`/inventory/products/${row.original.id}`)} className="p-1 text-gray-500 hover:text-brand-600 transition-colors" title="View">
              <Eye className="w-4 h-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard permission="inventory.product_master.update">
            <button onClick={() => navigate(`/inventory/products/${row.original.id}/edit`)} className="p-1 text-gray-500 hover:text-brand-600 transition-colors" title="Edit">
              <Edit className="w-4 h-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard permission="inventory.product_master.delete">
            <button onClick={() => handleDelete(row.original.id)} className="p-1 text-gray-500 hover:text-red-600 transition-colors" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </PermissionGuard>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product master data</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search..." value={search} onChange={(e: any) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-700 text-gray-700 dark:text-white" />
          </div>
          <PermissionGuard permission="inventory.product_master.create">
            <button onClick={() => navigate("/inventory/products/create")} className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors shadow-sm text-sm font-medium">
              <Plus className="h-4 w-4" /> Add Product
            </button>
          </PermissionGuard>
        </div>
      </div>
      <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
        <DataTable columns={columns} data={data} loading={loading} pagination={pagination} onPaginationChange={setPagination} pageCount={Math.ceil(totalRecords / pagination.pageSize)} />
      </div>
    </div>
  );
};
export default ProductsPage;
