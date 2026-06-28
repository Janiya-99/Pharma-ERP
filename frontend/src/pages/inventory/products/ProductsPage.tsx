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
    {
      header: "Type",
      accessorKey: "product_type",
      cell: ({ row }: { row?: unknown }) => (
        <ProductTypeBadge type={row.original.product_type} />
      ),
    },
    { header: "Generic Name", accessorKey: "generic_name.generic_name" },
    { header: "Manufacturer", accessorKey: "manufacturer.manufacturer_name" },
    {
      header: "Tracking",
      id: "tracking",
      cell: ({ row }: { row?: unknown }) => (
        <div className="flex gap-1">
          {row.original.requires_batch_tracking && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700">
              Batch
            </span>
          )}
          {row.original.requires_expiry_tracking && (
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] text-orange-700">
              Expiry
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Storage",
      accessorKey: "storage_condition",
      cell: ({ row }: { row?: unknown }) => (
        <StorageConditionBadge condition={row.original.storage_condition} />
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }: { row?: unknown }) => (
        <span
          className={`rounded-md px-2 py-1 text-xs font-medium ${
            row.original.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.original.status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }: { row?: unknown }) => (
        <div className="flex items-center gap-1">
          <PermissionGuard permission="inventory.product_master.view">
            <button
              onClick={() => navigate(`/inventory/products/${row.original.id}`)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors duration-150 hover:bg-indigo-50 hover:text-indigo-600"
              title="View"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          </PermissionGuard>
          <PermissionGuard permission="inventory.product_master.update">
            <button
              onClick={() =>
                navigate(`/inventory/products/${row.original.id}/edit`)
              }
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors duration-150 hover:bg-amber-50 hover:text-amber-600"
              title="Edit"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
          </PermissionGuard>
          <PermissionGuard permission="inventory.product_master.delete">
            <button
              onClick={() => handleDelete(row.original.id)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="page-content">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[18px] font-bold tracking-tight text-gray-900">
            Products
          </h1>
          <p className="mt-0.5 text-[13px] text-gray-500">
            Manage product master data
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              className="input-premium w-56 pl-9"
            />
          </div>
          <PermissionGuard permission="inventory.product_master.create">
            <button
              onClick={() => navigate("/inventory/products/create")}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700 active:bg-indigo-800"
            >
              <Plus className="h-3.5 w-3.5" /> Add Product
            </button>
          </PermissionGuard>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        pagination={pagination}
        onPaginationChange={setPagination}
        pageCount={Math.ceil(totalRecords / pagination.pageSize)}
      />
    </div>
  );
};
export default ProductsPage;
