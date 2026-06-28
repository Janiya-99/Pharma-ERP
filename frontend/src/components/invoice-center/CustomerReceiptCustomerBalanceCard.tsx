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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Customer Balance Impact</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {customerStatus && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>Customer Status</span>
              <span className="font-medium capitalize">
                {customerStatus.replace("_", " ")}
              </span>
            </div>
          )}
          {creditLimit !== undefined && creditLimit > 0 && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>Credit Limit</span>
              <span>{formatLKR(creditLimit)}</span>
            </div>
          )}
          {creditDays !== undefined && creditDays > 0 && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>Credit Days</span>
              <span>{creditDays} Days</span>
            </div>
          )}
          <Separator className="my-2" />
          <div className="flex justify-between text-sm">
            <span>Current Balance</span>
            <span>{formatLKR(currentBalance)}</span>
          </div>
          <div className="flex justify-between text-sm text-blue-600">
            <span>Receipt Amount</span>
            <span>{formatLKR(receiptAmount)}</span>
          </div>
          <div className="flex justify-between text-sm text-green-600">
            <span>Allocated Amount</span>
            <span>-{formatLKR(allocatedAmount)}</span>
          </div>
          <div className="flex justify-between text-sm text-orange-600">
            <span>Unallocated Amount (Stored)</span>
            <span>{formatLKR(unallocatedAmount)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-base font-bold">
            <span>Balance After Allocation</span>
            <span>{formatLKR(balanceAfterReceipt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
