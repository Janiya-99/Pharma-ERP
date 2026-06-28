import React from "react";

const GRNTotalsCard = ({ grn, lines }: { grn?: unknown; lines?: unknown }) => {
  const tQty =
    lines?.reduce(
      (sum: unknown, l: unknown) => sum + (Number(l.quantity_received) || 0),
      0
    ) ||
    grn?.total_quantity ||
    0;
  const tFreeQty =
    lines?.reduce(
      (sum: unknown, l: unknown) => sum + (Number(l.free_quantity) || 0),
      0
    ) ||
    grn?.total_free_quantity ||
    0;
  const tStockQty =
    lines?.reduce(
      (sum: unknown, l: unknown) =>
        sum +
        (Number(l.quantity_received) || 0) +
        (Number(l.free_quantity) || 0),
      0
    ) ||
    grn?.total_stock_quantity ||
    0;

  const subTotal =
    lines?.reduce(
      (sum: unknown, l: unknown) =>
        sum + (Number(l.quantity_received) || 0) * (Number(l.unit_cost) || 0),
      0
    ) ||
    grn?.subtotal_amount ||
    0;
  const tDiscount =
    lines?.reduce(
      (sum: unknown, l: unknown) => sum + (Number(l.discount_amount) || 0),
      0
    ) ||
    grn?.discount_amount ||
    0;
  const tTax =
    lines?.reduce(
      (sum: unknown, l: unknown) => sum + (Number(l.tax_amount) || 0),
      0
    ) ||
    grn?.tax_amount ||
    0;
  const tTotal =
    lines?.reduce(
      (sum: unknown, l: unknown) =>
        sum +
        ((Number(l.quantity_received) || 0) * (Number(l.unit_cost) || 0) -
          (Number(l.discount_amount) || 0) +
          (Number(l.tax_amount) || 0)),
      0
    ) ||
    grn?.total_amount ||
    0;

  const formatLKR = (val: unknown) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(val || 0);

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-navy-700 dark:bg-navy-800">
      <h3 className="mb-3 border-b pb-2 text-sm font-semibold text-gray-800 dark:border-navy-600 dark:text-white">
        GRN Totals
      </h3>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">
            Total Quantity:
          </span>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {Number(tQty).toFixed(3)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">
            Total Free Quantity:
          </span>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {Number(tFreeQty).toFixed(3)}
          </span>
        </div>
        <div className="flex items-center justify-between font-bold">
          <span className="text-brand-600 dark:text-brand-400">
            Total Stock Qty:
          </span>
          <span className="text-brand-600 dark:text-brand-400">
            {Number(tStockQty).toFixed(3)}
          </span>
        </div>

        <div className="my-2 h-px bg-gray-200 dark:bg-navy-600"></div>

        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">Subtotal:</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {formatLKR(subTotal)}
          </span>
        </div>
        <div className="flex items-center justify-between text-red-600 dark:text-red-400">
          <span>Discount:</span>
          <span>- {formatLKR(tDiscount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">Tax:</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {formatLKR(tTax)}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-base font-bold dark:border-navy-600">
          <span className="text-brand-600 dark:text-brand-400">
            Total Amount:
          </span>
          <span className="text-brand-600 dark:text-brand-400">
            {formatLKR(tTotal)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GRNTotalsCard;
