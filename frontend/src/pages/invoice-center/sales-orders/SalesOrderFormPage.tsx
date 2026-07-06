import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  AlertCircle,
  Building2,
  CalendarDays,
  FileText,
  Loader2,
  Save,
  UserRound,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { useAuth } from "../../../auth/AuthContext";
import {
  SalesOrderCustomerCreditCard,
  SalesOrderTotalsCard,
  InvoiceCenterFieldGrid,
  InvoiceCenterFormBody,
  InvoiceCenterFormHeader,
  InvoiceCenterFormPage,
  InvoiceCenterFormSection,
} from "../../../components/invoice-center";
import { Button } from "../../../components/ui/button";
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
import type {
  ApiResponse,
  CreateSalesOrderPayload,
  Customer,
  SalesOrderDetail,
  SalesOrderLineForm,
} from "../../../types/invoice-center";
import SalesOrderLinesTable, {
  createBlankSalesOrderLine,
} from "./SalesOrderLinesTable";

type SalesOrderFormState = {
  branch_id: string;
  customer_id: string;
  sales_order_date: string;
  expected_delivery_date: string;
  customer_reference_number: string;
  remarks: string;
};

const today = (): string => new Date().toISOString().slice(0, 10);

const toNumber = (value: number | string | null | undefined): number =>
  Number(value || 0);

const unwrapList = <T,>(payload: any): T[] => {
  const data = payload?.data?.data ?? payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
};

const SalesOrderFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeSoftware, activeBranch, branches } = useAuth();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<SalesOrderFormState>({
    branch_id: activeBranch?.id ? String(activeBranch.id) : "",
    customer_id: "",
    sales_order_date: today(),
    expected_delivery_date: "",
    customer_reference_number: "",
    remarks: "",
  });
  const [lines, setLines] = useState<SalesOrderLineForm[]>([
    createBlankSalesOrderLine(),
  ]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [lineErrors, setLineErrors] = useState<Record<string, string>>({});

  const updateForm = (patch: Partial<SalesOrderFormState>) => {
    setForm((current) => ({ ...current, ...patch }));
    setFieldErrors((current) => {
      const next = { ...current };
      Object.keys(patch).forEach((key) => delete next[key]);
      return next;
    });
  };

  const updateLines = (nextLines: SalesOrderLineForm[]) => {
    setLines(nextLines);
    setLineErrors({});
  };

  useEffect(() => {
    setForm((current) => ({
      ...current,
      branch_id:
        current.branch_id || (activeBranch?.id ? String(activeBranch.id) : ""),
    }));
  }, [activeBranch]);

  useEffect(() => {
    if (activeSoftware?.software_code !== "INVOICE_CENTER") return;

    let cancelled = false;

    const loadCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const response = await invoiceCenterApi.getCustomers({
          status: "active",
          limit: 100,
        });
        if (!cancelled) {
          setCustomers(unwrapList<Customer>(response));
        }
      } catch (customerLoadError) {
        console.error("Load customers error:", customerLoadError);
        if (!cancelled) setCustomers([]);
      } finally {
        if (!cancelled) setLoadingCustomers(false);
      }
    };

    loadCustomers();

    return () => {
      cancelled = true;
    };
  }, [activeSoftware]);

  useEffect(() => {
    if (!isEdit || !id || activeSoftware?.software_code !== "INVOICE_CENTER")
      return;

    const loadOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await invoiceCenterApi.getSalesOrderById(id);
        const order = (response.data as ApiResponse<SalesOrderDetail>).data;
        setForm({
          branch_id: String(order.branch_id || ""),
          customer_id: String(order.customer_id || ""),
          sales_order_date: order.sales_order_date || today(),
          expected_delivery_date: order.expected_delivery_date || "",
          customer_reference_number: order.customer_reference_number || "",
          remarks: order.remarks || "",
        });
        setCustomer(order.customer || null);
        setLines(
          order.lines?.length
            ? order.lines.map((line) => ({
                id: line.id,
                product_id: line.product_id,
                product_batch_id: line.product_batch_id || null,
                quantity: line.quantity,
                unit_price: line.unit_price,
                discount_amount: line.discount_amount,
                tax_amount: line.tax_amount,
                line_remarks: line.line_remarks || "",
              }))
            : [createBlankSalesOrderLine()]
        );
      } catch (loadError) {
        console.error("Load sales order error:", loadError);
        setError("Failed to load sales order.");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [activeSoftware, id, isEdit]);

  useEffect(() => {
    if (
      !form.customer_id ||
      activeSoftware?.software_code !== "INVOICE_CENTER"
    ) {
      setCustomer(null);
      return;
    }

    const selectedCustomer =
      customers.find((item) => String(item.id) === String(form.customer_id)) ||
      null;
    if (selectedCustomer) {
      setCustomer(selectedCustomer);
      return;
    }

    const loadCustomer = async () => {
      try {
        const response = await invoiceCenterApi.getCustomerById(
          form.customer_id
        );
        setCustomer((response.data as ApiResponse<Customer>).data);
      } catch (customerError) {
        console.error("Load customer error:", customerError);
        setCustomer(null);
      }
    };

    loadCustomer();
  }, [activeSoftware, customers, form.customer_id]);

  if (activeSoftware?.software_code !== "INVOICE_CENTER") {
    return (
      <div className="m-6 rounded-xl border border-rose-200 bg-rose-50 p-8 text-center font-medium text-rose-600">
        Please switch to Invoice Center module to access this page.
      </div>
    );
  }

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const nextFieldErrors: Record<string, string> = {};
    const nextLineErrors: Record<string, string> = {};

    const payloadLines = lines
      .filter((line) => line.product_id && toNumber(line.quantity) > 0)
      .map((line) => ({
        product_id: Number(line.product_id),
        product_batch_id: line.product_batch_id
          ? Number(line.product_batch_id)
          : null,
        quantity: toNumber(line.quantity),
        unit_price: toNumber(line.unit_price),
        discount_amount: toNumber(line.discount_amount),
        tax_amount: toNumber(line.tax_amount),
        line_remarks: line.line_remarks,
      }));

    if (!form.branch_id) nextFieldErrors.branch_id = "Branch is required.";
    if (!form.customer_id)
      nextFieldErrors.customer_id = "Customer is required.";
    if (!form.sales_order_date) {
      nextFieldErrors.sales_order_date = "Sales order date is required.";
    }

    lines.forEach((line) => {
      if (!line.product_id) {
        nextLineErrors[`${line.id}.product_id`] = "Product is required.";
      }
      if (toNumber(line.quantity) <= 0) {
        nextLineErrors[`${line.id}.quantity`] =
          "Quantity must be greater than 0.";
      }
      if (toNumber(line.unit_price) < 0) {
        nextLineErrors[`${line.id}.unit_price`] =
          "Unit price cannot be negative.";
      }
    });

    if (payloadLines.length === 0) {
      nextLineErrors.form = "Add at least one valid product line.";
    }

    if (
      Object.keys(nextFieldErrors).length ||
      Object.keys(nextLineErrors).length
    ) {
      setFieldErrors(nextFieldErrors);
      setLineErrors(nextLineErrors);
      setError("Please fix the highlighted fields.");
      return;
    }

    const payload: CreateSalesOrderPayload = {
      branch_id: Number(form.branch_id),
      customer_id: Number(form.customer_id),
      sales_order_date: form.sales_order_date,
      expected_delivery_date: form.expected_delivery_date || undefined,
      customer_reference_number: form.customer_reference_number || undefined,
      remarks: form.remarks || undefined,
      lines: payloadLines,
    };

    setLoading(true);
    try {
      if (isEdit && id) {
        await invoiceCenterApi.updateSalesOrder(id, payload);
      } else {
        await invoiceCenterApi.createSalesOrder(payload);
      }
      navigate("/invoice-center/sales-orders");
    } catch (saveError) {
      console.error("Save sales order error:", saveError);
      setError("Failed to save sales order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitForm} className="contents" noValidate>
      <InvoiceCenterFormPage>
        <InvoiceCenterFormHeader
          title={isEdit ? "Edit Sales Order" : "Create Sales Order"}
          description="Select a customer, delivery date, and product lines from backend records."
          icon={<FileText className="h-5 w-5 text-[#002137]" />}
          backAction={
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          }
          actions={
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/invoice-center/sales-orders")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {loading ? "Saving..." : "Save Order"}
              </Button>
            </>
          }
        />

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <InvoiceCenterFormBody
          aside={
            <>
              <SalesOrderCustomerCreditCard customer={customer} />
              <SalesOrderTotalsCard lines={lines} />
            </>
          }
        >
          <InvoiceCenterFormSection
            title="Order Details"
            description="Core customer, branch, date, and delivery information."
            icon={<FileText className="h-4 w-4 text-[#64748B]" />}
          >
            <InvoiceCenterFieldGrid>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-[#1F2937]">
                  <Building2 className="h-4 w-4 text-[#64748B]" />
                  Branch
                </Label>
                <Select
                  value={form.branch_id}
                  onValueChange={(value) =>
                    updateForm({
                      branch_id: value,
                    })
                  }
                >
                  <SelectTrigger
                    className={fieldErrors.branch_id ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {(branches || []).map((branch: any) => (
                      <SelectItem key={branch.id} value={String(branch.id)}>
                        {branch.branch_name ||
                          branch.name ||
                          branch.branch_code}
                      </SelectItem>
                    ))}
                    {form.branch_id &&
                      !(branches || []).some(
                        (branch: any) => String(branch.id) === form.branch_id
                      ) && (
                        <SelectItem value={form.branch_id}>
                          Branch #{form.branch_id}
                        </SelectItem>
                      )}
                  </SelectContent>
                </Select>
                <ValidationMessage message={fieldErrors.branch_id} />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-[#1F2937]">
                  <UserRound className="h-4 w-4 text-[#64748B]" />
                  Customer
                </Label>
                <Select
                  value={form.customer_id}
                  disabled={loadingCustomers}
                  onValueChange={(value) =>
                    updateForm({
                      customer_id: value,
                    })
                  }
                >
                  <SelectTrigger
                    className={fieldErrors.customer_id ? "border-red-500" : ""}
                  >
                    <SelectValue
                      placeholder={
                        loadingCustomers
                          ? "Loading customers..."
                          : "Select customer"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.customer_code} - {item.customer_name}
                      </SelectItem>
                    ))}
                    {customer &&
                      !customers.some(
                        (item) => String(item.id) === String(customer.id)
                      ) && (
                        <SelectItem value={String(customer.id)}>
                          {customer.customer_code} - {customer.customer_name}
                        </SelectItem>
                      )}
                    {!customers.length && !loadingCustomers && (
                      <SelectItem value="no-customers" disabled>
                        No customers found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <ValidationMessage message={fieldErrors.customer_id} />
              </div>

              <div className="space-y-2">
                <Label>Customer Reference</Label>
                <Input
                  placeholder="Optional PO / reference"
                  value={form.customer_reference_number}
                  onChange={(event) =>
                    updateForm({
                      customer_reference_number: event.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-[#1F2937]">
                  <CalendarDays className="h-4 w-4 text-[#64748B]" />
                  Sales Order Date
                </Label>
                <DatePicker
                  value={form.sales_order_date}
                  onChange={(value) =>
                    updateForm({
                      sales_order_date: value,
                    })
                  }
                  placeholder="Sales order date"
                  clearable={false}
                  triggerClassName={
                    fieldErrors.sales_order_date ? "border-red-500" : ""
                  }
                />
                <ValidationMessage message={fieldErrors.sales_order_date} />
              </div>

              <div className="space-y-2">
                <Label>Expected Delivery Date</Label>
                <DatePicker
                  value={form.expected_delivery_date}
                  onChange={(value) =>
                    updateForm({
                      expected_delivery_date: value,
                    })
                  }
                  placeholder="Expected delivery date"
                />
              </div>

              <div className="space-y-2 md:col-span-2 xl:col-span-3">
                <Label>Remarks</Label>
                <Textarea
                  className="min-h-20 resize-y"
                  placeholder="Internal delivery or sales notes"
                  value={form.remarks}
                  onChange={(event) =>
                    updateForm({
                      remarks: event.target.value,
                    })
                  }
                />
              </div>
            </InvoiceCenterFieldGrid>
          </InvoiceCenterFormSection>

          <InvoiceCenterFormSection title="Line Items">
            <SalesOrderLinesTable
              lines={lines}
              onChange={updateLines}
              disabled={loading}
              errors={lineErrors}
            />
            <ValidationMessage message={lineErrors.form} />
          </InvoiceCenterFormSection>
        </InvoiceCenterFormBody>
      </InvoiceCenterFormPage>
    </form>
  );
};

const ValidationMessage = ({ message }: { message?: string }) =>
  message ? (
    <p className="mt-1 text-xs font-medium text-red-500">{message}</p>
  ) : null;

export default SalesOrderFormPage;
