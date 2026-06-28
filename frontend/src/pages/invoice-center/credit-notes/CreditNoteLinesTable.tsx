import React from "react";
import { Plus, Trash2, Copy } from "lucide-react";
import {
  useFieldArray,
  Control,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { SalesInvoiceLineProductSelect } from "../../../components/invoice-center";

export const createBlankCreditNoteLine = () => ({
  sales_invoice_line_id: "",
  product_id: "",
  description: "",
  quantity: 1,
  unit_price: 0,
  discount_amount: 0,
  tax_amount: 0,
});

interface Props {
  control: Control<any>;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  errors: any;
}

export const CreditNoteLinesTable: React.FC<Props> = ({
  control,
  register,
  setValue,
  watch,
  errors,
}) => {
  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: "lines",
  });

  const lines = watch("lines") || [];

  const handleProductChange = (index: number, val: string) => {
    setValue(`lines.${index}.product_id`, val, { shouldValidate: true });
  };

  const calculateLineTotal = (
    qty: number,
    price: number,
    discount: number,
    tax: number
  ) => {
    return (
      Number(qty || 0) * Number(price || 0) -
      Number(discount || 0) +
      Number(tax || 0)
    );
  };

  const formatMoney = (amount: number) => {
    return Number(amount || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Line Items</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(createBlankCreditNoteLine())}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Line
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead className="w-[200px]">Product</TableHead>
              <TableHead className="w-[100px] text-right">Qty *</TableHead>
              <TableHead className="w-[120px] text-right">Unit Price</TableHead>
              <TableHead className="w-[100px] text-right">Discount</TableHead>
              <TableHead className="w-[100px] text-right">Tax</TableHead>
              <TableHead className="w-[120px] text-right">Total</TableHead>
              <TableHead className="w-[150px]">Description</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field: any, index: number) => {
              const qty = Number(watch(`lines.${index}.quantity`) || 0);
              const price = Number(watch(`lines.${index}.unit_price`) || 0);
              const discount = Number(
                watch(`lines.${index}.discount_amount`) || 0
              );
              const tax = Number(watch(`lines.${index}.tax_amount`) || 0);
              const total = calculateLineTotal(qty, price, discount, tax);
              const lineError = errors?.lines?.[index];

              return (
                <TableRow
                  key={field.id}
                  className={lineError ? "bg-red-50/50" : ""}
                >
                  <TableCell className="text-center text-sm text-gray-500">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <SalesInvoiceLineProductSelect
                      value={watch(`lines.${index}.product_id`)}
                      onChange={(val: any) => handleProductChange(index, val)}
                    />
                    {lineError?.product_id && (
                      <span className="mt-1 block text-xs text-red-500">
                        {lineError.product_id.message}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.001"
                      className={`text-right ${
                        lineError?.quantity ? "border-red-500" : ""
                      }`}
                      {...register(`lines.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      className={`text-right ${
                        lineError?.unit_price ? "border-red-500" : ""
                      }`}
                      {...register(`lines.${index}.unit_price`, {
                        valueAsNumber: true,
                      })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      className={`text-right ${
                        lineError?.discount_amount ? "border-red-500" : ""
                      }`}
                      {...register(`lines.${index}.discount_amount`, {
                        valueAsNumber: true,
                      })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      className={`text-right ${
                        lineError?.tax_amount ? "border-red-500" : ""
                      }`}
                      {...register(`lines.${index}.tax_amount`, {
                        valueAsNumber: true,
                      })}
                    />
                  </TableCell>
                  <TableCell className="bg-gray-50 text-right font-semibold text-blue-700">
                    {formatMoney(total)}
                  </TableCell>
                  <TableCell>
                    <Textarea
                      rows={1}
                      className="min-h-0 resize-none py-2"
                      placeholder="Description..."
                      {...register(`lines.${index}.description`)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-500"
                        onClick={() => insert(index + 1, lines[index])}
                        title="Duplicate Line"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => remove(index)}
                        title="Remove Line"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {fields.length === 0 && (
          <div className="border-t py-8 text-center text-gray-500">
            <p className="mb-4">No line items added yet.</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => append(createBlankCreditNoteLine())}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add First Line
            </Button>
          </div>
        )}
      </div>

      {errors?.lines?.root && (
        <div className="text-sm font-medium text-red-500">
          {errors.lines.root.message}
        </div>
      )}
    </div>
  );
};
