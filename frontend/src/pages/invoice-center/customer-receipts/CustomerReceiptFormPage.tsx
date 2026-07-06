import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  FileText,
  Loader2,
  ReceiptText,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { useAuth } from "../../../auth/AuthContext";
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
import {
  CustomerSelect,
  InvoiceCenterFieldGrid,
  InvoiceCenterFormBody,
  InvoiceCenterFormHeader,
  InvoiceCenterFormPage,
  InvoiceCenterFormSection,
} from "../../../components/invoice-center";
import { CustomerReceiptAllocationsTable } from "./CustomerReceiptAllocationsTable";

const receiptSchema = z.object({
  customer_id: z.number().min(1, "Customer is required"),
  receipt_date: z.string().min(1, "Receipt date is required"),
  payment_method: z.enum([
    "cash",
    "bank_transfer",
    "cheque",
    "card",
    "online",
    "other",
  ]),
  payment_reference: z.string().optional(),
  receipt_amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  remarks: z.string().optional(),
});

type ReceiptFormValues = z.infer<typeof receiptSchema>;

const CustomerReceiptFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { activeBranch } = useAuth();
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [initialData, setInitialData] = useState<any>(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      receipt_date: new Date().toISOString().split("T")[0],
      payment_method: "cash",
      receipt_amount: 0,
    },
  });

  const customerId = watch("customer_id");
  const receiptAmount = watch("receipt_amount");

  useEffect(() => {
    if (isEditMode) {
      fetchReceipt();
    }
  }, [id]);

  const fetchReceipt = async () => {
    try {
      const response = await invoiceCenterApi.getCustomerReceiptById(id!);
      const res = response as any;
      if (res.data?.success || res.success !== false) {
        const data = res.data?.data || res.data;
        setInitialData(data);

        setValue("customer_id", data.customer_id);
        setValue("receipt_date", data.receipt_date.split("T")[0]);
        setValue("payment_method", data.payment_method);
        setValue("payment_reference", data.payment_reference || "");
        setValue("receipt_amount", data.receipt_amount);
        setValue("remarks", data.remarks || "");

        // Map allocations for the table
        if (data.allocations) {
          const mappedAllocations = data.allocations.map((a: any) => ({
            id: a.id,
            sales_invoice_id: a.sales_invoice_id,
            invoice_number: a.sales_invoice?.invoice_number || "Unknown",
            invoice_date: a.sales_invoice?.invoice_date || "",
            total_amount: a.sales_invoice?.total_amount || 0,
            paid_amount: a.sales_invoice?.paid_amount || 0,
            balance_amount:
              (a.sales_invoice?.balance_amount || 0) + a.allocated_amount, // Balance BEFORE this allocation
            allocated_amount: a.allocated_amount,
          }));
          setAllocations(mappedAllocations);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load receipt");
      navigate("/invoice-center/customer-receipts");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ReceiptFormValues) => {
    try {
      setSaving(true);

      // Calculate total allocated
      const totalAllocated = allocations.reduce(
        (sum, a) => sum + (Number(a.allocated_amount) || 0),
        0
      );

      if (totalAllocated > data.receipt_amount) {
        toast.error(
          `Total allocated amount (${totalAllocated}) cannot exceed receipt amount (${data.receipt_amount})`
        );
        setSaving(false);
        return;
      }

      // Format payload
      const payload = {
        ...data,
        branch_id: activeBranch?.id || 1,
        allocations: allocations.map((a) => ({
          sales_invoice_id: a.sales_invoice_id,
          allocated_amount: Number(a.allocated_amount),
        })),
      };

      if (isEditMode) {
        const res = await invoiceCenterApi.updateCustomerReceipt(id, payload);
        if (res.data?.success) {
          toast.success("Receipt updated successfully");
          navigate(`/invoice-center/customer-receipts/${id}`);
        }
      } else {
        const res = await invoiceCenterApi.createCustomerReceipt(payload);
        if (res.data?.success) {
          toast.success("Receipt created successfully");
          navigate(`/invoice-center/customer-receipts/${res.data.data.id}`);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse p-8 text-center text-gray-500">
        Loading receipt details...
      </div>
    );
  }

  // Prevent editing if not draft/rejected
  if (
    isEditMode &&
    initialData &&
    !["draft", "rejected"].includes(initialData.approval_status)
  ) {
    return (
      <div className="space-y-4 p-8 text-center">
        <div className="font-medium text-red-500">
          This receipt cannot be edited because it is{" "}
          {initialData.approval_status}.
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(`/invoice-center/customer-receipts/${id}`)}
        >
          View Receipt
        </Button>
      </div>
    );
  }

  const allocatedAmount = allocations.reduce(
    (sum, a) => sum + (Number(a.allocated_amount) || 0),
    0
  );
  const unallocatedAmount = Math.max(0, receiptAmount - allocatedAmount);
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(Number(amount || 0));

  return (
    <InvoiceCenterFormPage>
      <InvoiceCenterFormHeader
        title={
          isEditMode
            ? `Edit Receipt ${initialData?.receipt_number || ""}`
            : "Create Customer Receipt"
        }
        description="Record customer payments and allocate them against open invoices."
        icon={<ReceiptText className="h-5 w-5 text-[#002137]" />}
        backAction={
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        }
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="customer-receipt-form"
              className="bg-[#002137] text-white hover:bg-[#003452]"
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isEditMode ? "Update Receipt" : "Save Receipt"}
            </Button>
          </>
        }
      />
      <form
        id="customer-receipt-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <InvoiceCenterFormBody
          aside={
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-[#111827]">
                Receipt Summary
              </h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Receipt Amount</span>
                  <span className="font-semibold text-[#111827]">
                    {formatMoney(receiptAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Allocated</span>
                  <span className="font-semibold text-[#111827]">
                    {formatMoney(allocatedAmount)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#111827]">
                      Unallocated
                    </span>
                    <span
                      className={`font-bold ${
                        unallocatedAmount > 0
                          ? "text-orange-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {formatMoney(unallocatedAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          }
        >
          <InvoiceCenterFormSection
            title="Receipt Details"
            description="Choose the customer, payment date, method, and reference."
            icon={<CreditCard className="h-4 w-4 text-[#64748B]" />}
          >
            <InvoiceCenterFieldGrid>
              <div className="space-y-2">
                <Label>
                  Customer <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="customer_id"
                  control={control}
                  render={({ field }) => (
                    <CustomerSelect
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        // Clear allocations when customer changes
                        if (val !== customerId) {
                          setAllocations([]);
                        }
                      }}
                      error={errors.customer_id?.message}
                      disabled={isEditMode} // Usually shouldn't change customer on edit if allocations exist, simplify for now
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Receipt Date <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="receipt_date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Receipt date"
                      clearable={false}
                      triggerClassName={
                        errors.receipt_date ? "border-red-500" : ""
                      }
                      aria-label="Receipt date"
                    />
                  )}
                />
                {errors.receipt_date && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.receipt_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Payment Method <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="payment_method"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className={
                          errors.payment_method ? "border-red-500" : ""
                        }
                      >
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_transfer">
                          Bank Transfer
                        </SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="online">Online Payment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.payment_method && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.payment_method.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Payment Reference</Label>
                <Input
                  {...register("payment_reference")}
                  placeholder="Cheque #, Transaction ID, etc."
                />
              </div>
            </InvoiceCenterFieldGrid>
          </InvoiceCenterFormSection>

          <InvoiceCenterFormSection
            title="Amount & Notes"
            description="Enter the received amount and any internal remarks."
            icon={<Banknote className="h-4 w-4 text-[#64748B]" />}
          >
            <InvoiceCenterFieldGrid>
              <div className="space-y-2 xl:col-span-1">
                <Label>
                  Receipt Amount <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                    LKR
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    {...register("receipt_amount")}
                    className={`pl-12 text-lg font-semibold ${
                      errors.receipt_amount ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {errors.receipt_amount && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.receipt_amount.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Remarks</Label>
                <Textarea
                  {...register("remarks")}
                  placeholder="Optional notes about this receipt..."
                  className="h-20"
                />
              </div>
            </InvoiceCenterFieldGrid>
          </InvoiceCenterFormSection>

          <InvoiceCenterFormSection
            title="Invoice Allocations"
            description="Allocate this receipt to open invoices for the selected customer."
            icon={<FileText className="h-4 w-4 text-[#64748B]" />}
            actions={
              unallocatedAmount > 0 ? (
                <div className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm font-medium text-orange-600">
                  Unallocated: {formatMoney(unallocatedAmount)}
                </div>
              ) : null
            }
          >
            {!customerId ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-[#F8FAFC] py-8 text-center text-[#64748B]">
                Please select a customer first to view and allocate invoices.
              </div>
            ) : (
              <CustomerReceiptAllocationsTable
                customerId={customerId}
                allocations={allocations}
                onAllocationsChange={setAllocations}
                receiptAmount={Number(receiptAmount) || 0}
              />
            )}
          </InvoiceCenterFormSection>
        </InvoiceCenterFormBody>
      </form>
    </InvoiceCenterFormPage>
  );
};

export default CustomerReceiptFormPage;
