import { Control, UseFormRegister, useFieldArray } from "react-hook-form";
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Switch } from "../../../components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { defaultPrintFields } from "./printFormatDefaults";

type Props = {
  control: Control<any>;
  register: UseFormRegister<any>;
  setValue: (name: string, value: any, options?: any) => void;
  watch: (name?: string) => any;
};

export function PrintFormatFieldBuilder({ control, register, setValue, watch }: Props) {
  const { fields, append, remove, move, replace } = useFieldArray({ control, name: "fields" });

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white/75 p-4 shadow-[0_8px_30px_rgba(2,62,138,0.08)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#111827]">Line Columns</h3>
          <p className="mt-1 text-sm text-[#6B7280]">Visible columns are used by document print pages.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => replace(defaultPrintFields)}>
            Reset
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ field_key: "", field_label: "", is_visible: true, display_order: fields.length + 1, column_width: 120, alignment: "left" })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Order</TableHead>
              <TableHead className="min-w-44">Key</TableHead>
              <TableHead className="min-w-52">Label</TableHead>
              <TableHead className="w-28 text-center">Visible</TableHead>
              <TableHead className="w-36">Width</TableHead>
              <TableHead className="w-40">Align</TableHead>
              <TableHead className="w-16 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell>
                  <div className="flex items-center gap-1 text-slate-500">
                    <GripVertical className="h-4 w-4 text-slate-400" />
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => index > 0 && move(index, index - 1)} disabled={index === 0}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => index < fields.length - 1 && move(index, index + 1)} disabled={index === fields.length - 1}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell><Input {...register(`fields.${index}.field_key`)}  placeholder="Enter value" /></TableCell>
                <TableCell><Input {...register(`fields.${index}.field_label`)}  placeholder="Enter value" /></TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={Boolean(watch(`fields.${index}.is_visible`))}
                    onCheckedChange={(checked) => setValue(`fields.${index}.is_visible`, checked)}
                  />
                </TableCell>
                <TableCell><Input type="number" {...register(`fields.${index}.column_width`, { valueAsNumber: true })}  placeholder="Enter value" /></TableCell>
                <TableCell>
                  <Select value={watch(`fields.${index}.alignment`) || "left"} onValueChange={(value) => setValue(`fields.${index}.alignment`, value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
