import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  FileText,
  Loader2,
  Package,
  Receipt,
  Save,
  UserRound,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Textarea } from "../../../components/ui/textarea";
import { toast } from "sonner";
import { Customer } from "../../../types/invoice-center";
import {
  SalesInvoiceLinesTable,
  createBlankSalesInvoiceLine,
} from "./SalesInvoiceLinesTable";
import {
  SalesInvoiceCustomerCreditCard,
  SalesInvoiceTotalsCard,
  SalesInvoiceSalesOrderLinkCard,
} from "../../../components/invoice-center";

const formSchema = z
  .object({
    branch_id: z.string().min(1, "Branch is required"),
    customer_id: z.string().min(1, "Customer is required"),
    sales_order_id: z.string().optional(),
    warehouse_id: z.string().min(1, "Warehouse is required"),
    financial_year_id: z.string().optional(),
    accounting_period_id: z.string().optional(),
    invoice_date: z.string().min(1, "Invoice date is required"),
    due_date: z.string().optional(),
    customer_reference_number: z.string().optional(),
    remarks: z.string().optional(),
    lines: z
      .array(
        z.object({
          sales_order_line_id: z.string().optional(),
          product_id: z.string().min(1, "Product is required"),
          product_batch_id: z.string().optional(),
          quantity: z.number().min(0.001, "Quantity must be > 0"),
          unit_price: z.number().min(0, "Unit price cannot be negative"),
          discount_amount: z.number().min(0, "Discount cannot be negative"),
          tax_amount: z.number().min(0, "Tax cannot be negative"),
          line_remarks: z.string().optional(),
        })
      )
      .min(1, "At least one line item is required"),
  })
  .superRefine((data, ctx) => {
    if (
      data.due_date &&
      data.invoice_date &&
      data.due_date < data.invoice_date
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Due date cannot be before invoice date",
        path: ["due_date"],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

const SalesInvoiceFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { activeSoftware, activeBranch } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Lookup states
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [salesOrderInfo, setSalesOrderInfo] = useState<any | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      branch_id: activeBranch?.id ? String(activeBranch.id) : "",
      customer_id: "",
      warehouse_id: "",
      invoice_date: new Date().toISOString().slice(0, 10),
      due_date: "",
      sales_order_id: "",
      customer_reference_number: "",
      remarks: "",
      lines: [createBlankSalesInvoiceLine()],
    },
    mode: "onChange",
  });

  const lines = useWatch({ control, name: "lines" }) || [];
  const watchedCustomerId = watch("customer_id");
  const watchedBranchId = watch("branch_id");
  const watchedSalesOrderId = watch("sales_order_id");

  const listFromResponse = (response: any) => {
    const payload = response?.data ?? response;
    return payload?.data?.items || payload?.data || payload?.items || [];
  };

  const filteredWarehouses = warehouses.filter(
    (warehouse) =>
      !watchedBranchId ||
      String(warehouse.branch_id || "") === String(watchedBranchId)
  );

  // Calculated totals
  const totals = useMemo(() => {
    return lines.reduce(
      (acc, line) => {
        const qty = Number(line.quantity || 0);
        const price = Number(line.unit_price || 0);
        const discount = Number(line.discount_amount || 0);
        const tax = Number(line.tax_amount || 0);

        const lineTotal = qty * price - discount + tax;

        return {
          subtotal: acc.subtotal + qty * price,
          discount: acc.discount + discount,
          tax: acc.tax + tax,
          total: acc.total + lineTotal,
        };
      },
      { subtotal: 0, discount: 0, tax: 0, total: 0 }
    );
  }, [lines]);

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      loadInvoice();
    }
  }, [id, isEdit]);

  const loadLookups = async () => {
    setLookupsLoading(true);
    try {
      const [branchRes, warehouseRes, customerRes] = await Promise.all([
        getBranches({ limit: 500, status: "active" }),
        inventoryApi.getWarehouses({ limit: 1000, status: "active" }),
        invoiceCenterApi.getCustomers({ limit: 1000, status: "active" }),
      ]);

      setBranches(listFromResponse(branchRes));
      setWarehouses(listFromResponse(warehouseRes));
      setCustomers(listFromResponse(customerRes));
    } catch (err) {
      console.error("Failed to load invoice form dropdowns", err);
      toast.error("Failed to load form dropdowns.");
    } finally {
      setLookupsLoading(false);
    }
  };

  useEffect(() => {
    if (watchedCustomerId) {
      loadCustomer(watchedCustomerId);
    } else {
      setCustomer(null);
    }
  }, [watchedCustomerId]);

  const loadInvoice = async () => {
    setLoading(true);
    try {
      const res = await invoiceCenterApi.getSalesInvoiceById(id!);
      const data = res.data.data;

      // Check if it's draft or rejected, otherwise block edit
      if (
        data.approval_status !== "draft" &&
        data.approval_status !== "rejected"
      ) {
        toast.error("Only draft or rejected invoices can be edited.");
        navigate(`/invoice-center/sales-invoices/${id}`);
        return;
      }

      setValue("branch_id", String(data.branch_id || ""));
      setValue("customer_id", String(data.customer_id || ""));
      setValue("warehouse_id", String(data.warehouse_id || ""));
      setValue(
        "invoice_date",
        data.invoice_date ? data.invoice_date.slice(0, 10) : ""
      );
      setValue("due_date", data.due_date ? data.due_date.slice(0, 10) : "");
      setValue(
        "sales_order_id",
        data.sales_order_id ? String(data.sales_order_id) : ""
      );
      setValue(
        "customer_reference_number",
        data.customer_reference_number || ""
      );
      setValue("remarks", data.remarks || "");

      if (data.lines && data.lines.length > 0) {
        setValue(
          "lines",
          data.lines.map((l: any) => ({
            sales_order_line_id: l.sales_order_line_id
              ? String(l.sales_order_line_id)
              : "",
            product_id: String(l.product_id || ""),
            product_batch_id: l.product_batch_id
              ? String(l.product_batch_id)
              : "",
            quantity: l.quantity,
            unit_price: l.unit_price,
            discount_amount: l.discount_amount,
            tax_amount: l.tax_amount,
            line_remarks: l.line_remarks || "",
          }))
        );
      }

      if (data.sales_order) {
        setSalesOrderInfo(data.sales_order);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load invoice.");
      navigate("/invoice-center/sales-invoices");
    } finally {
      setLoading(false);
    }
  };

  const loadCustomer = async (customerId: string) => {
    try {
      const res = await invoiceCenterApi.getCustomerById(customerId);
      setCustomer(res.data.data);
    } catch (err) {
      console.error("Failed to load customer details", err);
    }
  };

  const loadSalesOrder = async () => {
    if (!watchedSalesOrderId) return;
    try {
      const res = await invoiceCenterApi.getSalesOrderById(watchedSalesOrderId);
      const so = res.data.data;

      if (so.approval_status !== "approved") {
        toast.error("Selected Sales Order is not approved.");
        return;
      }

      if (["cancelled", "closed", "fully_invoiced"].includes(so.order_status)) {
        toast.error(
          `Cannot invoice a ${so.order_status.replace("_", " ")} sales order.`
        );
        return;
      }

      setSalesOrderInfo(so);

      if (so.customer_id) {
        setValue("customer_id", String(so.customer_id));
      }

      if (so.lines && so.lines.length > 0) {
        const linesToLoad = so.lines
          .filter((l: any) => l.pending_quantity > 0)
          .map((l: any) => ({
            sales_order_line_id: String(l.id),
            product_id: String(l.product_id),
            product_batch_id: l.product_batch_id
              ? String(l.product_batch_id)
              : "",
            quantity: l.pending_quantity,
            unit_price: l.unit_price,
            discount_amount: l.discount_amount,
            tax_amount: l.tax_amount,
            line_remarks: l.line_remarks || "",
          }));

        if (linesToLoad.length > 0) {
          setValue("lines", linesToLoad);
          toast.success(`Loaded ${linesToLoad.length} lines from Sales Order.`);
        } else {
          toast.warning("Sales order has no pending lines to invoice.");
        }
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to load Sales Order."
      );
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (
      customer &&
      ["inactive", "blocked", "on_hold"].includes(customer.status)
    ) {
      toast.error(
        `Cannot create invoice for a customer with status: ${customer.status}`
      );
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        branch_id: Number(data.branch_id),
        customer_id: Number(data.customer_id),
        warehouse_id: Number(data.warehouse_id),
        invoice_date: data.invoice_date,
        lines: data.lines.map((l) => ({
          product_id: Number(l.product_id),
          quantity: Number(l.quantity),
          unit_price: Number(l.unit_price),
          discount_amount: Number(l.discount_amount),
          tax_amount: Number(l.tax_amount),
          ...(l.sales_order_line_id && {
            sales_order_line_id: Number(l.sales_order_line_id),
          }),
          ...(l.product_batch_id && {
            product_batch_id: Number(l.product_batch_id),
          }),
          ...(l.line_remarks && { line_remarks: l.line_remarks }),
        })),
      };

      if (data.sales_order_id)
        payload.sales_order_id = Number(data.sales_order_id);
      if (data.due_date) payload.due_date = data.due_date;
      if (data.customer_reference_number)
        payload.customer_reference_number = data.customer_reference_number;
      if (data.remarks) payload.remarks = data.remarks;
      if (data.financial_year_id)
        payload.financial_year_id = Number(data.financial_year_id);
      if (data.accounting_period_id)
        payload.accounting_period_id = Number(data.accounting_period_id);

      if (isEdit) {
        await invoiceCenterApi.updateSalesInvoice(id!, payload);
        toast.success("Sales invoice updated successfully.");
      } else {
        await invoiceCenterApi.createSalesInvoice(payload);
        toast.success("Sales invoice created successfully.");
      }
      navigate("/invoice-center/sales-invoices");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to save sales invoice."
      );
    } finally {
      setSaving(false);
    }
  };

  if (activeSoftware?.software_code !== "INVOICE_CENTER") {
    return (
      <div className="m-6 rounded-xl border border-rose-200 bg-rose-50 p-8 text-center font-medium text-rose-600">
        Please switch to Invoice Center module to access this page.
      </div>
    );
  }

  return (
    <div className="page-content mx-auto w-full max-w-7xl space-y-5 pb-12">
      <div className="sticky top-14 z-30 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/invoice-center/sales-invoices")}
            disabled={saving}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-[#002137]" />
              <h1 className="truncate text-2xl font-semibold tracking-tight text-[#111827]">
                {isEdit ? "Edit Sales Invoice" : "Create Sales Invoice"}
              </h1>
            </div>
            <p className="mt-1 text-sm text-[#64748B]">
              Create a clean draft invoice from customer, warehouse, and product
              records.
            </p>
          </div>
        </div>
        <PermissionGuard
          permission={
            isEdit
              ? "invoice_center.sales_invoice.update"
              : "invoice_center.sales_invoice.create"
          }
        >
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={saving || loading}
            className="bg-[#002137] text-white hover:bg-[#003452]"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save Draft"}
          </Button>
        </PermissionGuard>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="space-y-5">
            <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#111827]">
                  <FileText className="h-4 w-4 text-[#64748B]" />
                  Invoice Header
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="branch_id"
                      className={
                        errors.branch_id
                          ? "text-red-500"
                          : "flex items-center gap-2"
                      }
                    >
                      <Building2 className="h-4 w-4 text-[#64748B]" />
                      Branch *
                    </Label>
                    <Select
                      value={watch("branch_id")}
                      onValueChange={(value) => {
                        setValue("branch_id", value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                        setValue("warehouse_id", "", {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      disabled={lookupsLoading}
                    >
                      <SelectTrigger
                        id="branch_id"
                        className={errors.branch_id ? "border-red-500" : ""}
                      >
                        <SelectValue
                          placeholder={
                            lookupsLoading
                              ? "Loading branches..."
                              : "Select branch"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => {
                          const branchId = String(
                            branch.id || branch.branch_id
                          );
                          return (
                            <SelectItem key={branchId} value={branchId}>
                              {branch.branch_code
                                ? `${branch.branch_code} - `
                                : ""}
                              {branch.branch_name ||
                                branch.name ||
                                `Branch ${branchId}`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {errors.branch_id && (
                      <span className="text-xs text-red-500">
                        {errors.branch_id.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="warehouse_id"
                      className={
                        errors.warehouse_id
                          ? "text-red-500"
                          : "flex items-center gap-2"
                      }
                    >
                      <Package className="h-4 w-4 text-[#64748B]" />
                      Warehouse *
                    </Label>
                    <Select
                      value={watch("warehouse_id")}
                      onValueChange={(value) =>
                        setValue("warehouse_id", value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      disabled={lookupsLoading || !watchedBranchId}
                    >
                      <SelectTrigger
                        id="warehouse_id"
                        className={errors.warehouse_id ? "border-red-500" : ""}
                      >
                        <SelectValue
                          placeholder={
                            !watchedBranchId
                              ? "Select branch first"
                              : lookupsLoading
                              ? "Loading warehouses..."
                              : "Select warehouse"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredWarehouses.map((warehouse) => {
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
                    {errors.warehouse_id && (
                      <span className="text-xs text-red-500">
                        {errors.warehouse_id.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="invoice_date"
                      className={
                        errors.invoice_date
                          ? "text-red-500"
                          : "flex items-center gap-2"
                      }
                    >
                      <CalendarDays className="h-4 w-4 text-[#64748B]" />
                      Invoice Date *
                    </Label>
                    <DatePicker
                      value={watch("invoice_date")}
                      onChange={(value) =>
                        setValue("invoice_date", value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      placeholder="Invoice date"
                      clearable={false}
                      triggerClassName={
                        errors.invoice_date ? "border-red-500" : ""
                      }
                      aria-label="Invoice date"
                    />
                    {errors.invoice_date && (
                      <span className="text-xs text-red-500">
                        {errors.invoice_date.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="due_date"
                      className={errors.due_date ? "text-red-500" : ""}
                    >
                      Due Date
                    </Label>
                    <DatePicker
                      value={watch("due_date")}
                      onChange={(value) =>
                        setValue("due_date", value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      placeholder="Due date"
                      triggerClassName={errors.due_date ? "border-red-500" : ""}
                      aria-label="Due date"
                    />
                    {errors.due_date && (
                      <span className="text-xs text-red-500">
                        {errors.due_date.message}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#111827]">
                  <UserRound className="h-4 w-4 text-[#64748B]" />
                  Customer & References
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="customer_id"
                      className={errors.customer_id ? "text-red-500" : ""}
                    >
                      Customer *
                    </Label>
                    <Select
                      value={watch("customer_id")}
                      onValueChange={(value) =>
                        setValue("customer_id", value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      disabled={lookupsLoading}
                    >
                      <SelectTrigger
                        id="customer_id"
                        className={errors.customer_id ? "border-red-500" : ""}
                      >
                        <SelectValue
                          placeholder={
                            lookupsLoading
                              ? "Loading customers..."
                              : "Select customer"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customerItem) => {
                          const customerId = String(
                            customerItem.id || customerItem.customer_id
                          );
                          return (
                            <SelectItem key={customerId} value={customerId}>
                              {customerItem.customer_code
                                ? `${customerItem.customer_code} - `
                                : ""}
                              {customerItem.company_name ||
                                customerItem.customer_name ||
                                customerItem.name ||
                                `Customer ${customerId}`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {errors.customer_id && (
                      <span className="text-xs text-red-500">
                        {errors.customer_id.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_reference_number">
                      Customer Reference
                    </Label>
                    <Input
                      id="customer_reference_number"
                      {...register("customer_reference_number")}
                      placeholder="e.g. PO-12345"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    {...register("remarks")}
                    placeholder="Internal notes or terms..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
              <CardHeader className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-lg font-semibold text-[#111827]">
                  Sales Order Link
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={loadSalesOrder}
                    disabled={!watchedSalesOrderId}
                  >
                    <Check className="mr-2 h-4 w-4" /> Verify Order
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="space-y-2">
                  <Label htmlFor="sales_order_id">Sales Order ID</Label>
                  <Input
                    id="sales_order_id"
                    {...register("sales_order_id")}
                    placeholder="Link to existing Sales Order..."
                  />
                  <p className="text-xs text-gray-500">
                    If this invoice fulfills an existing sales order, enter the
                    ID and click Verify to load lines automatically.
                  </p>
                </div>
              </CardContent>
            </Card>

            <SalesInvoiceLinesTable
              control={control}
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
            />
          </div>

          <aside className="space-y-5 xl:sticky xl:top-36 xl:self-start">
            <SalesInvoiceTotalsCard
              subtotal={totals.subtotal}
              discount={totals.discount}
              tax={totals.tax}
              total={totals.total}
              lineCount={lines.length}
            />

            <SalesInvoiceCustomerCreditCard
              customer={customer}
              invoiceTotal={totals.total}
            />

            <SalesInvoiceSalesOrderLinkCard salesOrder={salesOrderInfo} />

            <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-semibold text-[#111827]">
                  Accounting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                <div className="space-y-2">
                  <Label htmlFor="financial_year_id">Financial Year</Label>
                  <Input
                    id="financial_year_id"
                    {...register("financial_year_id")}
                    placeholder="Optional ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accounting_period_id">
                    Accounting Period
                  </Label>
                  <Input
                    id="accounting_period_id"
                    {...register("accounting_period_id")}
                    placeholder="Optional ID"
                  />
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </form>
    </div>
  );
};

export default SalesInvoiceFormPage;
