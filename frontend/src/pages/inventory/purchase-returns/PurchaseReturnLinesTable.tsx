import React from "react";
import { Button } from "components/ui/button";
import { Plus, Trash } from "lucide-react";
import { PurchaseReturnLine } from "types/inventory";
import {
  PurchaseReturnLineProductSelect,
  PurchaseReturnLineBatchSelect,
} from "components/inventory/PurchaseReturnSelectComponents";
import { ReturnQuantityInput } from "components/inventory/ReturnQuantityInput";
import { Input } from "components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";

interface Props {
  lines: PurchaseReturnLine[];
  onLinesChange: (lines: PurchaseReturnLine[]) => void;
  disabled?: boolean;
}

const RETURN_REASONS = [
  { value: "damaged", label: "Damaged" },
  { value: "expired", label: "Expired" },
  { value: "wrong_item", label: "Wrong Item" },
  { value: "over_supply", label: "Over Supply" },
  { value: "quality_issue", label: "Quality Issue" },
  { value: "supplier_recall", label: "Supplier Recall" },
  { value: "pricing_error", label: "Pricing Error" },
  { value: "near_expiry", label: "Near Expiry" },
  { value: "other", label: "Other" },
];

const PurchaseReturnLinesTable: React.FC<Props> = ({
  lines,
  onLinesChange,
  disabled,
}) => {
  const addLine = () => {
    onLinesChange([
      ...lines,
      {
        product_id: null,
        product: null,
        product_batch_id: null,
        batch: null,
        return_quantity: "",
        unit_cost: 0,
        discount_amount: 0,
        tax_amount: 0,
        line_total: 0,
        return_reason: "damaged",
        line_remarks: "",
      },
    ]);
  };

  const removeLine = (index: number) => {
    const newLines = [...lines];
    newLines.splice(index, 1);
    onLinesChange(newLines);
  };

  const updateLine = (
    index: number,
    field: keyof PurchaseReturnLine,
    value: any
  ) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };

    // Recalculate line total
    const qty = Number(newLines[index].return_quantity) || 0;
    const cost = Number(newLines[index].unit_cost) || 0;
    const discount = Number(newLines[index].discount_amount) || 0;
    const tax = Number(newLines[index].tax_amount) || 0;
    newLines[index].line_total = qty * cost - discount + tax;

    onLinesChange(newLines);
  };

  const updateProduct = (index: number, val: string, product: any) => {
    const newLines = [...lines];
    newLines[index] = {
      ...newLines[index],
      product_id: val ? Number(val) : null,
      product,
      product_batch_id: null,
      batch: null,
    };
    onLinesChange(newLines);
  };

  const updateBatch = (index: number, val: string, batch: any) => {
    const newLines = [...lines];
    newLines[index] = {
      ...newLines[index],
      product_batch_id: val ? Number(val) : null,
      batch,
    };
    onLinesChange(newLines);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Return Items</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={addLine}
          disabled={disabled}
          type="button"
        >
          <Plus className="mr-1 h-4 w-4" /> Add Line
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th className="min-w-[200px] px-4 py-3">
                Product <span className="text-red-500">*</span>
              </th>
              <th className="min-w-[150px] px-4 py-3">
                Batch <span className="text-red-500">*</span>
              </th>
              <th className="min-w-[120px] px-4 py-3">
                Return Reason <span className="text-red-500">*</span>
              </th>
              <th className="w-32 px-4 py-3 text-right">
                Return Qty <span className="text-red-500">*</span>
              </th>
              <th className="w-32 px-4 py-3 text-right">
                Unit Cost <span className="text-red-500">*</span>
              </th>
              <th className="w-32 px-4 py-3 text-right">Discount</th>
              <th className="w-32 px-4 py-3 text-right">Tax</th>
              <th className="w-32 px-4 py-3 text-right">Line Total</th>
              <th className="w-16 px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="bg-gray-50/50 px-4 py-8 text-center text-gray-500"
                >
                  No items added. Click "Add Line" to add products to return.
                </td>
              </tr>
            ) : (
              lines.map((line, index) => (
                <tr key={index} className="border-b bg-white hover:bg-gray-50">
                  {/* Product */}
                  <td className="px-4 py-3 align-top">
                    {line.goods_receipt_note_line_id ? (
                      <div className="pt-2 text-sm font-medium">
                        {line.product?.product_name}
                      </div>
                    ) : (
                      <PurchaseReturnLineProductSelect
                        value={line.product_id?.toString() || ""}
                        onChange={(val, prod) =>
                          updateProduct(index, val, prod)
                        }
                        disabled={disabled}
                      />
                    )}
                  </td>

                  {/* Batch */}
                  <td className="px-4 py-3 align-top">
                    {line.goods_receipt_note_line_id ? (
                      <div className="pt-2 text-sm">
                        {line.batch?.batch_number || "N/A"}
                      </div>
                    ) : (
                      <PurchaseReturnLineBatchSelect
                        productId={line.product_id}
                        value={line.product_batch_id?.toString() || ""}
                        onChange={(val, batch) =>
                          updateBatch(index, val, batch)
                        }
                        disabled={disabled || !line.product_id}
                      />
                    )}
                  </td>

                  {/* Reason */}
                  <td className="px-4 py-3 align-top">
                    <Select
                      value={line.return_reason}
                      onValueChange={(val) =>
                        updateLine(index, "return_reason", val)
                      }
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {RETURN_REASONS.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>

                  {/* Return Quantity */}
                  <td className="px-4 py-3 align-top">
                    <ReturnQuantityInput
                      value={line.return_quantity}
                      onChange={(val) =>
                        updateLine(index, "return_quantity", val)
                      }
                      availableQuantity={line.available_quantity}
                      disabled={disabled}
                    />
                    {line.available_quantity !== undefined &&
                      line.available_quantity !== null && (
                        <div className="mt-1 text-right text-[10px] text-gray-500">
                          Avail: {line.available_quantity.toFixed(3)}
                        </div>
                      )}
                  </td>

                  {/* Unit Cost */}
                  <td className="px-4 py-3 align-top">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full text-right"
                      value={line.unit_cost}
                      onChange={(e) =>
                        updateLine(index, "unit_cost", e.target.value)
                      }
                      disabled={disabled || !!line.goods_receipt_note_line_id}
                    />
                  </td>

                  {/* Discount */}
                  <td className="px-4 py-3 align-top">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full text-right"
                      value={line.discount_amount}
                      onChange={(e) =>
                        updateLine(index, "discount_amount", e.target.value)
                      }
                      disabled={disabled || !!line.goods_receipt_note_line_id}
                    />
                  </td>

                  {/* Tax */}
                  <td className="px-4 py-3 align-top">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full text-right"
                      value={line.tax_amount}
                      onChange={(e) =>
                        updateLine(index, "tax_amount", e.target.value)
                      }
                      disabled={disabled || !!line.goods_receipt_note_line_id}
                    />
                  </td>

                  {/* Line Total */}
                  <td className="px-4 py-3 pt-5 text-right align-top font-medium">
                    {(line.line_total || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 pt-3 text-center align-top">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(index)}
                      disabled={disabled}
                      className="text-red-500 hover:bg-red-50 hover:text-red-700"
                      type="button"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseReturnLinesTable;
