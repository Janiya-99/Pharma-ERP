import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface Props {
  unallocatedAmount: number;
}

export const CustomerReceiptUnallocatedWarningCard: React.FC<Props> = ({ unallocatedAmount }) => {
  if (unallocatedAmount <= 0) return null;

  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(amount);
  };

  return (
    <Alert variant="default" className="bg-orange-50 border-orange-200 text-orange-800">
      <AlertCircle className="h-4 w-4 stroke-orange-600" />
      <AlertTitle className="text-orange-800 font-semibold">Unallocated Amount: {formatLKR(unallocatedAmount)}</AlertTitle>
      <AlertDescription className="text-orange-700 text-sm mt-1">
        This unallocated amount will be stored on the receipt for visibility, but it <strong>will not</strong> reduce the customer's balance in this step. Advanced allocation will be built later.
      </AlertDescription>
    </Alert>
  );
};
