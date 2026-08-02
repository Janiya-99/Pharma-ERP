import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

interface LinkedSalesOrder {
  sales_order_number: string;
  sales_order_date: string;
  order_status: string;
  approval_status: string;
  total_amount?: number;
  pending_amount?: number;
}

interface Props {
  salesOrder: LinkedSalesOrder | null;
}

export const SalesInvoiceSalesOrderLinkCard: React.FC<Props> = ({
  salesOrder,
}) => {
  if (!salesOrder) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Sales Order Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">
            Direct Invoice (Not linked to a Sales Order)
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <Card className="border-indigo-200 bg-indigo-50/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-indigo-800">
          Linked Sales Order
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Order Number</span>
            <span className="font-medium text-indigo-700">
              {salesOrder.sales_order_number}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Order Date</span>
            <span>{formatDate(salesOrder.sales_order_date)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Status</span>
            <Badge variant="outline" className="bg-white text-xs">
              {salesOrder.order_status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>

          {salesOrder.total_amount !== undefined && (
            <div className="mt-2 flex justify-between border-t border-indigo-100 pt-2">
              <span className="text-gray-600">Total Amount</span>
              <span>{formatLKR(salesOrder.total_amount)}</span>
            </div>
          )}
          {salesOrder.pending_amount !== undefined && (
            <div className="flex justify-between font-semibold">
              <span className="text-gray-600">Pending Amount</span>
              <span className="text-indigo-700">
                {formatLKR(salesOrder.pending_amount)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
