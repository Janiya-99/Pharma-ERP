import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { AlertTriangle, Info } from "lucide-react";

interface Props {
  quantityOnHand: number;
  quantityAllocated: number;
  quantityAvailable: number;
  averageCost: number;
  stockValue: number;
  requiredQuantity: number;
}

export const SalesInvoiceStockAvailabilityCard: React.FC<Props> = ({
  quantityOnHand,
  quantityAllocated,
  quantityAvailable,
  averageCost,
  stockValue,
  requiredQuantity,
}) => {
  const isInsufficient = requiredQuantity > quantityAvailable;
  const isExact = requiredQuantity === quantityAvailable && requiredQuantity > 0;

  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(amount);
  };

  const formatQty = (qty: number) => {
    return Number(qty).toFixed(3);
  };

  return (
    <Card className={isInsufficient ? "border-red-500" : isExact ? "border-yellow-500" : ""}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">Stock Availability</CardTitle>
        {isInsufficient ? (
          <AlertTriangle className="h-4 w-4 text-red-500" />
        ) : isExact ? (
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        ) : (
          <Info className="h-4 w-4 text-blue-500" />
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Quantity On Hand</span>
            <span>{formatQty(quantityOnHand)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Quantity Allocated</span>
            <span>{formatQty(quantityAllocated)}</span>
          </div>
          <div className="flex justify-between pt-1 border-t mt-1 font-semibold">
            <span>Quantity Available</span>
            <span className={isInsufficient ? "text-red-600" : ""}>{formatQty(quantityAvailable)}</span>
          </div>
          <div className="flex justify-between text-xs mt-2 text-blue-600">
            <span>Required Quantity</span>
            <span>{formatQty(requiredQuantity)}</span>
          </div>
          
          <div className="mt-4 pt-2 border-t space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Average Cost</span>
              <span>{formatLKR(averageCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Stock Value</span>
              <span>{formatLKR(stockValue)}</span>
            </div>
          </div>
          
          <div className="mt-3">
            {isInsufficient ? (
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded block text-center">Insufficient Stock</span>
            ) : isExact ? (
              <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 px-2 py-1 rounded block text-center">Zero Stock After Invoice</span>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
