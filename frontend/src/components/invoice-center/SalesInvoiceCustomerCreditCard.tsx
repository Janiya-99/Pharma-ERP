import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Customer } from "../../types/invoice-center";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface Props {
  customer: Customer | null;
  invoiceTotal: number;
}

export const SalesInvoiceCustomerCreditCard: React.FC<Props> = ({ customer, invoiceTotal }) => {
  if (!customer) return null;

  const { credit_limit, current_balance, credit_days } = customer;
  const projectedBalance = current_balance + invoiceTotal;
  const availableCredit = credit_limit > 0 ? credit_limit - projectedBalance : 0;
  
  const isOverLimit = credit_limit > 0 && projectedBalance > credit_limit;
  const hasNoLimit = credit_limit <= 0;

  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(amount);
  };

  return (
    <Card className={isOverLimit ? "border-red-500" : ""}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">Customer Credit Summary</CardTitle>
        {isOverLimit ? (
          <AlertTriangle className="h-4 w-4 text-red-500" />
        ) : (
          <CheckCircle className="h-4 w-4 text-green-500" />
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Credit Limit</span>
            <span className="font-medium">{hasNoLimit ? "No Limit" : formatLKR(credit_limit)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Current Balance</span>
            <span className="font-medium">{formatLKR(current_balance)}</span>
          </div>
          <div className="flex justify-between text-blue-600">
            <span>Invoice Total</span>
            <span>+{formatLKR(invoiceTotal)}</span>
          </div>
          <div className="flex justify-between pt-1 border-t mt-1 font-semibold">
            <span>Projected Balance</span>
            <span className={isOverLimit ? "text-red-600" : ""}>{formatLKR(projectedBalance)}</span>
          </div>
          {!hasNoLimit && (
            <div className="flex justify-between text-xs mt-2">
              <span className="text-gray-500">Available Credit</span>
              <span className={availableCredit < 0 ? "text-red-600 font-bold" : "text-green-600 font-medium"}>
                {formatLKR(availableCredit)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-500">Credit Days</span>
            <span>{credit_days} days</span>
          </div>
          
          <div className="mt-3">
            {isOverLimit ? (
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">Over Limit</span>
            ) : hasNoLimit ? (
              <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">No Credit Limit</span>
            ) : (
              <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded">OK</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
