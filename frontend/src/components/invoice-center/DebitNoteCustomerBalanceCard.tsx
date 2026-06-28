import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Customer } from "../../types/invoice-center";

interface Props {
  customer: Customer | null;
  debitNoteTotal: number;
}

export const DebitNoteCustomerBalanceCard: React.FC<Props> = ({ customer, debitNoteTotal }) => {
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
  const creditLimit = Number(customer.credit_limit || 0);
  const creditDays = Number(customer.credit_days || 0);
  const balanceAfterDebit = currentBalance + debitNoteTotal;
  const availableCreditAfterDebit = creditLimit > 0 ? creditLimit - balanceAfterDebit : 0;
  const isExceeding = creditLimit > 0 && balanceAfterDebit > creditLimit;

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
            <span>Customer Status</span>
            <span className="capitalize">{customer.status.replace("_", " ")}</span>
          </div>

          <Separator />
          
          <div className="flex justify-between text-sm">
            <span>Current Balance</span>
            <span>{formatLKR(currentBalance)}</span>
          </div>
          
          <div className="flex justify-between text-sm text-orange-600">
            <span>Debit Note Total</span>
            <span>+{formatLKR(debitNoteTotal)}</span>
          </div>
          
          <div className="flex justify-between font-bold text-base mt-2">
            <span>Balance After Debit</span>
            <span className={isExceeding ? "text-red-600" : ""}>{formatLKR(balanceAfterDebit)}</span>
          </div>

          <Separator />

          <div className="flex justify-between text-sm">
            <span>Credit Limit</span>
            <span>{creditLimit > 0 ? formatLKR(creditLimit) : "N/A"}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Available Credit After Debit</span>
            <span className={isExceeding ? "text-red-600 font-bold" : ""}>
              {creditLimit > 0 ? formatLKR(availableCreditAfterDebit) : "N/A"}
            </span>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>Credit Days</span>
            <span>{creditDays > 0 ? `${creditDays} Days` : "N/A"}</span>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>Credit Status</span>
            {creditLimit > 0 ? (
                isExceeding ? (
                    <Badge variant="destructive" className="h-5">Over Limit</Badge>
                ) : (
                    <Badge variant="secondary" className="h-5 bg-green-100 text-green-800 hover:bg-green-100">Within Limit</Badge>
                )
            ) : (
                <span className="text-gray-500">No Limit</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
