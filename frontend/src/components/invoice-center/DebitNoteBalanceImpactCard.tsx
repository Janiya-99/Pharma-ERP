import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

interface Props {
  customerCurrentBalance: number;
  debitNoteTotal: number;
  customerBalanceAfterDebit: number;
  isLinkedToInvoice: boolean;
  invoiceBalanceBefore?: number | null;
  invoiceBalanceAfter?: number | null;
}

export const DebitNoteBalanceImpactCard: React.FC<Props> = ({ 
  customerCurrentBalance, 
  debitNoteTotal, 
  customerBalanceAfterDebit,
  isLinkedToInvoice,
  invoiceBalanceBefore,
  invoiceBalanceAfter
}) => {
  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Balance Impact</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Customer Balance Before</span>
            <span>{formatLKR(customerCurrentBalance)}</span>
          </div>
          
          <div className="flex justify-between text-sm text-orange-600">
            <span>Debit Note Total</span>
            <span>+{formatLKR(debitNoteTotal)}</span>
          </div>
          
          <div className="flex justify-between font-bold text-base mt-2">
            <span>Customer Balance After</span>
            <span>{formatLKR(customerBalanceAfterDebit)}</span>
          </div>

          {isLinkedToInvoice && invoiceBalanceBefore !== undefined && invoiceBalanceAfter !== undefined && (
            <>
              <Separator className="my-2" />
              <div className="flex justify-between text-sm">
                <span>Invoice Balance Before</span>
                <span>{formatLKR(invoiceBalanceBefore || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm mt-1">
                <span>Invoice Balance After</span>
                <span>{formatLKR(invoiceBalanceAfter || 0)}</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
