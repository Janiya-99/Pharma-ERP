import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { SalesInvoicePaymentStatusBadge } from "./SalesInvoicePaymentStatusBadge";
import { SalesInvoicePaymentStatus } from "../../types/invoice-center";

interface Props {
  status: SalesInvoicePaymentStatus;
  paidAmount: number;
  balanceAmount: number;
}

export const SalesInvoicePaymentSummaryCard: React.FC<Props> = ({
  status,
  paidAmount,
  balanceAmount,
}) => {
  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Payment Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Payment Status</span>
            <SalesInvoicePaymentStatusBadge status={status} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Paid Amount</span>
            <span className="font-medium text-green-600">
              {formatLKR(paidAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Balance Amount</span>
            <span className="font-semibold text-red-600">
              {formatLKR(balanceAmount)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
