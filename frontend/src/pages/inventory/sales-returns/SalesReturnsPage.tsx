import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import { inventoryApi } from "api/inventoryApi";
import { SalesReturn } from "types/inventory";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Card, CardContent } from "components/ui/card";
import DataTable from "components/common/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import {
  SalesReturnStatusBadge,
  SalesReturnPostedStatusBadge,
  SalesReturnReasonBadge,
  SalesReturnConditionBadge,
} from "components/inventory/SalesReturnBadges";
import PermissionGuard from "auth/PermissionGuard";
import { useAuth } from "auth/AuthContext";

const SalesReturnsPage: React.FC = () => {
  const [data, setData] = useState<SalesReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const response = await inventoryApi.getSalesReturns({
        page,
        limit,
        search,
      });
      if (response.data?.success) {
        setData(response.data.data as any);
        setTotal((response.data as any).pagination?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch sales returns", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.active_software_code !== "INVENTORY") {
      return;
    }
    fetchReturns();
  }, [page, limit, search, user?.active_software_code]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this sales return?")) return;
    try {
      await inventoryApi.deleteSalesReturn(id);
      fetchReturns();
    } catch (error) {
      console.error("Failed to delete", error);
      alert("Failed to delete. Make sure it is draft or rejected and unposted.");
    }
  };

  const columns = useMemo(() => [
    {
      header: "Return No",
      accessorKey: "sales_return_number",
      cell: ({ row }: { row: { original: SalesReturn } }) => (
        <span className="font-medium text-blue-600">{row.original.sales_return_number}</span>
      ),
    },
    {
      header: "Date",
      accessorKey: "sales_return_date",
      cell: ({ row }: { row: { original: SalesReturn } }) => (
        <span>{new Date(row.original.sales_return_date).toLocaleDateString()}</span>
      ),
    },
    {
      header: "Customer",
      accessorKey: "customer_name",
      cell: ({ row }: { row: { original: SalesReturn } }) => row.original.customer_name || "N/A",
    },
    {
      header: "Warehouse",
      accessorKey: "warehouse.warehouse_name",
      cell: ({ row }: { row: { original: SalesReturn } }) => row.original.warehouse?.warehouse_name || "N/A",
    },
    {
      header: "Reason",
      accessorKey: "return_reason",
      cell: ({ row }: { row: { original: SalesReturn } }) => (
        <SalesReturnReasonBadge reason={row.original.return_reason} />
      ),
    },
    {
      header: "Condition",
      accessorKey: "return_condition",
      cell: ({ row }: { row: { original: SalesReturn } }) => (
        <SalesReturnConditionBadge condition={row.original.return_condition} />
      ),
    },
    {
      header: "Quantity",
      accessorKey: "total_quantity",
      cell: ({ row }: { row: { original: SalesReturn } }) => (
        <span className="font-mono">{row.original.total_quantity?.toFixed(3)}</span>
      ),
    },
    {
      header: "Amount (LKR)",
      accessorKey: "total_amount",
      cell: ({ row }: { row: { original: SalesReturn } }) => (
        <span className="font-mono">{(row.original.total_amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "approval_status",
      cell: ({ row }: { row: { original: SalesReturn } }) => (
        <div className="flex flex-col gap-1">
          <SalesReturnStatusBadge status={row.original.approval_status} />
          {row.original.posted_status === "posted" && (
            <SalesReturnPostedStatusBadge status={row.original.posted_status} />
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: ({ row }: { row: { original: SalesReturn } }) => {
        const canEditOrDelete = ["draft", "rejected"].includes(row.original.approval_status) && row.original.posted_status === "unposted";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/inventory/sales-returns/${row.original.id}`)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              {canEditOrDelete && (
                <PermissionGuard permission="inventory.sales_return.update">
                  <DropdownMenuItem onClick={() => navigate(`/inventory/sales-returns/${row.original.id}/edit`)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                </PermissionGuard>
              )}
              {canEditOrDelete && (
                <PermissionGuard permission="inventory.sales_return.delete">
                  <DropdownMenuItem 
                    onClick={() => handleDelete(row.original.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </PermissionGuard>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [navigate]);

  if (user?.active_software_code !== "INVENTORY") {
    return (
      <div className="p-6 bg-red-50 text-red-600 border border-red-200 rounded">
        Please switch to Inventory module to access this page.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Sales Returns</h1>
          <p className="text-sm text-slate-500">Manage returns from customers</p>
        </div>
        <PermissionGuard permission="inventory.sales_return.create">
          <Link to="/inventory/sales-returns/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Return
            </Button>
          </Link>
        </PermissionGuard>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search return number, customer..."
                className="pl-9 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Additional filters can go here */}
          </div>

          <DataTable
            columns={columns as any}
            data={data}
            loading={loading}
            onRowClick={(row: SalesReturn) => navigate(`/inventory/sales-returns/${row.id}`)}
            pagination={{
              page,
              limit,
              total,
              onPageChange: setPage,
              onLimitChange: setLimit,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesReturnsPage;
