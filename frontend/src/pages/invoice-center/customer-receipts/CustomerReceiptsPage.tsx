import React, { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DataTable from "../../../components/common/DataTable";
import PermissionGuard from "../../../auth/PermissionGuard";
import { useAuth } from "../../../auth/AuthContext";
import invoiceCenterApi from "../../../api/invoiceCenterApi";
import {
  CustomerReceiptStatusBadge,
  CustomerReceiptApprovalStatusBadge,
  CustomerReceiptPostedStatusBadge,
  CustomerReceiptPaymentMethodBadge,
} from "../../../components/invoice-center";
import { formatCurrency, formatDate } from "../../../lib/utils";

const CustomerReceiptsPage = () => {
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
      const response = await invoiceCenterApi.getCustomerReceipts({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search,
      });
      const res = response as any;
      if (res.data?.success || res.success !== false) {
        let resData = [];
        if (Array.isArray(res.data?.data)) resData = res.data.data;
        else if (Array.isArray(res.data)) resData = res.data;
        const resTotal =
          res.data?.pagination?.total || res.pagination?.total || 0;
        setData(resData);
        setTotalRecords(resTotal);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load customer receipts"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row: any) => {
    navigate(`/admin/invoice-center/customer-receipts/${row.id}/edit`);
  };

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "receipt_number",
        header: "Receipt #",
        cell: (info: any) => (
          <Link
            to={`/admin/invoice-center/customer-receipts/${info.row.original.id}`}
            className="font-medium text-brand-500 hover:underline"
          >
            {info.getValue()}
          </Link>
        ),
      },
      {
        accessorKey: "receipt_date",
        header: "Date",
        cell: (info: any) => formatDate(info.getValue()),
      },
      {
        accessorKey: "customer.name",
        header: "Customer",
        cell: (info: any) => info.getValue() || info.row.original.customer_id,
      },
      {
        accessorKey: "payment_method",
        header: "Payment Method",
        cell: (info: any) => (
          <CustomerReceiptPaymentMethodBadge method={info.getValue()} />
        ),
      },
      {
        accessorKey: "receipt_amount",
        header: "Amount",
        cell: (info: any) => formatCurrency(info.getValue()),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info: any) => (
          <CustomerReceiptStatusBadge status={info.getValue()} />
        ),
      },
      {
        accessorKey: "approval_status",
        header: "Approval",
        cell: (info: any) => (
          <CustomerReceiptApprovalStatusBadge status={info.getValue()} />
        ),
      },
      {
        accessorKey: "posted_status",
        header: "Posted",
        cell: (info: any) => (
          <CustomerReceiptPostedStatusBadge status={info.getValue()} />
        ),
      },
    ],
    []
  );

  return (
    <div className="py-4">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-navy-700">Customer Receipts</h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage money received from customers and allocate to sales invoices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PermissionGuard permission="invoice_center.customer_receipt.create">
            <Link
              to="/admin/invoice-center/customer-receipts/create"
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
            >
              <Plus className="h-4 w-4" />
              <span>Create Receipt</span>
            </Link>
          </PermissionGuard>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-4">
          <div className="flex max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by receipt number..."
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          pagination={pagination}
          setPagination={setPagination}
          totalRecords={totalRecords}
          onRowClick={
            (hasPermission("invoice_center.customer_receipt.update")
              ? handleEdit
              : undefined) as any
          }
        />
      </div>
    </div>
  );
};

export default CustomerReceiptsPage;
