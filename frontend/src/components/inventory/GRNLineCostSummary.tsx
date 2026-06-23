import React from "react";

const GRNLineCostSummary = ({ quantityReceived = 0, freeQuantity = 0, unitCost = 0, discountAmount = 0, taxAmount = 0 }: { quantityReceived?: unknown; freeQuantity?: unknown; unitCost?: unknown; discountAmount?: unknown; taxAmount?: unknown }) => {
  const qty = Number(quantityReceived) || 0;
  const freeQty = Number(freeQuantity) || 0;
  const uCost = Number(unitCost) || 0;
  const discount = Number(discountAmount) || 0;
  const tax = Number(taxAmount) || 0;

  const totalStockQty = qty + freeQty;
  const subTotal = qty * uCost;
  const lineTotal = subTotal - discount + tax;
  const stockUnitCost = totalStockQty > 0 ? lineTotal / totalStockQty : 0;

  const formatLKR = (val: unknown) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(val || 0);

  return (
    <div className="flex flex-col gap-1 text-[11px] min-w-[150px] bg-slate-50 dark:bg-navy-800 p-2 rounded border border-slate-100 dark:border-navy-700">
      <div className="flex justify-between">
        <span className="text-slate-500">Subtotal:</span>
        <span className="font-medium">{formatLKR(subTotal)}</span>
      </div>
      <div className="flex justify-between text-red-600">
        <span>Discount:</span>
        <span>- {formatLKR(discount)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-500">Tax:</span>
        <span className="font-medium">{formatLKR(tax)}</span>
      </div>
      <div className="border-t border-slate-200 dark:border-navy-600 my-0.5" />
      <div className="flex justify-between font-bold text-brand-600">
        <span>Line Total:</span>
        <span>{formatLKR(lineTotal)}</span>
      </div>
      <div className="flex justify-between pt-0.5 mt-0.5 border-t border-slate-200 dark:border-navy-600">
        <span className="text-slate-500">Stock U.Cost:</span>
        <span className={`font-bold ${stockUnitCost === 0 ? "text-red-500" : "text-green-600"}`}>
          {formatLKR(stockUnitCost)}
        </span>
      </div>
    </div>
  );
};

export default GRNLineCostSummary;
