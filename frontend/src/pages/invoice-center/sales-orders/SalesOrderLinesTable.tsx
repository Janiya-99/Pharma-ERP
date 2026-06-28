import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { SalesOrderLineBatchSelect, SalesOrderLineProductSelect } from "../../../components/invoice-center";
import type { SalesOrderLineForm } from "../../../types/invoice-center";

type SalesOrderLinesTableProps = {
  lines: SalesOrderLineForm[];
  onChange: (lines: SalesOrderLineForm[]) => void;
  disabled?: boolean;
};

const blankLine = (): SalesOrderLineForm => ({
  id: crypto.randomUUID(),
  product_id: null,
  product_batch_id: null,
  quantity: 1,
  unit_price: 0,
  discount_amount: 0,
  tax_amount: 0,
  line_remarks: "",
});

const updateLine = (
  lines: SalesOrderLineForm[],
  id: string | number | undefined,
  patch: Partial<SalesOrderLineForm>
): SalesOrderLineForm[] => lines.map((line) => (line.id === id ? { ...line, ...patch } : line));

const SalesOrderLinesTable: React.FC<SalesOrderLinesTableProps> = ({ lines, onChange, disabled }) => {
  const addLine = () => onChange([...lines, blankLine()]);
  const removeLine = (id: string | number | undefined) => {
    const next = lines.filter((line) => line.id !== id);
    onChange(next.length ? next : [blankLine()]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Line Items</Label>
        <Button type="button" variant="outline" size="sm" onClick={addLine} disabled={disabled}>
          <Plus className="h-4 w-4" />
          Add line
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-44">Product</TableHead>
            <TableHead className="min-w-36">Batch</TableHead>
            <TableHead className="min-w-28">Quantity</TableHead>
            <TableHead className="min-w-28">Unit Price</TableHead>
            <TableHead className="min-w-28">Discount</TableHead>
            <TableHead className="min-w-28">Tax</TableHead>
            <TableHead className="min-w-44">Remarks</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((line) => (
            <TableRow key={line.id}>
              <TableCell>
                <SalesOrderLineProductSelect
                  value={line.product_id}
                  disabled={disabled}
                  onChange={(value) => onChange(updateLine(lines, line.id, { product_id: value }))}
                />
              </TableCell>
              <TableCell>
                <SalesOrderLineBatchSelect
                  value={line.product_batch_id}
                  disabled={disabled}
                  onChange={(value) => onChange(updateLine(lines, line.id, { product_batch_id: value }))}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  value={line.quantity}
                  disabled={disabled}
                  onChange={(event) => onChange(updateLine(lines, line.id, { quantity: event.target.value }))}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  value={line.unit_price}
                  disabled={disabled}
                  onChange={(event) => onChange(updateLine(lines, line.id, { unit_price: event.target.value }))}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  value={line.discount_amount}
                  disabled={disabled}
                  onChange={(event) => onChange(updateLine(lines, line.id, { discount_amount: event.target.value }))}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  value={line.tax_amount}
                  disabled={disabled}
                  onChange={(event) => onChange(updateLine(lines, line.id, { tax_amount: event.target.value }))}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={line.line_remarks}
                  disabled={disabled}
                  onChange={(event) => onChange(updateLine(lines, line.id, { line_remarks: event.target.value }))}
                />
              </TableCell>
              <TableCell>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeLine(line.id)} disabled={disabled}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export { blankLine as createBlankSalesOrderLine };
export default SalesOrderLinesTable;
