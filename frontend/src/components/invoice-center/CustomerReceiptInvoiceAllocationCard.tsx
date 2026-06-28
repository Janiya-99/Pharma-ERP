import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

interface Props {
  invoiceNumber: string;
  invoiceTotal: number;
  paidAmount: number;
  balanceAmount: number;
  allocatedAmount: number;
  balanceAfterAllocation: number;
}

export const CustomerReceiptInvoiceAllocationCard: React.FC<Props> = ({
  invoiceNumber,
  invoiceTotal,
  paidAmount,
  balanceAmount,
  allocatedAmount,
  balanceAfterAllocation,
}) => {
  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount || 0);
  };

  return (
    <Card className="border-gray-200 bg-gray-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-600">
          Selected Invoice: {invoiceNumber}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Invoice Total</span>
            <span>{formatLKR(invoiceTotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Already Paid</span>
            <span>{formatLKR(paidAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Balance Before Allocation</span>
            <span>{formatLKR(balanceAmount)}</span>
          </div>
          <Separator className="my-1" />
          <div className="flex justify-between text-sm text-green-700">
            <span>Allocating Now</span>
            <span>-{formatLKR(allocatedAmount)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Balance After Allocation</span>
            <span>{formatLKR(balanceAfterAllocation)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
