import React from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import type { Customer } from "../../types/invoice-center";

type SalesOrderCustomerCreditCardProps = {
  customer?: Customer | null;
};

const formatMoney = (value: number | undefined): string =>
  `LKR ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const SalesOrderCustomerCreditCard: React.FC<SalesOrderCustomerCreditCardProps> = ({ customer }) => {
  if (!customer) return null;

  const isOverLimit = Number(customer.current_balance || 0) > Number(customer.credit_limit || 0);

  return (
    <Card className="bg-white">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Customer Credit</CardTitle>
        {isOverLimit && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Over limit
          </Badge>
        )}
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
        <div>
          <p className="text-muted-foreground">Customer</p>
          <p className="font-semibold">{customer.customer_name}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Credit Limit</p>
          <p className="font-semibold">{formatMoney(customer.credit_limit)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Current Balance</p>
          <p className="font-semibold">{formatMoney(customer.current_balance)}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesOrderCustomerCreditCard;
