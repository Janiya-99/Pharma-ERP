import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash, Search } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "../../../lib/utils";

interface Allocation {
  id?: number; // temporary local ID for new allocations
  sales_invoice_id: number;
  invoice_number: string;
  invoice_date: string;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  allocated_amount: number;
}

interface Props {
  customerId: number | null;
  allocations: Allocation[];
  onAllocationsChange: (allocations: Allocation[]) => void;
  receiptAmount: number;
  readOnly?: boolean;
}

export const CustomerReceiptAllocationsTable: React.FC<Props> = ({
  customerId,
  allocations,
  onAllocationsChange,
  receiptAmount,
  readOnly = false,
}) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | "">("");

  useEffect(() => {
    if (customerId) {
      fetchCustomerInvoices();
    } else {
      setInvoices([]);
    }
  }, [customerId]);

  const fetchCustomerInvoices = async () => {
    setLoading(true);
    try {
      // Get all posted invoices with a balance > 0 for this customer
      const res = await invoiceCenterApi.getSalesInvoices({
        customer_id: customerId,
        posted_status: "posted",
        payment_status: "unpaid,partial",
        limit: 100, // Reasonable limit for dropdown
      });
      if (res.data?.success) {
        setInvoices(res.data.data || []);
      }
    } catch (error) {
      toast.error("Failed to load customer invoices");
    } finally {
      setLoading(false);
    }
  };

  const currentAllocatedTotal = useMemo(() => {
    return allocations.reduce(
      (sum, alloc) => sum + (Number(alloc.allocated_amount) || 0),
      0
    );
  }, [allocations]);

  const remainingToAllocate = Math.max(
    0,
    receiptAmount - currentAllocatedTotal
  );

  const handleAddAllocation = () => {
    if (!selectedInvoiceId) return;

    const invoice = invoices.find(
      (inv) => inv.id === Number(selectedInvoiceId)
    );
    if (!invoice) return;

    // Check if already allocated
    if (allocations.some((a) => a.sales_invoice_id === invoice.id)) {
      toast.error("This invoice is already added to the allocations list.");
      return;
    }

    // Auto-calculate default allocation amount
    // Allocate the minimum between (remaining receipt amount) and (invoice balance)
    const suggestedAllocation = Math.min(
      remainingToAllocate,
      invoice.balance_amount || 0
    );

    const newAllocation: Allocation = {
      id: Date.now(), // temporary UI id
      sales_invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      total_amount: invoice.total_amount,
      paid_amount: invoice.paid_amount,
      balance_amount: invoice.balance_amount,
      allocated_amount: suggestedAllocation,
    };

    onAllocationsChange([...allocations, newAllocation]);
    setSelectedInvoiceId("");
  };

  const handleRemoveAllocation = (index: number) => {
    if (readOnly) return;
    const newAllocations = [...allocations];
    newAllocations.splice(index, 1);
    onAllocationsChange(newAllocations);
  };

  const handleAllocatedAmountChange = (index: number, value: string) => {
    if (readOnly) return;
    const newAllocations = [...allocations];
    const val = parseFloat(value);

    // Allow empty string while typing, otherwise use 0
    newAllocations[index].allocated_amount = isNaN(val) ? (value as any) : val;

    onAllocationsChange(newAllocations);
  };

  const validateAllocatedAmountOnBlur = (index: number) => {
    if (readOnly) return;
    const newAllocations = [...allocations];
    const alloc = newAllocations[index];

    let val = Number(alloc.allocated_amount) || 0;

    // Cannot allocate more than the invoice balance
    if (val > alloc.balance_amount) {
      val = alloc.balance_amount;
      toast.warning(
        `Cannot allocate more than the invoice balance (${formatCurrency(
          alloc.balance_amount
        )}). Adjusted automatically.`
      );
    }

    newAllocations[index].allocated_amount = val;
    onAllocationsChange(newAllocations);
  };

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex items-end gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Add Invoice to Allocation
            </label>
            <div className="relative">
              <select
                className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={selectedInvoiceId}
                onChange={(e) =>
                  setSelectedInvoiceId(Number(e.target.value) || "")
                }
                disabled={!customerId || loading}
              >
                <option value="">Select an invoice to allocate...</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoice_number} ({formatDate(inv.invoice_date)}) -
                    Balance: {formatCurrency(inv.balance_amount)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleAddAllocation}
            disabled={!selectedInvoiceId || remainingToAllocate <= 0}
            className="shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Allocation
          </Button>
        </div>
      )}

      {remainingToAllocate <= 0 &&
        !readOnly &&
        receiptAmount > 0 &&
        selectedInvoiceId && (
          <p className="px-2 text-sm font-medium text-orange-600">
            Receipt amount is fully allocated. Increase receipt amount to
            allocate more invoices.
          </p>
        )}

      <div className="overflow-hidden rounded-md border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 font-medium text-gray-500">
            <tr>
              <th className="px-4 py-3">Invoice #</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Invoice Total</th>
              <th className="px-4 py-3 text-right">Balance</th>
              <th className="w-48 px-4 py-3 text-right">Allocated Amount</th>
              {!readOnly && <th className="w-16 px-4 py-3 text-center"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {allocations.length === 0 ? (
              <tr>
                <td
                  colSpan={readOnly ? 5 : 6}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No invoices allocated yet.
                </td>
              </tr>
            ) : (
              allocations.map((alloc, idx) => (
                <tr key={alloc.id || idx}>
                  <td className="px-4 py-3 font-medium text-brand-600">
                    {alloc.invoice_number}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(alloc.invoice_date)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(alloc.total_amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(alloc.balance_amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {readOnly ? (
                      <span className="font-medium text-green-700">
                        {formatCurrency(alloc.allocated_amount)}
                      </span>
                    ) : (
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        max={alloc.balance_amount}
                        className="h-8 w-full text-right"
                        value={
                          alloc.allocated_amount === 0
                            ? ""
                            : alloc.allocated_amount
                        }
                        onChange={(e) =>
                          handleAllocatedAmountChange(idx, e.target.value)
                        }
                        onBlur={() => validateAllocatedAmountOnBlur(idx)}
                      />
                    )}
                  </td>
                  {!readOnly && (
                    <td className="px-4 py-3 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleRemoveAllocation(idx)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
          {allocations.length > 0 && (
            <tfoot className="bg-gray-50 font-medium">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right">
                  Total Allocated:
                </td>
                <td className="px-4 py-3 text-right text-green-700">
                  {formatCurrency(currentAllocatedTotal)}
                </td>
                {!readOnly && <td></td>}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
