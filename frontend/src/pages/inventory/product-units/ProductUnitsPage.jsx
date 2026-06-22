import React, { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import DataTable from "../../../components/common/DataTable";
import PermissionGuard from "../../../auth/PermissionGuard";
import { useAuth } from "../../../auth/AuthContext";
import { inventoryApi } from "../../../api/inventoryApi";
import ProductUnitFormModal from "./ProductUnitFormModal";
import WarehouseTypeBadge from "../../../components/inventory/WarehouseTypeBadge";
import StorageConditionBadge from "../../../components/inventory/StorageConditionBadge";

const ProductUnitsPage = () => {
  const { hasPermission } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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
      const response = await inventoryApi.getProductUnits({
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

  const handleEdit = (row) => {
    setEditingData(row);
    setIsModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await inventoryApi.deleteProductUnit(row.id);
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
    {"header": "Unit Code", "accessorKey": "unit_code"},
    {"header": "Unit Name", "accessorKey": "unit_name"},
    {"header": "Description", "accessorKey": "description"},
    {"header": "Status", "accessorKey": "status", "cell": ({ row }) => <span className={`px-2 py-1 rounded-md text-xs font-medium ${row.original.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{row.original.status === "active" ? "Active" : "Inactive"}</span>}
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Product Units</h1>
          <p className="text-sm text-gray-500 mt-1">Manage {Title.toLowerCase()}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-700 text-gray-700 dark:text-white"
            />
          </div>
          <PermissionGuard permission="inventory.product_master.create">
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

      <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          pagination={pagination}
          onPaginationChange={setPagination}
          pageCount={Math.ceil(totalRecords / pagination.pageSize)}
          onEdit={hasPermission("inventory.product_master.update") ? handleEdit : undefined}
          onDelete={hasPermission("inventory.product_master.delete") ? handleDelete : undefined}
        />
      </div>

      <ProductUnitFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingData}
      />
    </div>
  );
};

export default ProductUnitsPage;
