import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";

interface Props {
  salesInvoice: any | null;
  debitNoteTotal: number;
}

export const DebitNoteInvoiceLinkCard: React.FC<Props> = ({ salesInvoice }) => {
  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  if (!salesInvoice) {
    return null;
  }

  const invoiceBalance = Number(salesInvoice.balance_amount || 0);

  return (
    <Card>
      <CardHeader className="bg-indigo-50 pb-2">
        <CardTitle className="text-lg text-indigo-900">
          Linked Sales Invoice
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Invoice No</span>
            <Badge variant="secondary">{salesInvoice.invoice_number}</Badge>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>Date</span>
            <span>{formatDate(salesInvoice.invoice_date)}</span>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Amount</span>
            <span>{formatLKR(salesInvoice.total_amount)}</span>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>Paid Amount</span>
            <span>{formatLKR(salesInvoice.paid_amount)}</span>
          </div>

          <Separator />

          <div className="flex justify-between text-sm font-medium">
            <span>Invoice Balance</span>
            <span>{formatLKR(invoiceBalance)}</span>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>Payment Status</span>
            <span className="capitalize">
              {salesInvoice.payment_status?.replace("_", " ")}
            </span>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>Posted Status</span>
            <span className="capitalize">{salesInvoice.posted_status}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
