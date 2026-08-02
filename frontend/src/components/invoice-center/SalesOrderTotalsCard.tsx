import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import type {
  SalesOrderLineForm,
  SalesOrderLine,
} from "../../types/invoice-center";

type SalesOrderTotalsCardProps = {
  lines?: SalesOrderLineForm[] | SalesOrderLine[];
  subtotalAmount?: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
};

const toNumber = (value: number | string | undefined | null): number =>
  Number(value || 0);

const formatMoney = (value: number): string =>
  `LKR ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const SalesOrderTotalsCard: React.FC<SalesOrderTotalsCardProps> = ({
  lines = [],
  subtotalAmount,
  discountAmount,
  taxAmount,
  totalAmount,
}) => {
  const computed = lines.reduce(
    (acc, line) => {
      const quantity = toNumber(line.quantity);
      const unitPrice = toNumber(line.unit_price);
      const discount = toNumber(line.discount_amount);
      const tax = toNumber(line.tax_amount);
      const subtotal = quantity * unitPrice;

      return {
        subtotal: acc.subtotal + subtotal,
        discount: acc.discount + discount,
        tax: acc.tax + tax,
        total: acc.total + subtotal - discount + tax,
      };
    },
    { subtotal: 0, discount: 0, tax: 0, total: 0 }
  );

  const totals = {
    subtotal: subtotalAmount ?? computed.subtotal,
    discount: discountAmount ?? computed.discount,
    tax: taxAmount ?? computed.tax,
    total: totalAmount ?? computed.total,
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Order Totals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatMoney(totals.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Discount</span>
          <span className="font-medium">{formatMoney(totals.discount)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span className="font-medium">{formatMoney(totals.tax)}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-bold">{formatMoney(totals.total)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesOrderTotalsCard;
