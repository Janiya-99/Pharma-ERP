import React, { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { getBranches } from "../../../api/controlApi";
import { inventoryApi } from "../../../api/inventoryApi";
import { useAuth } from "../../../auth/AuthContext";
import PermissionGuard from "../../../auth/PermissionGuard";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { DatePicker } from "../../../components/ui/date-picker";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Skeleton } from "../../../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  SalesInvoiceActionButtons,
  SalesInvoiceApprovalStatusBadge,
  SalesInvoicePaymentStatusBadge,
  SalesInvoicePostedStatusBadge,
} from "../../../components/invoice-center";
import type {
  PaginatedResponse,
  SalesInvoice,
  SalesInvoiceApprovalStatus,
  SalesInvoiceListParams,
  SalesInvoicePaymentStatus,
  SalesInvoicePostedStatus,
} from "../../../types/invoice-center";
import {
  ApproveSalesInvoiceModal,
  CancelSalesInvoiceModal,
  DeleteSalesInvoiceConfirmModal,
  PostSalesInvoiceConfirmModal,
  RejectSalesInvoiceModal,
  SubmitSalesInvoiceModal,
} from "./";

type ModalName =
  | "submit"
  | "approve"
  | "reject"
  | "post"
  | "cancel"
  | "delete"
  | null;

type FilterState = {
  search: string;
  branch_id: string;
  customer_id: string;
  sales_order_id: string;
  warehouse_id: string;
  approval_status: "all" | SalesInvoiceApprovalStatus;
  posted_status: "all" | SalesInvoicePostedStatus;
  payment_status: "all" | SalesInvoicePaymentStatus;
  invoice_date_from: string;
  invoice_date_to: string;
  due_date_from: string;
  due_date_to: string;
};

const emptyFilters: FilterState = {
  search: "",
  branch_id: "",
  customer_id: "",
  sales_order_id: "",
  warehouse_id: "",
  approval_status: "all",
  posted_status: "all",
  payment_status: "all",
  invoice_date_from: "",
  invoice_date_to: "",
  due_date_from: "",
  due_date_to: "",
};

const formatMoney = (amount?: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
  }).format(Number(amount || 0));

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
};

const getCustomerName = (invoice: SalesInvoice) =>
  invoice.customer?.customer_name ||
  invoice.customer_name ||
  `Customer #${invoice.customer_id}`;

const getCustomerCode = (invoice: SalesInvoice) =>
  invoice.customer?.customer_code || invoice.customer_code || "-";

const getSalesOrderNumber = (invoice: SalesInvoice) =>
  invoice.sales_order?.sales_order_number ||
  (invoice.sales_order_id ? `SO #${invoice.sales_order_id}` : "-");

const getWarehouseName = (invoice: SalesInvoice) =>
  invoice.warehouse?.warehouse_name || `Warehouse #${invoice.warehouse_id}`;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } })
      .response;
    return response?.data?.message || fallback;
  }
  return fallback;
};

