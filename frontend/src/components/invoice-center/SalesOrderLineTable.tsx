import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import type { SalesOrderLine } from "../../types/invoice-center";

type SalesOrderLineTableProps = {
  lines: SalesOrderLine[];
};

const formatMoney = (value: number): string =>
  `LKR ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const SalesOrderLineTable: React.FC<SalesOrderLineTableProps> = ({ lines }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Batch</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Unit Price</TableHead>
          <TableHead className="text-right">Discount</TableHead>
          <TableHead className="text-right">Tax</TableHead>
          <TableHead className="text-right">Line Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={7}
              className="py-8 text-center text-muted-foreground"
            >
              No line items found.
            </TableCell>
          </TableRow>
        ) : (
          lines.map((line) => (
            <TableRow key={line.id}>
              <TableCell>
                <div className="font-medium">
                  {line.product_name || `Product #${line.product_id}`}
                </div>
                {line.product_code && (
                  <div className="text-xs text-muted-foreground">
                    {line.product_code}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {line.batch_number || line.product_batch_id || "-"}
              </TableCell>
              <TableCell className="text-right">
                {Number(line.quantity || 0).toLocaleString()}
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
              <TableCell className="text-right font-semibold">
                {formatMoney(line.line_total)}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default SalesOrderLineTable;
