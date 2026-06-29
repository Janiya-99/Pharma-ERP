import React, { useEffect, useState } from "react";
import { Plus, RefreshCw, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import PermissionGuard from "../../../auth/PermissionGuard";
import { useAuth } from "../../../auth/AuthContext";
import {
  SalesOrderActionButtons,
  SalesOrderApprovalStatusBadge,
  SalesOrderStatusBadge,
} from "../../../components/invoice-center";
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
import type {
  ApiResponse,
  PaginatedResponse,
  SalesOrder,
  SalesOrderListParams,
} from "../../../types/invoice-center";

const emptyFilters: SalesOrderListParams = {
  search: "",
  branch_id: "",
  customer_id: "",
  approval_status: "",
  order_status: "",
  sales_order_date_from: "",
  sales_order_date_to: "",
  expected_delivery_date_from: "",
  expected_delivery_date_to: "",
};

const formatMoney = (value: number): string =>
  `LKR ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getOrdersFromResponse = (
  response: PaginatedResponse<SalesOrder> | ApiResponse<SalesOrder[]>
): SalesOrder[] => {
  if (Array.isArray(response.data)) return response.data;
  return [];
};

const SalesOrdersPage: React.FC = () => {
  const { activeSoftware } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [filters, setFilters] = useState<SalesOrderListParams>(emptyFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = Object.fromEntries(
        Object.entries({ ...filters, limit: 100 }).filter(
          ([, value]) => value !== "" && value !== undefined
        )
      );
      const response = await invoiceCenterApi.getSalesOrders(params);
      setOrders(
        getOrdersFromResponse(
          response.data as
            | PaginatedResponse<SalesOrder>
            | ApiResponse<SalesOrder[]>
        )
      );
    } catch (fetchError) {
      console.error("Fetch sales orders error:", fetchError);
      setError("Failed to fetch sales orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSoftware?.software_code === "INVOICE_CENTER") {
      fetchOrders();
    }
  }, [activeSoftware, filters]);

  if (activeSoftware?.software_code !== "INVOICE_CENTER") {
    return (
      <div className="border-rose-200 bg-rose-50 text-rose-600 m-6 rounded-xl border p-8 text-center font-medium">
        Please switch to Invoice Center module to access this page.
      </div>
    );
  }

  return (
    <PermissionGuard permission="invoice_center.sales_order.view">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Sales Orders</h1>
            <p className="text-sm text-muted-foreground">
              Manage Invoice Center sales order entry and approval.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={fetchOrders}
              disabled={loading}
              title="Refresh"
            >
              <RefreshCw
                className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"}
              />
            </Button>
            <PermissionGuard permission="invoice_center.sales_order.create">
              <Button
                type="button"
                onClick={() => navigate("/invoice-center/sales-orders/create")}
              >
                <Plus className="h-4 w-4" />
                New Sales Order
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
                    setFilters((current) => ({
                      ...current,
                      search: event.target.value,
                    }))
                  }
                  className="pl-8"
                  placeholder="Search order, customer, reference"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Branch ID</Label>
              <Input
                value={filters.branch_id ?? ""}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    branch_id: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Customer ID</Label>
              <Input
                value={filters.customer_id ?? ""}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    customer_id: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Approval Status</Label>
              <Select
                value={String(filters.approval_status || "all")}
                onValueChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    approval_status: value === "all" ? "" : value,
                  }))
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
              <Label>Order Status</Label>
              <Select
                value={String(filters.order_status || "all")}
                onValueChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    order_status: value === "all" ? "" : value,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="partially_invoiced">
                    Partially Invoiced
                  </SelectItem>
                  <SelectItem value="fully_invoiced">Fully Invoiced</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Order Date From</Label>
              <DatePicker
                value={filters.sales_order_date_from ?? ""}
                onChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    sales_order_date_from: value,
                  }))
                }
                placeholder="Order date from"
              />
            </div>
            <div className="space-y-1">
              <Label>Order Date To</Label>
              <DatePicker
                value={filters.sales_order_date_to ?? ""}
                onChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    sales_order_date_to: value,
                  }))
                }
                placeholder="Order date to"
              />
            </div>
            <div className="space-y-1">
              <Label>Delivery From</Label>
              <DatePicker
                value={filters.expected_delivery_date_from ?? ""}
                onChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    expected_delivery_date_from: value,
                  }))
                }
                placeholder="Delivery from"
              />
            </div>
            <div className="space-y-1">
              <Label>Delivery To</Label>
              <DatePicker
                value={filters.expected_delivery_date_to ?? ""}
                onChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    expected_delivery_date_to: value,
                  }))
                }
                placeholder="Delivery to"
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="border-rose-200 bg-rose-50 text-rose-700 rounded-xl border p-4 text-sm">
            {error}
          </div>
        )}

        <Card className="bg-white">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sales Order Number</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={14}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={14}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No sales orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.sales_order_number}
                      </TableCell>
                      <TableCell>{order.sales_order_date}</TableCell>
                      <TableCell>
                        {order.expected_delivery_date || "-"}
                      </TableCell>
                      <TableCell>
                        {order.branch?.branch_name || order.branch_id}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {order.customer_name || order.customer_id}
                        </div>
                        {order.customer_code && (
                          <div className="text-xs text-muted-foreground">
                            {order.customer_code}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {order.customer_reference_number || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatMoney(order.subtotal_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatMoney(order.discount_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatMoney(order.tax_amount)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatMoney(order.total_amount)}
                      </TableCell>
                      <TableCell>
                        <SalesOrderApprovalStatusBadge
                          status={order.approval_status}
                        />
                      </TableCell>
                      <TableCell>
                        <SalesOrderStatusBadge status={order.order_status} />
                      </TableCell>
                      <TableCell>{order.created_at}</TableCell>
                      <TableCell>
                        <SalesOrderActionButtons
                          order={order}
                          onView={() =>
                            navigate(`/invoice-center/sales-orders/${order.id}`)
                          }
                          onEdit={() =>
                            navigate(
                              `/invoice-center/sales-orders/${order.id}/edit`
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
};

export default SalesOrdersPage;
