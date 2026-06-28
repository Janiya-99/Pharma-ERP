import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

interface Props {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid?: number;
  balance?: number;
  lineCount?: number;
}

export const SalesInvoiceTotalsCard: React.FC<Props> = ({
  subtotal,
  discount,
  tax,
  total,
  paid,
  balance,
  lineCount,
}) => {
  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Invoice Totals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {lineCount !== undefined && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>Line Items</span>
              <span>{lineCount}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatLKR(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-red-600">
            <span>Discount</span>
            <span>-{formatLKR(discount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>{formatLKR(tax)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-bold text-base">
            <span>Total Amount</span>
            <span>{formatLKR(total)}</span>
          </div>
          
          {paid !== undefined && balance !== undefined && (
            <>
              <Separator className="my-2" />
              <div className="flex justify-between text-sm text-green-600">
                <span>Paid Amount</span>
                <span>{formatLKR(paid)}</span>
              </div>
              <div className="flex justify-between font-semibold text-sm">
                <span>Balance Due</span>
                <span>{formatLKR(balance)}</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
