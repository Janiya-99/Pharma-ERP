import React from "react";
import { Button } from "components/ui/button";
import { Plus, Trash } from "lucide-react";
import { SalesReturnLine } from "types/inventory";
import {
  SalesReturnLineProductSelect,
  SalesReturnLineBatchSelect,
} from "components/inventory/SalesReturnSelectComponents";
import { Input } from "components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select";

interface Props {
  lines: SalesReturnLine[];
  onLinesChange: (lines: SalesReturnLine[]) => void;
  disabled?: boolean;
  defaultReturnReason?: string;
  defaultReturnCondition?: string;
  warehouseId?: string;
}

const RETURN_REASONS = [
  { value: "damaged", label: "Damaged" },
  { value: "expired", label: "Expired" },
  { value: "wrong_item", label: "Wrong Item" },
  { value: "customer_return", label: "Customer Return" },
  { value: "quality_issue", label: "Quality Issue" },
  { value: "recall", label: "Recall" },
  { value: "pricing_error", label: "Pricing Error" },
  { value: "near_expiry", label: "Near Expiry" },
  { value: "other", label: "Other" },
];

const RETURN_CONDITIONS = [
  { value: "saleable", label: "Saleable" },
  { value: "quarantine", label: "Quarantine" },
  { value: "damaged", label: "Damaged" },
  { value: "expired", label: "Expired" },
  { value: "recall", label: "Recall" },
];

const SalesReturnLinesTable: React.FC<Props> = ({ lines, onLinesChange, disabled, defaultReturnReason = "customer_return", defaultReturnCondition = "saleable", warehouseId }) => {
  const addLine = () => {
    onLinesChange([
      ...lines,
      {
        product_id: 0, // Using 0 temporarily, will be overridden
        product: null,
        product_batch_id: null,
        batch: null,
        return_quantity: "",
        unit_price: 0,
        discount_amount: 0,
        tax_amount: 0,
        line_total: 0,
        stock_unit_cost: 0,
        return_reason: defaultReturnReason,
        return_condition: defaultReturnCondition,
        line_remarks: "",
      } as any,
    ]);
  };

  const removeLine = (index: number) => {
    const newLines = [...lines];
    newLines.splice(index, 1);
    onLinesChange(newLines);
  };

  const updateLine = (index: number, field: keyof SalesReturnLine, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    
    // Recalculate line total
    const qty = Number(newLines[index].return_quantity) || 0;
    const price = Number(newLines[index].unit_price) || 0;
    const discount = Number(newLines[index].discount_amount) || 0;
    const tax = Number(newLines[index].tax_amount) || 0;
    newLines[index].line_total = (qty * price) - discount + tax;

    onLinesChange(newLines);
  };

  const updateProduct = (index: number, val: string, product: any) => {
    const newLines = [...lines];
    newLines[index] = {
      ...newLines[index],
      product_id: val ? Number(val) : 0,
      product,
      product_batch_id: null,
      batch: null,
    } as any;
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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Return Items</h3>
        <Button variant="outline" size="sm" onClick={addLine} disabled={disabled || !warehouseId} type="button">
          <Plus className="w-4 h-4 mr-1" /> Add Line
        </Button>
      </div>

      {!warehouseId && (
        <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
          Please select a warehouse first to add line items.
        </div>
      )}

      <div className="overflow-x-auto border rounded-md">
        <table className="w-full text-sm text-left min-w-[1200px]">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 w-[200px]">Product <span className="text-red-500">*</span></th>
              <th className="px-4 py-3 w-[150px]">Batch</th>
              <th className="px-4 py-3 w-[130px]">Condition <span className="text-red-500">*</span></th>
              <th className="px-4 py-3 w-[130px]">Reason <span className="text-red-500">*</span></th>
              <th className="px-4 py-3 w-28 text-right">Return Qty <span className="text-red-500">*</span></th>
              <th className="px-4 py-3 w-28 text-right">Unit Price <span className="text-red-500">*</span></th>
              <th className="px-4 py-3 w-24 text-right">Discount</th>
              <th className="px-4 py-3 w-24 text-right">Tax</th>
              <th className="px-4 py-3 w-28 text-right">Line Total</th>
              <th className="px-4 py-3 w-16 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500 bg-gray-50/50">
                  No items added. Click "Add Line" to add products to return.
                </td>
              </tr>
            ) : (
              lines.map((line, index) => (
                <tr key={index} className="border-b bg-white hover:bg-gray-50">
                  {/* Product */}
                  <td className="px-4 py-3 align-top">
                    {line.id ? (
                      <div className="text-sm font-medium pt-2">
                        {line.product?.product_name}
                      </div>
                    ) : (
                      <SalesReturnLineProductSelect
                        value={line.product_id?.toString() || ""}
                        onChange={(val, prod) => updateProduct(index, val, prod)}
                        disabled={disabled}
                      />
                    )}
                  </td>

                  {/* Batch */}
                  <td className="px-4 py-3 align-top">
                    {line.id ? (
                      <div className="text-sm pt-2">
                        {line.batch?.batch_number || "N/A"}
                      </div>
                    ) : (
                      <SalesReturnLineBatchSelect
                        productId={line.product_id}
                        value={line.product_batch_id?.toString() || ""}
                        onChange={(val, batch) => updateBatch(index, val, batch)}
                        disabled={disabled || !line.product_id}
                      />
                    )}
                  </td>

                  {/* Condition */}
                  <td className="px-4 py-3 align-top">
                    <Select
                      value={line.return_condition}
                      onValueChange={(val) => updateLine(index, "return_condition", val)}
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {RETURN_CONDITIONS.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>

                  {/* Reason */}
                  <td className="px-4 py-3 align-top">
                    <Select
                      value={line.return_reason}
                      onValueChange={(val) => updateLine(index, "return_reason", val)}
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Reason" />
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
                    <Input
                      type="number"
                      min="0.001"
                      step="0.001"
                      className="w-full text-right"
                      value={line.return_quantity}
                      onChange={(e) => updateLine(index, "return_quantity", e.target.value)}
                      disabled={disabled}
                    />
                  </td>

                  {/* Unit Price */}
                  <td className="px-4 py-3 align-top">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full text-right"
                      value={line.unit_price}
                      onChange={(e) => updateLine(index, "unit_price", e.target.value)}
                      disabled={disabled}
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
                      onChange={(e) => updateLine(index, "discount_amount", e.target.value)}
                      disabled={disabled}
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
                      onChange={(e) => updateLine(index, "tax_amount", e.target.value)}
                      disabled={disabled}
                    />
                  </td>

                  {/* Line Total */}
                  <td className="px-4 py-3 text-right font-medium align-top pt-5">
                    {(line.line_total || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 text-center align-top pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(index)}
                      disabled={disabled}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      type="button"
                    >
                      <Trash className="w-4 h-4" />
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

export default SalesReturnLinesTable;
