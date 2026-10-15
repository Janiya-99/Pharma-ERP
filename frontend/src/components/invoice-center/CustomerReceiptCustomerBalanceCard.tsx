import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

interface Props {
  currentBalance: number;
  receiptAmount: number;
  allocatedAmount: number;
  unallocatedAmount: number;
  balanceAfterReceipt: number;
  creditLimit?: number;
  creditDays?: number;
  customerStatus?: string;
}

export const CustomerReceiptCustomerBalanceCard: React.FC<Props> = ({
  currentBalance,
  receiptAmount,
  allocatedAmount,
  unallocatedAmount,
  balanceAfterReceipt,
  creditLimit,
  creditDays,
  customerStatus,
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
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">Customer Balance Impact</h4>
        {customerStatus && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 capitalize">
            {customerStatus.replace("_", " ")}
          </span>
        )}
      </div>
      <div className="pt-4 space-y-2.5">
        {creditLimit !== undefined && creditLimit > 0 && (
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>Credit Limit</span>
            <span className="font-semibold text-slate-700">{formatLKR(creditLimit)}</span>
          </div>
        )}
        {creditDays !== undefined && creditDays > 0 && (
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>Credit Days</span>
            <span className="font-semibold text-slate-700">{creditDays} Days</span>
          </div>
        )}
        <div className="border-t border-slate-100 my-2" />
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 font-medium">Current Balance</span>
          <span className="font-bold text-slate-900">{formatLKR(currentBalance)}</span>
        </div>
        <div className="flex justify-between text-sm text-indigo-600 font-medium">
          <span>Receipt Amount</span>
          <span className="font-bold">{formatLKR(receiptAmount)}</span>
        </div>
        <div className="flex justify-between text-sm text-emerald-600 font-medium">
          <span>Allocated Amount</span>
          <span className="font-bold">-{formatLKR(allocatedAmount)}</span>
        </div>
        <div className="flex justify-between text-sm text-amber-600 font-medium">
          <span>Unallocated Amount (Stored)</span>
          <span className="font-bold">{formatLKR(unallocatedAmount)}</span>
        </div>
        <div className="border-t border-slate-200 my-2" />
        <div className="flex justify-between text-sm font-extrabold text-slate-900">
          <span>Balance After Allocation</span>
          <span className="text-brand-600">{formatLKR(balanceAfterReceipt)}</span>
        </div>
      </div>
    </div>
  );
};
