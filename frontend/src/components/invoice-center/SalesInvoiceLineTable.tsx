import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import type { SalesInvoiceLine } from "../../types/invoice-center";

type Props = {
  lines?: SalesInvoiceLine[];
};

const formatMoney = (value: number | undefined): string =>
  `LKR ${Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatQty = (qty: number | undefined): string =>
  Number(qty || 0).toFixed(3);

export const SalesInvoiceLineTable: React.FC<Props> = ({ lines = [] }) => {
  return (
    <div className="mt-4 overflow-x-auto rounded-md border">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Discount</TableHead>
            <TableHead className="text-right">Tax</TableHead>
            <TableHead className="text-right">Line Total</TableHead>
            <TableHead>Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="py-8 text-center text-muted-foreground"
              >
                No line items found.
              </TableCell>
            </TableRow>
          ) : (
            lines.map((line, index) => (
              <TableRow key={line.id || index}>
                <TableCell className="text-center text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {line.product_name || `Product ID: ${line.product_id}`}
                  </div>
                  {line.product_code && (
                    <div className="text-xs text-muted-foreground">
                      {line.product_code}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {line.batch_number || line.product_batch_id || "-"}
                  </div>
                  {line.expiry_date && (
                    <div className="text-xs text-muted-foreground">
                      Exp: {new Date(line.expiry_date).toLocaleDateString()}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatQty(line.quantity)}
                </TableCell>
                <TableCell className="text-right">
                  {formatMoney(line.unit_price)}
                </TableCell>
                <TableCell className="text-right">
                  {formatMoney(line.discount_amount)}
                </TableCell>
                <TableCell className="text-right">
                  {formatMoney(line.tax_amount)}
                </TableCell>
                <TableCell className="text-right font-semibold text-blue-700">
                  {formatMoney(line.line_total)}
                </TableCell>
                <TableCell
                  className="max-w-[150px] truncate text-xs text-muted-foreground"
                  title={line.line_remarks || ""}
                >
                  {line.line_remarks || "-"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
