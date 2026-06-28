import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Customer } from "../../types/invoice-center";

interface Props {
  customer: Customer | null;
  creditNoteTotal: number;
}

export const CreditNoteCustomerBalanceCard: React.FC<Props> = ({ customer, creditNoteTotal }) => {
  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(amount);
  };

  if (!customer) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Customer Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500 italic">Select a customer to view balance impact.</div>
        </CardContent>
      </Card>
    );
  }

  const currentBalance = Number(customer.current_balance || 0);
  const balanceAfterCredit = currentBalance - creditNoteTotal;
  const isExceeding = creditNoteTotal > currentBalance;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Customer Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">{customer.customer_name}</span>
            <Badge variant="outline">{customer.customer_code}</Badge>
          </div>
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>Status</span>
            <span className="capitalize">{customer.status.replace("_", " ")}</span>
          </div>

          <Separator />
          
          <div className="flex justify-between text-sm">
            <span>Current Balance</span>
            <span>{formatLKR(currentBalance)}</span>
          </div>
          
          <div className="flex justify-between text-sm text-green-600">
            <span>Credit Amount</span>
            <span>-{formatLKR(creditNoteTotal)}</span>
          </div>
          
          <div className="flex justify-between font-bold text-base mt-2">
            <span>Balance After Credit</span>
            <span className={isExceeding ? "text-red-600" : ""}>{formatLKR(balanceAfterCredit)}</span>
          </div>

          {isExceeding && (
            <div className="mt-2 text-xs text-red-500 font-medium">
              Warning: Credit note amount exceeds current balance. 
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
