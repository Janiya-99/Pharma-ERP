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
import {
  SalesInvoiceLineProductSelect,
  SalesInvoiceLineBatchSelect,
} from "../../../components/invoice-center";

export const createBlankSalesInvoiceLine = () => ({
  product_id: "",
  product_batch_id: "",
  quantity: 1,
  unit_price: 0,
  discount_amount: 0,
  tax_amount: 0,
  line_remarks: "",
});

interface Props {
  control: Control<any>;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  errors: any;
}

export const SalesInvoiceLinesTable: React.FC<Props> = ({
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
    setValue(`lines.${index}.product_batch_id`, "", { shouldValidate: true });
  };

  const handleBatchChange = (index: number, val: string) => {
    setValue(`lines.${index}.product_batch_id`, val, { shouldValidate: true });
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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#111827]">Line Items</h3>
          <p className="mt-1 text-sm text-[#64748B]">
            Add products from inventory and confirm quantities, pricing, and
            tax.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(createBlankSalesInvoiceLine())}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Line
        </Button>
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-slate-200 xl:block">
        <Table>
          <TableHeader className="bg-[#F8FAFC]">
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead className="min-w-[230px]">Product *</TableHead>
              <TableHead className="min-w-[170px]">Batch</TableHead>
              <TableHead className="w-[100px] text-right">Qty *</TableHead>
              <TableHead className="w-[120px] text-right">Unit Price</TableHead>
              <TableHead className="w-[100px] text-right">Discount</TableHead>
              <TableHead className="w-[100px] text-right">Tax</TableHead>
              <TableHead className="w-[120px] text-right">Total</TableHead>
              <TableHead className="w-[150px]">Remarks</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => {
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
                      onChange={(val) => handleProductChange(index, val)}
                    />
                    {lineError?.product_id && (
                      <span className="mt-1 block text-xs text-red-500">
                        {lineError.product_id.message}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <SalesInvoiceLineBatchSelect
                      value={watch(`lines.${index}.product_batch_id`)}
                      onChange={(val) => handleBatchChange(index, val)}
                      productId={watch(`lines.${index}.product_id`)}
                      onBatchSelected={(batch) => {
                        if (batch.selling_price) {
                          setValue(
                            `lines.${index}.unit_price`,
                            Number(batch.selling_price),
                            { shouldValidate: true }
                          );
                        }
                      }}
                    />
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
                  <TableCell className="bg-gray-50 text-right font-semibold text-indigo-700">
                    {formatMoney(total)}
                  </TableCell>
                  <TableCell>
                    <Textarea
                      rows={1}
                      className="min-h-0 resize-none py-2"
                      placeholder="Remarks..."
                      {...register(`lines.${index}.line_remarks`)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-indigo-500"
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
              onClick={() => append(createBlankSalesInvoiceLine())}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add First Line
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-3 xl:hidden">
        {fields.map((field, index) => {
          const qty = Number(watch(`lines.${index}.quantity`) || 0);
          const price = Number(watch(`lines.${index}.unit_price`) || 0);
          const discount = Number(watch(`lines.${index}.discount_amount`) || 0);
          const tax = Number(watch(`lines.${index}.tax_amount`) || 0);
          const total = calculateLineTotal(qty, price, discount, tax);
          const lineError = errors?.lines?.[index];

          return (
            <div
              key={field.id}
              className={`rounded-lg border p-3 ${
                lineError
                  ? "border-red-200 bg-red-50/40"
                  : "border-slate-200 bg-[#F8FAFC]"
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-[#111827]">
                  Line {index + 1}
                </div>
                <div className="text-sm font-bold text-[#4854CC]">
                  {formatMoney(total)}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1 sm:col-span-2">
                  <Label>Product *</Label>
                  <SalesInvoiceLineProductSelect
                    value={watch(`lines.${index}.product_id`)}
                    onChange={(val) => handleProductChange(index, val)}
                  />
                  {lineError?.product_id && (
                    <span className="text-xs text-red-500">
                      {lineError.product_id.message}
                    </span>
                  )}
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Batch</Label>
                  <SalesInvoiceLineBatchSelect
                    value={watch(`lines.${index}.product_batch_id`)}
                    onChange={(val) => handleBatchChange(index, val)}
                    productId={watch(`lines.${index}.product_id`)}
                    onBatchSelected={(batch) => {
                      if (batch.selling_price) {
                        setValue(
                          `lines.${index}.unit_price`,
                          Number(batch.selling_price),
                          { shouldValidate: true }
                        );
                      }
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Qty *</Label>
                  <Input
                    type="number"
                    step="0.001"
                    className={lineError?.quantity ? "border-red-500" : ""}
                    {...register(`lines.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className={lineError?.unit_price ? "border-red-500" : ""}
                    {...register(`lines.${index}.unit_price`, {
                      valueAsNumber: true,
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Discount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className={
                      lineError?.discount_amount ? "border-red-500" : ""
                    }
                    {...register(`lines.${index}.discount_amount`, {
                      valueAsNumber: true,
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Tax</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className={lineError?.tax_amount ? "border-red-500" : ""}
                    {...register(`lines.${index}.tax_amount`, {
                      valueAsNumber: true,
                    })}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Remarks</Label>
                  <Textarea
                    rows={2}
                    placeholder="Remarks..."
                    {...register(`lines.${index}.line_remarks`)}
                  />
                </div>
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insert(index + 1, lines[index])}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          );
        })}

        {fields.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 py-8 text-center text-[#64748B]">
            <p className="mb-4">No line items added yet.</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => append(createBlankSalesInvoiceLine())}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add First Line
            </Button>
          </div>
        )}
      </div>

      {errors?.lines?.root && (
        <div className="mt-3 text-sm font-medium text-red-500">
          {errors.lines.root.message}
        </div>
      )}
    </div>
  );
};
