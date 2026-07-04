import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { PurchaseReturn } from "types/inventory";

interface TotalsProps {
  purchaseReturn: Partial<PurchaseReturn>;
}

export const PurchaseReturnTotalsCard: React.FC<TotalsProps> = ({
  purchaseReturn,
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-gray-500">
          Return Totals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Quantity:</span>
          <span className="font-medium">
            {purchaseReturn.total_quantity?.toFixed(3) || "0.000"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal Amount:</span>
          <span className="font-medium">
            {(purchaseReturn.subtotal_amount || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex justify-between text-sm text-red-600">
          <span>Discount Amount:</span>
          <span>
            -
            {(purchaseReturn.discount_amount || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex justify-between text-sm text-indigo-600">
          <span>Tax Amount:</span>
          <span>
            +
            {(purchaseReturn.tax_amount || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="mt-2 flex justify-between border-t pt-2 text-base font-bold">
          <span>Total Amount (LKR):</span>
          <span>
            {(purchaseReturn.total_amount || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export const GRNLinkedReturnCard: React.FC<{ grn: any }> = ({ grn }) => {
  if (!grn) return null;

  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-slate-700 text-sm font-medium uppercase tracking-wider">
          Linked GRN Information
        </CardTitle>
      </CardHeader>
      <CardContent className="text-slate-600 space-y-1 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-medium">GRN Number:</span> {grn.grn_number}
          </div>
          <div>
            <span className="font-medium">GRN Date:</span>{" "}
            {new Date(grn.grn_date).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Invoice No:</span>{" "}
            {grn.supplier_invoice_number || "N/A"}
          </div>
          <div>
            <span className="font-medium">Status:</span> {grn.posted_status}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const AvailableStockCard: React.FC<{
  stock: any;
  loading?: boolean;
}> = ({ stock, loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse rounded border bg-gray-50 p-2 text-xs text-gray-500">
        Loading stock balance...
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="rounded border border-yellow-200 bg-yellow-50 p-2 text-xs text-yellow-600">
        No stock balance found for selected criteria.
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border-slate-200 space-y-1 rounded border p-2 text-xs shadow-sm">
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <div className="flex justify-between">
          <span className="text-gray-500">On Hand:</span>
          <span className="font-medium">
            {stock.quantity_on_hand?.toFixed(3)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Avg Cost:</span>
          <span className="font-medium">
            LKR {stock.average_cost?.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Allocated:</span>
          <span className="font-medium text-orange-600">
            {stock.quantity_allocated?.toFixed(3)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Value:</span>
          <span className="font-medium">
            LKR {stock.stock_value?.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="border-slate-200 mt-1 flex justify-between border-t pt-1 font-bold">
        <span className="text-green-700">Available:</span>
        <span className="text-green-700">
          {stock.quantity_available?.toFixed(3)}
        </span>
      </div>
    </div>
  );
};
