import React, { useState, useEffect } from "react";
import { Plus, Search, List as ListIcon, GitMerge } from "lucide-react";
import { toast } from "react-hot-toast";
import DataTable from "../../../components/common/DataTable";
import PermissionGuard from "../../../auth/PermissionGuard";
import { useAuth } from "../../../auth/AuthContext";
import { inventoryApi } from "../../../api/inventoryApi";
import ProductCategoryFormModal from "./ProductCategoryFormModal";
import ProductCategoryTree from "./ProductCategoryTree";

const ProductCategoriesPage = () => {
  const { hasPermission } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'tree'
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalRecords, setTotalRecords] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.pageSize, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await inventoryApi.getProductCategories({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search,
      });
      if (response.data?.success) {
        setData(response.data.data);
        setTotalRecords(response.data.pagination.total);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleEdit = (row: unknown) => {
    setEditingData(row);
    setIsModalOpen(true);
  };

  const handleDelete = async (row: unknown) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await inventoryApi.deleteProductCategory(row.id);
        toast.success("Record deleted successfully");
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete");
      }
    }
  };

  const handleSave = () => {
    setIsModalOpen(false);
    fetchData();
  };

  const columns = [
    { header: "Category Code", accessorKey: "category_code" },
    { header: "Category Name", accessorKey: "category_name" },
    { header: "Parent Category", accessorKey: "parent_id" },
    { header: "Level", accessorKey: "level" },
    { header: "Description", accessorKey: "description" },
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
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            Product Categories
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage product categories
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-navy-700">
            <button
              onClick={() => setViewMode("table")}
              className={`rounded-lg p-1.5 transition-colors ${
                viewMode === "table"
                  ? "bg-white text-brand-600 shadow-sm dark:bg-navy-600 dark:text-brand-400"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Table View"
            >
              <ListIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("tree")}
              className={`rounded-lg p-1.5 transition-colors ${
                viewMode === "tree"
                  ? "bg-white text-brand-600 shadow-sm dark:bg-navy-600 dark:text-brand-400"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Tree View"
            >
              <GitMerge className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-700 focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
            />
          </div>
          <PermissionGuard permission="inventory.product_category.create">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-600"
            >
              <Plus className="h-4 w-4" />
              Add New
            </button>
          </PermissionGuard>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            pagination={pagination}
            onPaginationChange={setPagination}
            pageCount={Math.ceil(totalRecords / pagination.pageSize)}
            onEdit={
              hasPermission("inventory.product_category.update")
                ? handleEdit
                : undefined
            }
            onDelete={
              hasPermission("inventory.product_category.delete")
                ? handleDelete
                : undefined
            }
          />
        </div>
      ) : (
        <ProductCategoryTree data={data} />
      )}

      <ProductCategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingData}
      />
    </div>
  );
};

export default ProductCategoriesPage;
