import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { CustomerSelect } from "../../../components/invoice-center";
import { CustomerReceiptAllocationsTable } from "./CustomerReceiptAllocationsTable";

const receiptSchema = z.object({
  customer_id: z.number().min(1, "Customer is required"),
  receipt_date: z.string().min(1, "Receipt date is required"),
  payment_method: z.enum(["cash", "bank_transfer", "cheque", "card", "online", "other"]),
  payment_reference: z.string().optional(),
  receipt_amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  remarks: z.string().optional(),
});

type ReceiptFormValues = z.infer<typeof receiptSchema>;

const CustomerReceiptFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
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
            balance_amount: (a.sales_invoice?.balance_amount || 0) + a.allocated_amount, // Balance BEFORE this allocation
            allocated_amount: a.allocated_amount,
          }));
          setAllocations(mappedAllocations);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load receipt");
      navigate("/admin/invoice-center/customer-receipts");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ReceiptFormValues) => {
    try {
      setSaving(true);
      
      // Calculate total allocated
      const totalAllocated = allocations.reduce((sum, a) => sum + (Number(a.allocated_amount) || 0), 0);
      
      if (totalAllocated > data.receipt_amount) {
        toast.error(`Total allocated amount (${totalAllocated}) cannot exceed receipt amount (${data.receipt_amount})`);
        setSaving(false);
        return;
      }

      // Format payload
      const payload = {
        ...data,
        allocations: allocations.map(a => ({
          sales_invoice_id: a.sales_invoice_id,
          allocated_amount: Number(a.allocated_amount),
        })),
      };

      if (isEditMode) {
        const res = await invoiceCenterApi.updateCustomerReceipt(id, payload);
        if (res.data?.success) {
          toast.success("Receipt updated successfully");
          navigate(`/admin/invoice-center/customer-receipts/${id}`);
        }
      } else {
        const res = await invoiceCenterApi.createCustomerReceipt(payload);
        if (res.data?.success) {
          toast.success("Receipt created successfully");
          navigate(`/admin/invoice-center/customer-receipts/${res.data.data.id}`);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading receipt details...</div>;
  }

  // Prevent editing if not draft/rejected
  if (isEditMode && initialData && !["draft", "rejected"].includes(initialData.approval_status)) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-red-500 font-medium">This receipt cannot be edited because it is {initialData.approval_status}.</div>
        <Button variant="outline" onClick={() => navigate(`/admin/invoice-center/customer-receipts/${id}`)}>
          View Receipt
        </Button>
      </div>
    );
  }

  const unallocatedAmount = Math.max(0, receiptAmount - allocations.reduce((sum, a) => sum + (Number(a.allocated_amount) || 0), 0));

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? `Edit Receipt ${initialData?.receipt_number || ""}` : "Create Customer Receipt"}
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-500" /> Basic Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Customer <span className="text-red-500">*</span></Label>
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
              <Label>Receipt Date <span className="text-red-500">*</span></Label>
              <Input type="date" {...register("receipt_date")} className={errors.receipt_date ? "border-red-500" : ""} />
              {errors.receipt_date && <p className="text-red-500 text-sm mt-1">{errors.receipt_date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Payment Method <span className="text-red-500">*</span></Label>
              <select
                {...register("payment_method")}
                className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="card">Credit/Debit Card</option>
                <option value="online">Online Payment</option>
                <option value="other">Other</option>
              </select>
              {errors.payment_method && <p className="text-red-500 text-sm mt-1">{errors.payment_method.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Payment Reference</Label>
              <Input {...register("payment_reference")} placeholder="Cheque #, Transaction ID, etc." />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Receipt Amount <span className="text-red-500">*</span></Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">LKR</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...register("receipt_amount")}
                  className={`pl-12 text-lg font-semibold ${errors.receipt_amount ? "border-red-500" : ""}`}
                />
              </div>
              {errors.receipt_amount && <p className="text-red-500 text-sm mt-1">{errors.receipt_amount.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Remarks</Label>
              <Textarea {...register("remarks")} placeholder="Optional notes about this receipt..." className="h-20" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Invoice Allocations</h2>
            {unallocatedAmount > 0 && (
              <div className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                Unallocated: {new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(unallocatedAmount)}
              </div>
            )}
          </div>
          
          <div className="p-6">
            {!customerId ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
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
          </div>
        </div>

        <div className="flex justify-end gap-4 pb-12">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" className="bg-brand-500 hover:bg-brand-600" disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEditMode ? "Update Receipt" : "Save Receipt"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomerReceiptFormPage;
