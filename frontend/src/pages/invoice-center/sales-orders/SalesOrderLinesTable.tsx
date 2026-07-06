import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  SalesOrderLineBatchSelect,
  SalesOrderLineProductSelect,
} from "../../../components/invoice-center";
import type {
  InvoiceInventoryProductLookup,
  SalesOrderLineForm,
} from "../../../types/invoice-center";

type SalesOrderLinesTableProps = {
  lines: SalesOrderLineForm[];
  onChange: (lines: SalesOrderLineForm[]) => void;
  disabled?: boolean;
  errors?: Record<string, string>;
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
): SalesOrderLineForm[] =>
  lines.map((line) => (line.id === id ? { ...line, ...patch } : line));

const SalesOrderLinesTable: React.FC<SalesOrderLinesTableProps> = ({
  lines,
  onChange,
  disabled,
  errors = {},
}) => {
  const addLine = () => onChange([...lines, blankLine()]);
  const removeLine = (id: string | number | undefined) => {
    const next = lines.filter((line) => line.id !== id);
    onChange(next.length ? next : [blankLine()]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Label className="text-sm font-semibold text-[#111827]">
            Products
          </Label>
          <p className="mt-1 text-xs text-[#64748B]">
            Choose inventory products, batches, quantities, and pricing.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addLine}
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
          Add line
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead className="min-w-56">Product</TableHead>
                <TableHead className="min-w-44">Batch</TableHead>
                <TableHead className="min-w-24">Qty</TableHead>
                <TableHead className="min-w-28">Unit Price</TableHead>
                <TableHead className="min-w-28">Discount</TableHead>
                <TableHead className="min-w-24">Tax</TableHead>
                <TableHead className="min-w-44">Remarks</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line, index) => (
                <TableRow key={line.id} className="align-top">
                  <TableCell className="py-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                        #{index + 1}
                      </span>
                      <SalesOrderLineProductSelect
                        value={line.product_id}
                        disabled={disabled}
                        onChange={(
                          value,
                          product?: InvoiceInventoryProductLookup | null
                        ) =>
                          onChange(
                            updateLine(lines, line.id, {
                              product_id: value,
                              product_batch_id: null,
                              product: product
                                ? {
                                    id: product.product_id,
                                    product_code: product.product_code,
                                    product_name: product.product_name,
                                    base_unit: product.base_unit,
                                    requires_batch_tracking:
                                      product.batch_tracking,
                                    requires_expiry_tracking:
                                      product.expiry_tracking,
                                    selling_price: product.selling_price,
                                    mrp: product.mrp,
                                    status: product.status,
                                  }
                                : null,
                              unit_price:
                                product?.selling_price ?? line.unit_price ?? 0,
                            })
                          )
                        }
                      />
                      <ValidationMessage
                        message={errors[`${line.id}.product_id`]}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <SalesOrderLineBatchSelect
                      value={line.product_batch_id}
                      productId={line.product_id}
                      disabled={disabled}
                      onChange={(value) =>
                        onChange(
                          updateLine(lines, line.id, {
                            product_batch_id: value,
                          })
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="py-3">
                    <Input
                      type="number"
                      min={0}
                      value={line.quantity}
                      disabled={disabled}
                      className={
                        errors[`${line.id}.quantity`] ? "border-red-500" : ""
                      }
                      onChange={(event) =>
                        onChange(
                          updateLine(lines, line.id, {
                            quantity: event.target.value,
                          })
                        )
                      }
                    />
                    <ValidationMessage
                      message={errors[`${line.id}.quantity`]}
                    />
                  </TableCell>
                  <TableCell className="py-3">
                    <Input
                      type="number"
                      min={0}
                      value={line.unit_price}
                      disabled={disabled}
                      className={
                        errors[`${line.id}.unit_price`] ? "border-red-500" : ""
                      }
                      onChange={(event) =>
                        onChange(
                          updateLine(lines, line.id, {
                            unit_price: event.target.value,
                          })
                        )
                      }
                    />
                    <ValidationMessage
                      message={errors[`${line.id}.unit_price`]}
                    />
                  </TableCell>
                  <TableCell className="py-3">
                    <Input
                      type="number"
                      min={0}
                      value={line.discount_amount}
                      disabled={disabled}
                      onChange={(event) =>
                        onChange(
                          updateLine(lines, line.id, {
                            discount_amount: event.target.value,
                          })
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="py-3">
                    <Input
                      type="number"
                      min={0}
                      value={line.tax_amount}
                      disabled={disabled}
                      onChange={(event) =>
                        onChange(
                          updateLine(lines, line.id, {
                            tax_amount: event.target.value,
                          })
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="py-3">
                    <Input
                      value={line.line_remarks}
                      disabled={disabled}
                      placeholder="Optional"
                      onChange={(event) =>
                        onChange(
                          updateLine(lines, line.id, {
                            line_remarks: event.target.value,
                          })
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="py-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeLine(line.id)}
                      disabled={disabled}
                      aria-label="Remove line"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

const ValidationMessage = ({ message }: { message?: string }) =>
  message ? (
    <p className="mt-1 min-w-40 text-xs font-medium text-red-500">{message}</p>
  ) : null;

export { blankLine as createBlankSalesOrderLine };
export default SalesOrderLinesTable;