const SalesInvoicesPage: React.FC = () => {
  const { activeSoftware } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(
    null
  );
  const [modal, setModal] = useState<ModalName>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  const listFromResponse = (response: any) => {
    const payload = response?.data ?? response;
    return payload?.data?.items || payload?.data || payload?.items || [];
  };

  const params = useMemo<SalesInvoiceListParams>(() => {
    const next: SalesInvoiceListParams = { page, limit: 10 };
    if (filters.search) next.search = filters.search;
    if (filters.branch_id) next.branch_id = Number(filters.branch_id);
    if (filters.customer_id) next.customer_id = Number(filters.customer_id);
    if (filters.sales_order_id)
      next.sales_order_id = Number(filters.sales_order_id);
    if (filters.warehouse_id) next.warehouse_id = Number(filters.warehouse_id);
    if (filters.approval_status !== "all")
      next.approval_status = filters.approval_status;
    if (filters.posted_status !== "all")
      next.posted_status = filters.posted_status;
    if (filters.payment_status !== "all")
      next.payment_status = filters.payment_status;
    if (filters.invoice_date_from)
      next.invoice_date_from = filters.invoice_date_from;
    if (filters.invoice_date_to) next.invoice_date_to = filters.invoice_date_to;
    if (filters.due_date_from) next.due_date_from = filters.due_date_from;
    if (filters.due_date_to) next.due_date_to = filters.due_date_to;
    return next;
  }, [filters, page]);

  const fetchInvoices = async () => {
    if (activeSoftware?.software_code !== "INVOICE_CENTER") return;
    setLoading(true);
    try {
      const res = await invoiceCenterApi.getSalesInvoices(params);
      const payload = res.data as PaginatedResponse<SalesInvoice>;
      setInvoices(payload.data || []);
      setTotalPages(payload.pagination?.total_pages || 1);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to fetch sales invoices."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [activeSoftware, params]);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [branchRes, customerRes, warehouseRes] = await Promise.all([
          getBranches({ limit: 500, status: "active" }),
          invoiceCenterApi.getCustomers({ limit: 1000, status: "active" }),
          inventoryApi.getWarehouses({ limit: 1000, status: "active" }),
        ]);

        setBranches(listFromResponse(branchRes));
        setCustomers(listFromResponse(customerRes));
        setWarehouses(listFromResponse(warehouseRes));
      } catch (error) {
        console.error("Failed to load sales invoice filter dropdowns", error);
      }
    };

    loadFilterOptions();
  }, []);

  const openModal = (name: ModalName, invoice: SalesInvoice) => {
    setSelectedInvoice(invoice);
    setModal(name);
  };

  const closeModal = () => {
    setModal(null);
    setSelectedInvoice(null);
  };

  const refreshAfterAction = () => {
    closeModal();
    fetchInvoices();
  };

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  if (activeSoftware?.software_code !== "INVOICE_CENTER") {
    return (
      <div className="m-6 rounded-xl border border-rose-200 bg-rose-50 p-8 text-center font-medium text-rose-600">
        Please switch to Invoice Center module to access this page.
      </div>
    );
  }

  return (
    <PermissionGuard permission="invoice_center.sales_invoice.view">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-navy-900">
              Sales Invoices
            </h1>
            <p className="text-sm text-muted-foreground">
              Create, approve, post, and monitor customer billing documents.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={fetchInvoices}
              disabled={loading}
              title="Refresh"
            >
              <RefreshCw
                className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"}
              />
            </Button>
            <PermissionGuard permission="invoice_center.sales_invoice.create">
              <Button
                type="button"
                onClick={() =>
                  navigate("/invoice-center/sales-invoices/create")
                }
              >
                <Plus className="h-4 w-4" />
                Create Sales Invoice
              </Button>
            </PermissionGuard>
          </div>
        </div>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="space-y-1 md:col-span-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={filters.search}
                  onChange={(event) =>
                    updateFilter("search", event.target.value)
                  }
                  className="pl-8"
                  placeholder="Invoice, customer, order, reference"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Branch</Label>
              <Select
                value={filters.branch_id || "all"}
                onValueChange={(value) =>
                  updateFilter("branch_id", value === "all" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => {
                    const branchId = String(branch.id || branch.branch_id);
                    return (
                      <SelectItem key={branchId} value={branchId}>
                        {branch.branch_code ? `${branch.branch_code} - ` : ""}
                        {branch.branch_name ||
                          branch.name ||
                          `Branch ${branchId}`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Customer</Label>
              <Select
                value={filters.customer_id || "all"}
                onValueChange={(value) =>
                  updateFilter("customer_id", value === "all" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.map((customer) => {
                    const customerId = String(
                      customer.id || customer.customer_id
                    );
                    return (
                      <SelectItem key={customerId} value={customerId}>
                        {customer.customer_code
                          ? `${customer.customer_code} - `
                          : ""}
                        {customer.company_name ||
                          customer.customer_name ||
                          customer.name ||
                          `Customer ${customerId}`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Sales Order</Label>
              <Input
                value={filters.sales_order_id}
                onChange={(event) =>
                  updateFilter("sales_order_id", event.target.value)
                }
                placeholder="Sales Order ID"
              />
            </div>
            <div className="space-y-1">
              <Label>Warehouse</Label>
              <Select
                value={filters.warehouse_id || "all"}
                onValueChange={(value) =>
                  updateFilter("warehouse_id", value === "all" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All warehouses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Warehouses</SelectItem>
                  {warehouses.map((warehouse) => {
                    const warehouseId = String(
                      warehouse.id || warehouse.warehouse_id
                    );
                    return (
                      <SelectItem key={warehouseId} value={warehouseId}>
                        {warehouse.warehouse_code
                          ? `${warehouse.warehouse_code} - `
                          : ""}
                        {warehouse.warehouse_name ||
                          warehouse.name ||
                          `Warehouse ${warehouseId}`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Approval Status</Label>
              <Select
                value={filters.approval_status}
                onValueChange={(value) =>
                  updateFilter(
                    "approval_status",
                    value as FilterState["approval_status"]
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Posted Status</Label>
              <Select
                value={filters.posted_status}
                onValueChange={(value) =>
                  updateFilter(
                    "posted_status",
                    value as FilterState["posted_status"]
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unposted">Unposted</SelectItem>
                  <SelectItem value="posted">Posted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Payment Status</Label>
              <Select
                value={filters.payment_status}
                onValueChange={(value) =>
                  updateFilter(
                    "payment_status",
                    value as FilterState["payment_status"]
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Invoice Date From</Label>
              <DatePicker
                value={filters.invoice_date_from}
                onChange={(value) => updateFilter("invoice_date_from", value)}
                placeholder="Invoice date from"
              />
            </div>
            <div className="space-y-1">
              <Label>Invoice Date To</Label>
              <DatePicker
                value={filters.invoice_date_to}
                onChange={(value) => updateFilter("invoice_date_to", value)}
                placeholder="Invoice date to"
              />
            </div>
            <div className="space-y-1">
              <Label>Due Date From</Label>
              <DatePicker
                value={filters.due_date_from}
                onChange={(value) => updateFilter("due_date_from", value)}
                placeholder="Due date from"
              />
            </div>
            <div className="space-y-1">
              <Label>Due Date To</Label>
              <DatePicker
                value={filters.due_date_to}
                onChange={(value) => updateFilter("due_date_to", value)}
                placeholder="Due date to"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Customer Code</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Sales Order</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={20}>
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                  </TableRow>
                ) : invoices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={20}
                      className="h-28 text-center text-muted-foreground"
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
                      <TableCell>{formatDate(invoice.due_date)}</TableCell>
                      <TableCell>
                        {invoice.branch?.branch_name || invoice.branch_id}
                      </TableCell>
                      <TableCell>{getCustomerCode(invoice)}</TableCell>
                      <TableCell>{getCustomerName(invoice)}</TableCell>
                      <TableCell>{getSalesOrderNumber(invoice)}</TableCell>
                      <TableCell>{getWarehouseName(invoice)}</TableCell>
                      <TableCell className="text-right">
                        {formatMoney(invoice.subtotal_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatMoney(invoice.discount_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatMoney(invoice.tax_amount)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatMoney(invoice.total_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatMoney(invoice.paid_amount)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-rose-700">
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
                      <TableCell>{invoice.created_by || "-"}</TableCell>
                      <TableCell>{formatDate(invoice.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col items-end gap-2">
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
                          <SalesInvoiceActionButtons
                            invoice={invoice}
                            onEdit={() =>
                              navigate(
                                `/invoice-center/sales-invoices/${invoice.id}/edit`
                              )
                            }
                            onDelete={() => openModal("delete", invoice)}
                            onSubmit={() => openModal("submit", invoice)}
                            onApprove={() => openModal("approve", invoice)}
                            onReject={() => openModal("reject", invoice)}
                            onPost={() => openModal("post", invoice)}
                            onCancel={() => openModal("cancel", invoice)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <div className="flex items-center justify-between border-t px-4 py-4">
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page === totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>

        {selectedInvoice && (
          <>
            <SubmitSalesInvoiceModal
              isOpen={modal === "submit"}
              onClose={closeModal}
              invoiceId={selectedInvoice.id}
              onSuccess={refreshAfterAction}
            />
            <ApproveSalesInvoiceModal
              isOpen={modal === "approve"}
              onClose={closeModal}
              invoiceId={selectedInvoice.id}
              onSuccess={refreshAfterAction}
              showCreditWarning={
                (selectedInvoice.customer?.credit_limit || 0) > 0 &&
                (selectedInvoice.customer?.current_balance || 0) +
                  selectedInvoice.total_amount >
                  (selectedInvoice.customer?.credit_limit || 0)
              }
            />
            <RejectSalesInvoiceModal
              isOpen={modal === "reject"}
              onClose={closeModal}
              invoiceId={selectedInvoice.id}
              onSuccess={refreshAfterAction}
            />
            <PostSalesInvoiceConfirmModal
              isOpen={modal === "post"}
              onClose={closeModal}
              invoiceId={selectedInvoice.id}
              invoiceNumber={selectedInvoice.invoice_number}
              totalAmount={selectedInvoice.total_amount}
              totalQuantity={
                selectedInvoice.lines?.reduce(
                  (sum, line) => sum + Number(line.quantity || 0),
                  0
                ) || 0
              }
              customerName={getCustomerName(selectedInvoice)}
              warehouseName={getWarehouseName(selectedInvoice)}
              onSuccess={refreshAfterAction}
            />
            <CancelSalesInvoiceModal
              isOpen={modal === "cancel"}
              onClose={closeModal}
              invoiceId={selectedInvoice.id}
              onSuccess={refreshAfterAction}
            />
            <DeleteSalesInvoiceConfirmModal
              isOpen={modal === "delete"}
              onClose={closeModal}
              invoiceId={selectedInvoice.id}
              invoiceNumber={selectedInvoice.invoice_number}
              customerName={getCustomerName(selectedInvoice)}
              onSuccess={refreshAfterAction}
            />
          </>
        )}
      </div>
    </PermissionGuard>
  );
};

export default SalesInvoicesPage;
