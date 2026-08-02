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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Receipt Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {allocationCount !== undefined && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>Allocations</span>
              <span>{allocationCount}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold">
            <span>Receipt Amount</span>
            <span>{formatLKR(receiptAmount)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-sm text-green-700">
            <span>Allocated Amount</span>
            <span>{formatLKR(allocatedAmount)}</span>
          </div>
          <div
            className={`flex justify-between text-sm font-medium ${
              unallocatedAmount > 0 ? "text-orange-600" : "text-gray-600"
            }`}
          >
            <span>Unallocated Amount</span>
            <span>{formatLKR(unallocatedAmount)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
