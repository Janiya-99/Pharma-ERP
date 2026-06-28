import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { SalesReturn } from "types/inventory";

interface TotalsProps {
  salesReturn: Partial<SalesReturn>;
}

export const SalesReturnTotalsCard: React.FC<TotalsProps> = ({
  salesReturn,
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
            {salesReturn.total_quantity?.toFixed(3) || "0.000"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal Amount:</span>
          <span className="font-medium">
            {(salesReturn.subtotal_amount || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex justify-between text-sm text-red-600">
          <span>Discount Amount:</span>
          <span>
            -
            {(salesReturn.discount_amount || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex justify-between text-sm text-blue-600">
          <span>Tax Amount:</span>
          <span>
            +
            {(salesReturn.tax_amount || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="mt-2 flex justify-between border-t pt-2 text-base font-bold">
          <span>Total Amount (LKR):</span>
          <span>
            {(salesReturn.total_amount || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

interface CustomerProps {
  salesReturn: Partial<SalesReturn>;
}

export const SalesReturnCustomerCard: React.FC<CustomerProps> = ({
  salesReturn,
}) => {
  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-slate-700 text-sm font-medium uppercase tracking-wider">
          Customer Details
        </CardTitle>
      </CardHeader>
      <CardContent className="text-slate-600 space-y-1 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-medium">Customer:</span>{" "}
            {salesReturn.customer_name || "N/A"}
          </div>
          <div>
            <span className="font-medium">Contact:</span>{" "}
            {salesReturn.customer_contact_number || "N/A"}
          </div>
          <div>
            <span className="font-medium">Sales Invoice No:</span>{" "}
            {salesReturn.sales_invoice_number || "N/A"}
          </div>
          <div>
            <span className="font-medium">Credit Note No:</span>{" "}
            {salesReturn.customer_credit_note_number || "N/A"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface WarningProps {
  condition?: string;
  warehouseType?: string;
}

export const ReturnConditionWarehouseWarning: React.FC<WarningProps> = ({
  condition,
  warehouseType,
}) => {
  if (!condition || !warehouseType) return null;

  const getAllowedWarehouseTypes = (cond: string) => {
    switch (cond) {
      case "saleable":
        return ["main", "secondary", "cold_storage"];
      case "quarantine":
        return ["quarantine", "return"];
      case "damaged":
        return ["damaged", "return"];
      case "expired":
        return ["expired", "return"];
      case "recall":
        return ["quarantine", "return", "damaged"];
      default:
        return [];
    }
  };

  const allowedTypes = getAllowedWarehouseTypes(condition);
  const isValid = allowedTypes.includes(warehouseType);

  if (isValid) return null;

  return (
    <div className="my-4 flex flex-col space-y-1 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      <div className="font-bold">Warehouse Mismatch Warning</div>
      <div>
        Selected warehouse type <strong>({warehouseType})</strong> is not
        suitable for this sales return condition <strong>({condition})</strong>.
      </div>
      <div className="mt-1 text-xs">
        Allowed warehouse types for {condition}: {allowedTypes.join(", ")}.
      </div>
    </div>
  );
};
