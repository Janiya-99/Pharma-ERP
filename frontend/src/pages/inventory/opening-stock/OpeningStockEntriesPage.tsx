import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import DataTable from "../../../components/common/DataTable";
import PermissionGuard from "../../../auth/PermissionGuard";
import { useAuth } from "../../../auth/AuthContext";
import { inventoryApi } from "../../../api/inventoryApi";
import OpeningStockStatusBadge from "../../../components/inventory/OpeningStockStatusBadge";
import InventoryPostedStatusBadge from "../../../components/inventory/InventoryPostedStatusBadge";
import { formatCurrency, formatNumber, formatDate } from "../../../lib/utils";

const OpeningStockEntriesPage = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
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
      const response = await inventoryApi.getOpeningStockEntries({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search,
      });
      if ((response as any).data?.success) {
        const resData = (response as any).data?.data || [];
        const resTotal = (response as any).data?.pagination?.total || 0;
        setData(resData);
        setTotalRecords(resTotal);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load opening stock entries");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row: any) => {
    if (row.approval_status === "draft" || row.approval_status === "rejected") {
      navigate(`/inventory/opening-stock/${row.id}/edit`);
    } else {
      toast.error("Only draft or rejected entries can be edited");
    }
  };

  const handleView = (row: any) => {
    navigate(`/inventory/opening-stock/${row.id}`);
  };

  const handleDelete = async (row: any) => {
    if (row.posted_status === "posted") {
      toast.error("Posted entries cannot be deleted");
      return;
    }
    if (row.approval_status !== "draft" && row.approval_status !== "rejected") {
      toast.error("Only draft or rejected entries can be deleted");
      return;
    }

    if (window.confirm("Are you sure you want to delete this opening stock entry?")) {
      try {
        await inventoryApi.deleteOpeningStockEntry(row.id);
        toast.success("Entry deleted successfully");
        fetchData();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete entry");
      }
    }
  };

  const columns = [
    { header: "Number", accessorKey: "opening_stock_number" },
    { header: "Date", accessorKey: "opening_stock_date", cell: ({ row }: { row?: any }) => formatDate(row.original.opening_stock_date) },
    { header: "Warehouse", accessorKey: "warehouse_id", cell: ({ row }: { row?: any }) => row.original.warehouse?.warehouse_name || row.original.warehouse_id },
    { header: "Reference", accessorKey: "reference_number" },
    { header: "Total Qty", accessorKey: "total_quantity", cell: ({ row }: { row?: any }) => formatNumber(row.original.total_quantity, 3) },
    { header: "Total Value", accessorKey: "total_stock_value", cell: ({ row }: { row?: any }) => formatCurrency(row.original.total_stock_value) },
    { header: "Approval", accessorKey: "approval_status", cell: ({ row }: { row?: any }) => <OpeningStockStatusBadge status={row.original.approval_status} /> },
    { header: "Posted", accessorKey: "posted_status", cell: ({ row }: { row?: any }) => <InventoryPostedStatusBadge status={row.original.posted_status} /> },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Opening Stock</h1>
          <p className="text-sm text-gray-500 mt-1">Manage initial inventory uploads</p>
        </div>
        <div className="flex items-center gap-3">
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
          <PermissionGuard permission="inventory.opening_stock.create">
            <Link
              to="/inventory/opening-stock/create"
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors shadow-sm text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Add New
            </Link>
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
          onEdit={hasPermission("inventory.opening_stock.update") ? handleEdit : undefined}
          onDelete={hasPermission("inventory.opening_stock.delete") ? handleDelete : undefined}
          onView={hasPermission("inventory.opening_stock.view") ? handleView : undefined}
        />
      </div>
    </div>
  );
};

export default OpeningStockEntriesPage;
