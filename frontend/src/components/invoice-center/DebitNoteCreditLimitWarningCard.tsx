import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertTriangle } from "lucide-react";

interface Props {
  projectedBalance: number;
  creditLimit: number;
}

export const DebitNoteCreditLimitWarningCard: React.FC<Props> = ({
  projectedBalance,
  creditLimit,
}) => {
  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  if (creditLimit <= 0) return null;

  const isExceeding = projectedBalance > creditLimit;
  const availableCredit = isExceeding ? 0 : creditLimit - projectedBalance;

  return (
    <Card className={isExceeding ? "border-red-500" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Credit Limit Check</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Credit Limit</span>
            <span>{formatLKR(creditLimit)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Projected Balance</span>
            <span className={isExceeding ? "font-medium text-red-600" : ""}>
              {formatLKR(projectedBalance)}
            </span>
          </div>
          <div className="mt-1 flex justify-between text-sm font-bold">
            <span>Available Credit After Debit</span>
            <span className={isExceeding ? "text-red-600" : "text-green-600"}>
              {formatLKR(availableCredit)}
            </span>
          </div>

          {isExceeding && (
            <Alert variant="destructive" className="mt-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Credit Limit Exceeded</AlertTitle>
              <AlertDescription>
                This debit note will cause the customer's balance to exceed
                their credit limit. Approval and posting will be blocked.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
