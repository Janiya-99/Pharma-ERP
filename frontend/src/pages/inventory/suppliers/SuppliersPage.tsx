import React, { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import DataTable from "../../../components/common/DataTable";
import PermissionGuard from "../../../auth/PermissionGuard";
import { useAuth } from "../../../auth/AuthContext";
import { inventoryApi } from "../../../api/inventoryApi";
import SupplierFormModal from "./SupplierFormModal";
import WarehouseTypeBadge from "../../../components/inventory/WarehouseTypeBadge";
import StorageConditionBadge from "../../../components/inventory/StorageConditionBadge";

const SuppliersPage = () => {
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
      const response = await inventoryApi.getSuppliers({
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
        await inventoryApi.deleteSupplier(row.id);
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
    { header: "Code", accessorKey: "supplier_code" },
    { header: "Name", accessorKey: "supplier_name" },
    { header: "Contact", accessorKey: "contact_person" },
    { header: "Phone", accessorKey: "contact_number" },
    { header: "Email", accessorKey: "email" },
    { header: "Terms (Days)", accessorKey: "payment_terms_days" },
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
            Suppliers
          </h1>
          <p className="mt-1 text-sm text-gray-500">Manage suppliers</p>
        </div>
        <div className="flex items-center gap-3">
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
          <PermissionGuard permission="inventory.product_master.create">
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

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          pagination={pagination}
          onPaginationChange={setPagination}
          pageCount={Math.ceil(totalRecords / pagination.pageSize)}
          onEdit={
            hasPermission("inventory.product_master.update")
              ? handleEdit
              : undefined
          }
          onDelete={
            hasPermission("inventory.product_master.delete")
              ? handleDelete
              : undefined
          }
        />
      </div>

      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingData}
      />
    </div>
  );
};

export default SuppliersPage;
