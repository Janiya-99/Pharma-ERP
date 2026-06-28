import React, { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { useAuth } from "../../../auth/AuthContext";
import PermissionGuard from "../../../auth/PermissionGuard";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Skeleton } from "../../../components/ui/skeleton";
import { toast } from "sonner";
import type {
  SalesInvoice,
  SalesInvoiceApprovalStatus,
  SalesInvoicePostedStatus,
  SalesInvoicePaymentStatus,
  ApiResponse,
  PaginatedResponse,
} from "../../../types/invoice-center";
import {
  SalesInvoiceApprovalStatusBadge,
  SalesInvoicePostedStatusBadge,
  SalesInvoicePaymentStatusBadge,
} from "../../../components/invoice-center";

const SalesInvoicesPage: React.FC = () => {
  const { activeSoftware } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [approvalStatus, setApprovalStatus] = useState<string>("all");
  const [postedStatus, setPostedStatus] = useState<string>("all");
  const [paymentStatus, setPaymentStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchInvoices = async () => {
    if (activeSoftware?.software_code !== "INVOICE_CENTER") return;

    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (approvalStatus && approvalStatus !== "all")
        params.approval_status = approvalStatus;
      if (postedStatus && postedStatus !== "all")
        params.posted_status = postedStatus;
      if (paymentStatus && paymentStatus !== "all")
        params.payment_status = paymentStatus;

      const res = await invoiceCenterApi.getSalesInvoices(params);
      const payload = res.data as PaginatedResponse<SalesInvoice>;
      setInvoices(payload.data || []);
      setTotalPages(payload.pagination?.total_pages || 1);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to fetch sales invoices."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [
    activeSoftware,
    search,
    approvalStatus,
    postedStatus,
    paymentStatus,
    page,
  ]);

  if (activeSoftware?.software_code !== "INVOICE_CENTER") {
    return (
      <div className="p-8 text-center text-gray-500">
        Please switch to Invoice Center module to access this page.
      </div>
    );
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Sales Invoices
          </h1>
          <p className="text-sm text-gray-500">
            Manage all your sales invoices.
          </p>
        </div>
        <PermissionGuard permission="invoice_center.sales_invoice.create">
          <Button
            onClick={() => navigate("/invoice-center/sales-invoices/create")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </PermissionGuard>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search invoices..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={approvalStatus} onValueChange={setApprovalStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Approval Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Approvals</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={postedStatus} onValueChange={setPostedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Posted Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Postings</SelectItem>
                <SelectItem value="unposted">Unposted</SelectItem>
                <SelectItem value="posted">Posted</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="float-right h-8 w-16" />
                    </TableCell>
                  </TableRow>
                ))
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-24 text-center text-gray-500"
                  >
                    No sales invoices found.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                    <TableCell>
                      {invoice.customer?.customer_name ||
                        `Customer #${invoice.customer_id}`}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatMoney(invoice.total_amount)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      {formatMoney(invoice.balance_amount)}
                    </TableCell>
                    <TableCell>
                      <SalesInvoiceApprovalStatusBadge
                        status={invoice.approval_status}
                      />
                    </TableCell>
                    <TableCell>
                      <SalesInvoicePostedStatusBadge
                        status={invoice.posted_status}
                      />
                    </TableCell>
                    <TableCell>
                      <SalesInvoicePaymentStatusBadge
                        status={invoice.payment_status}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/invoice-center/sales-invoices/${invoice.id}`
                          )
                        }
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-4">
            <div className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SalesInvoicesPage;
