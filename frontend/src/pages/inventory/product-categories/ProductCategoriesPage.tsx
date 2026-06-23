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
      const response = await inventoryApi.getProductCategorys({
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
    {"header": "Category Code", "accessorKey": "category_code"},
    {"header": "Category Name", "accessorKey": "category_name"},
    {"header": "Parent Category", "accessorKey": "parent_id"},
    {"header": "Level", "accessorKey": "level"},
    {"header": "Description", "accessorKey": "description"},
    {"header": "Status", "accessorKey": "status", "cell": ({ row }: { row?: unknown }) => <span className={`px-2 py-1 rounded-md text-xs font-medium ${row.original.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{row.original.status === "active" ? "Active" : "Inactive"}</span>}
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Product Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage {Title.toLowerCase()}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-navy-700 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === "table" ? "bg-white dark:bg-navy-600 shadow-sm text-brand-600 dark:text-brand-400" : "text-gray-500 hover:text-gray-700"}`}
              title="Table View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("tree")}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === "tree" ? "bg-white dark:bg-navy-600 shadow-sm text-brand-600 dark:text-brand-400" : "text-gray-500 hover:text-gray-700"}`}
              title="Tree View"
            >
              <GitMerge className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-700 text-gray-700 dark:text-white"
            />
          </div>
          <PermissionGuard permission="inventory.product_category.create">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors shadow-sm text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Add New
            </button>
          </PermissionGuard>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            pagination={pagination}
            onPaginationChange={setPagination}
            pageCount={Math.ceil(totalRecords / pagination.pageSize)}
            onEdit={hasPermission("inventory.product_category.update") ? handleEdit : undefined}
            onDelete={hasPermission("inventory.product_category.delete") ? handleDelete : undefined}
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
