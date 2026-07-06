import React, { useEffect, useState, useMemo } from "react";
import { ArrowLeft, Save, Check } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { getBranches } from "../../../api/controlApi";
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
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { toast } from "sonner";
import { Customer } from "../../../types/invoice-center";
import {
  CreditNoteLinesTable,
  createBlankCreditNoteLine,
} from "./CreditNoteLinesTable";
import {
  CreditNoteTotalsCard,
  CreditNoteCustomerBalanceCard,
  CreditNoteInvoiceLinkCard,
} from "../../../components/invoice-center";

const formSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  customer_id: z.string().min(1, "Customer is required"),
  sales_invoice_id: z.string().optional(),
  financial_year_id: z.string().optional(),
  accounting_period_id: z.string().optional(),
  credit_note_date: z.string().min(1, "Credit Note date is required"),
  credit_note_type: z.enum([
    "sales_return",
    "price_adjustment",
    "discount_adjustment",
    "billing_error",
    "goodwill",
    "other",
  ]),
  reference_number: z.string().optional(),
  reason: z.string().optional(),
  remarks: z.string().optional(),
  lines: z
    .array(
      z.object({
        sales_invoice_line_id: z.string().optional(),
        product_id: z.string().optional(),
        quantity: z.number().min(0.001, "Quantity must be > 0"),
        unit_price: z.number().min(0, "Unit price cannot be negative"),
        discount_amount: z.number().min(0, "Discount cannot be negative"),
        tax_amount: z.number().min(0, "Tax cannot be negative"),
        description: z.string().optional(),
      })
    )
    .min(1, "At least one line item is required"),
});

type FormValues = z.infer<typeof formSchema>;

const CreditNoteFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { activeSoftware, activeBranch } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Lookup states
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [salesInvoiceInfo, setSalesInvoiceInfo] = useState<any | null>(null);

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
      sales_invoice_id: "",
      credit_note_date: new Date().toISOString().slice(0, 10),
      credit_note_type: "sales_return",
      reference_number: "",
      reason: "",
      remarks: "",
      lines: [createBlankCreditNoteLine()],
    },
    mode: "onChange",
  });

  const lines = useWatch({ control, name: "lines" }) || [];
  const watchedCustomerId = watch("customer_id");
  const watchedSalesInvoiceId = watch("sales_invoice_id");

  const listFromResponse = (response: any) => {
    const payload = response?.data ?? response;
    return payload?.data?.items || payload?.data || payload?.items || [];
  };

  // Calculated totals
  const totals = useMemo(() => {
    return lines.reduce(
      (acc: any, line: any) => {
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

  const loadLookups = async () => {
    setLookupsLoading(true);
    try {
      const [branchRes, customerRes] = await Promise.all([
        getBranches({ limit: 500, status: "active" }),
        invoiceCenterApi.getCustomers({ limit: 1000, status: "active" }),
      ]);

      setBranches(listFromResponse(branchRes));
      setCustomers(listFromResponse(customerRes));
    } catch (err) {
      console.error("Failed to load credit note dropdowns", err);
      toast.error("Failed to load form dropdowns.");
    } finally {
      setLookupsLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit && id) {
      loadCreditNote();
    }
  }, [id, isEdit]);

  useEffect(() => {
    if (watchedCustomerId) {
      loadCustomer(watchedCustomerId);
    } else {
      setCustomer(null);
    }
  }, [watchedCustomerId]);

  const loadCreditNote = async () => {
    setLoading(true);
    try {
      const res = await invoiceCenterApi.getCreditNoteById(id!);
      const data = res.data.data;

      if (
        data.approval_status !== "draft" &&
        data.approval_status !== "rejected"
      ) {
        toast.error("Only draft or rejected credit notes can be edited.");
        navigate(`/invoice-center/credit-notes/${id}`);
        return;
      }

      setValue("branch_id", String(data.branch_id || ""));
      setValue("customer_id", String(data.customer_id || ""));
      setValue(
        "credit_note_date",
        data.credit_note_date ? data.credit_note_date.slice(0, 10) : ""
      );
      setValue("credit_note_type", data.credit_note_type);
      setValue(
        "sales_invoice_id",
        data.sales_invoice_id ? String(data.sales_invoice_id) : ""
      );
      setValue("reference_number", data.reference_number || "");
      setValue("reason", data.reason || "");
      setValue("remarks", data.remarks || "");

      if (data.lines && data.lines.length > 0) {
        setValue(
          "lines",
          data.lines.map((l: any) => ({
            sales_invoice_line_id: l.sales_invoice_line_id
              ? String(l.sales_invoice_line_id)
              : "",
            product_id: l.product_id ? String(l.product_id) : "",
            quantity: l.quantity,
            unit_price: l.unit_price,
            discount_amount: l.discount_amount,
            tax_amount: l.tax_amount,
            description: l.description || "",
          }))
        );
      }

      if (data.sales_invoice) {
        setSalesInvoiceInfo(data.sales_invoice);
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to load credit note."
      );
      navigate("/invoice-center/credit-notes");
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

  const loadSalesInvoice = async () => {
    if (!watchedSalesInvoiceId) return;
    try {
      const res = await invoiceCenterApi.getSalesInvoiceById(
        watchedSalesInvoiceId
      );
      const si = res.data.data;

      if (si.posted_status !== "posted") {
        toast.error("Selected Sales Invoice is not posted.");
        return;
      }

      setSalesInvoiceInfo(si);

      if (si.customer_id) {
        setValue("customer_id", String(si.customer_id));
      }

      if (si.lines && si.lines.length > 0) {
        const linesToLoad = si.lines.map((l: any) => ({
          sales_invoice_line_id: String(l.id),
          product_id: String(l.product_id),
          quantity: l.quantity,
          unit_price: l.unit_price,
          discount_amount: l.discount_amount,
          tax_amount: l.tax_amount,
          description: `Return for invoice line`,
        }));

        if (linesToLoad.length > 0) {
          setValue("lines", linesToLoad);
          toast.success(
            `Loaded ${linesToLoad.length} lines from Sales Invoice. Adjust quantities as needed.`
          );
        }
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to load Sales Invoice."
      );
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (
      customer &&
      ["inactive", "blocked", "on_hold"].includes(customer.status)
    ) {
      toast.error(
        `Cannot create credit note for a customer with status: ${customer.status}`
      );
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        branch_id: Number(data.branch_id),
        customer_id: Number(data.customer_id),
        credit_note_date: data.credit_note_date,
        credit_note_type: data.credit_note_type,
        lines: data.lines.map((l) => ({
          quantity: Number(l.quantity),
          unit_price: Number(l.unit_price),
          discount_amount: Number(l.discount_amount),
          tax_amount: Number(l.tax_amount),
          ...(l.product_id && { product_id: Number(l.product_id) }),
          ...(l.sales_invoice_line_id && {
            sales_invoice_line_id: Number(l.sales_invoice_line_id),
          }),
          ...(l.description && { description: l.description }),
        })),
      };

      if (data.sales_invoice_id)
        payload.sales_invoice_id = Number(data.sales_invoice_id);
      if (data.reference_number)
        payload.reference_number = data.reference_number;
      if (data.reason) payload.reason = data.reason;
      if (data.remarks) payload.remarks = data.remarks;
      if (data.financial_year_id)
        payload.financial_year_id = Number(data.financial_year_id);
      if (data.accounting_period_id)
        payload.accounting_period_id = Number(data.accounting_period_id);

      if (isEdit) {
        await invoiceCenterApi.updateCreditNote(id!, payload);
        toast.success("Credit note updated successfully.");
      } else {
        await invoiceCenterApi.createCreditNote(payload);
        toast.success("Credit note created successfully.");
      }
      navigate("/invoice-center/credit-notes");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to save credit note."
      );
    } finally {
      setSaving(false);
    }
  };

  if (activeSoftware?.software_code !== "INVOICE_CENTER") {
    return (
      <div className="p-8 text-center text-gray-500">
        Please switch to Invoice Center module to access this page.
      </div>
    );
  }

  return (
    <div className="page-content mx-auto w-full max-w-7xl space-y-5 pb-12">
      <div className="sticky top-14 z-30 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/invoice-center/credit-notes")}
            disabled={saving}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {isEdit ? "Edit Credit Note" : "Create Credit Note"}
          </h1>
        </div>
        <PermissionGuard
          permission={
            isEdit
              ? "invoice_center.credit_note.update"
              : "invoice_center.credit_note.create"
          }
        >
          <Button onClick={handleSubmit(onSubmit)} disabled={saving || loading}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Draft"}
          </Button>
        </PermissionGuard>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="space-y-5">
            <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle>Credit Note Header</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="branch_id"
                      className={errors.branch_id ? "text-red-500" : ""}
                    >
                      Branch *
                    </Label>
                    <Select
                      value={watch("branch_id")}
                      onValueChange={(value) =>
                        setValue("branch_id", value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
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
                      htmlFor="credit_note_date"
                      className={errors.credit_note_date ? "text-red-500" : ""}
                    >
                      Date *
                    </Label>
                    <DatePicker
                      value={watch("credit_note_date")}
                      onChange={(value) =>
                        setValue("credit_note_date", value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      placeholder="Credit note date"
                      clearable={false}
                      triggerClassName={
                        errors.credit_note_date ? "border-red-500" : ""
                      }
                      aria-label="Credit note date"
                    />
                    {errors.credit_note_date && (
                      <span className="text-xs text-red-500">
                        {errors.credit_note_date.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="credit_note_type"
                      className={errors.credit_note_type ? "text-red-500" : ""}
                    >
                      Type *
                    </Label>
                    <Select
                      onValueChange={(val) =>
                        setValue("credit_note_type", val as any)
                      }
                      defaultValue={watch("credit_note_type")}
                    >
                      <SelectTrigger
                        className={
                          errors.credit_note_type ? "border-red-500" : ""
                        }
                      >
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales_return">
                          Sales Return
                        </SelectItem>
                        <SelectItem value="price_adjustment">
                          Price Adjustment
                        </SelectItem>
                        <SelectItem value="discount_adjustment">
                          Discount Adjustment
                        </SelectItem>
                        <SelectItem value="billing_error">
                          Billing Error
                        </SelectItem>
                        <SelectItem value="goodwill">Goodwill</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.credit_note_type && (
                      <span className="text-xs text-red-500">
                        {errors.credit_note_type.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference_number">Reference Number</Label>
                    <Input
                      id="reference_number"
                      {...register("reference_number")}
                      placeholder="e.g. SR-001"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle>Customer</CardTitle>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    {...register("reason")}
                    placeholder="Reason for credit note..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    {...register("remarks")}
                    placeholder="Internal notes..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
              <CardHeader className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Sales Invoice Link</CardTitle>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={loadSalesInvoice}
                    disabled={!watchedSalesInvoiceId}
                  >
                    <Check className="mr-2 h-4 w-4" /> Verify Invoice
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="space-y-2">
                  <Label htmlFor="sales_invoice_id">Sales Invoice ID</Label>
                  <Input
                    id="sales_invoice_id"
                    {...register("sales_invoice_id")}
                    placeholder="Link to existing Sales Invoice..."
                  />
                  <p className="text-xs text-gray-500">
                    If this credit note is linked to a sales invoice, enter the
                    ID and click Verify to load lines automatically.
                  </p>
                </div>
              </CardContent>
            </Card>

            <CreditNoteLinesTable
              control={control}
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
            />
          </div>

          <div className="space-y-5 xl:sticky xl:top-36 xl:self-start">
            <CreditNoteTotalsCard
              subtotal={totals.subtotal}
              discount={totals.discount}
              tax={totals.tax}
              total={totals.total}
              lineCount={lines.length}
            />

            <CreditNoteCustomerBalanceCard
              customer={customer}
              creditNoteTotal={totals.total}
            />

            <CreditNoteInvoiceLinkCard
              salesInvoice={salesInvoiceInfo}
              creditNoteTotal={totals.total}
            />

            <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle>Accounting (Optional)</CardTitle>
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
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreditNoteFormPage;
