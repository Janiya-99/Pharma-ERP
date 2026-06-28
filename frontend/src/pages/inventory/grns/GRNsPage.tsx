import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import DataTable from "../../../components/common/DataTable";
import PermissionGuard from "../../../auth/PermissionGuard";
import { useAuth } from "../../../auth/AuthContext";
import { inventoryApi } from "../../../api/inventoryApi";
import GRNStatusBadge from "../../../components/inventory/GRNStatusBadge";
import GRNPostedStatusBadge from "../../../components/inventory/GRNPostedStatusBadge";
import { formatCurrency, formatNumber, formatDate } from "../../../lib/utils";

const GRNsPage = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
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
      const response = await inventoryApi.getGRNs({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search,
      });
      const res = response as any;
      if (res.data?.success || res.success !== false) {
        let resData = [];
        if (Array.isArray(res.data?.data)) resData = res.data.data;
        else if (Array.isArray(res.data)) resData = res.data;
        const resTotal = res.data?.pagination?.total || res.pagination?.total || 0;
        setData(resData);
        setTotalRecords(resTotal);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load GRNs");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row: any) => {
    if (row.posted_status === "posted") {
      toast.error("Posted GRNs cannot be edited");
      return;
    }
    if (row.approval_status === "draft" || row.approval_status === "rejected") {
      navigate(`/inventory/grns/${row.id}/edit`);
    } else {
      toast.error("Only draft or rejected GRNs can be edited");
    }
  };

  const handleView = (row: any) => {
    navigate(`/inventory/grns/${row.id}`);
  };

  const handleDelete = async (row: any) => {
    if (row.posted_status === "posted") {
      toast.error("Posted GRNs cannot be deleted");
      return;
    }
    if (row.approval_status !== "draft" && row.approval_status !== "rejected") {
      toast.error("Only draft or rejected GRNs can be deleted");
      return;
    }

    if (window.confirm("Are you sure you want to delete this GRN?")) {
      try {
        await inventoryApi.deleteGRN(row.id);
        toast.success("GRN deleted successfully");
        fetchData();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete GRN");
      }
    }
  };

  const columns = [
    { header: "GRN Number", accessorKey: "grn_number" },
    { header: "Date", accessorKey: "grn_date", cell: ({ row }: { row?: any }) => formatDate(row.original.grn_date) },
    { header: "Supplier", accessorKey: "supplier_id", cell: ({ row }: { row?: any }) => row.original.supplier?.supplier_name || `Supplier #${row.original.supplier_id}` },
    { header: "Warehouse", accessorKey: "warehouse_id", cell: ({ row }: { row?: any }) => row.original.warehouse?.warehouse_name || `Warehouse #${row.original.warehouse_id}` },
    { header: "Supp. Inv", accessorKey: "supplier_invoice_number" },
    { header: "Total Stock", accessorKey: "total_stock_quantity", cell: ({ row }: { row?: any }) => formatNumber(row.original.total_stock_quantity, 3) },
    { header: "Total Amount", accessorKey: "total_amount", cell: ({ row }: { row?: any }) => formatCurrency(row.original.total_amount) },
    { header: "Approval", accessorKey: "approval_status", cell: ({ row }: { row?: any }) => <GRNStatusBadge status={row.original.approval_status} /> },
    { header: "Posted", accessorKey: "posted_status", cell: ({ row }: { row?: any }) => <GRNPostedStatusBadge status={row.original.posted_status} /> },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Goods Receipt Notes</h1>
          <p className="text-sm text-gray-500 mt-1">Manage supplier deliveries and GRNs</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search GRNs..."
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-700 text-gray-700 dark:text-white"
            />
          </div>
          <PermissionGuard permission="inventory.grn.create">
            <Link
              to="/inventory/grns/create"
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors shadow-sm text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Create GRN
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
          onEdit={hasPermission("inventory.grn.update") ? handleEdit : undefined}
          onDelete={hasPermission("inventory.grn.delete") ? handleDelete : undefined}
          onView={hasPermission("inventory.grn.view") ? handleView : undefined}
        />
      </div>
    </div>
  );
};

export default GRNsPage;
