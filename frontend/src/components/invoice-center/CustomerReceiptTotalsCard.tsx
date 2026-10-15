import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

interface Props {
  receiptAmount: number;
  allocatedAmount: number;
  unallocatedAmount: number;
  allocationCount?: number;
}

export const CustomerReceiptTotalsCard: React.FC<Props> = ({
  receiptAmount,
  allocatedAmount,
  unallocatedAmount,
  allocationCount,
}) => {
  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount || 0);
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-5 shadow-xs">
      <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">Receipt Summary</h4>
        {allocationCount !== undefined && (
          <span className="text-xs font-semibold text-slate-500">
            {allocationCount} {allocationCount === 1 ? "Invoice" : "Invoices"}
          </span>
        )}
      </div>
      <div className="pt-4 space-y-2.5">
        <div className="flex justify-between text-base font-extrabold text-slate-900">
          <span>Receipt Total</span>
          <span className="text-brand-600">{formatLKR(receiptAmount)}</span>
        </div>
        <div className="border-t border-slate-100 my-2" />
        <div className="flex justify-between text-sm text-emerald-600 font-semibold">
          <span>Allocated Amount</span>
          <span>{formatLKR(allocatedAmount)}</span>
        </div>
        <div
          className={`flex justify-between text-sm font-semibold ${
            unallocatedAmount > 0 ? "text-amber-600" : "text-slate-500"
          }`}
        >
          <span>Unallocated Amount</span>
          <span>{formatLKR(unallocatedAmount)}</span>
        </div>
      </div>
    </div>
  );
};
