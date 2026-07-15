import React from 'react';
import { QuickField, SourceName, optionLabel } from './FinanceQuickResourcePage';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Plus, Trash2, GripVertical } from "lucide-react";

type DynamicLinesEditorProps = {
  columns: QuickField[];
  value: any[];
  onChange: (value: any[]) => void;
  refs: Record<SourceName, any[]>;
};

export function DynamicLinesEditor({ columns, value, onChange, refs }: DynamicLinesEditorProps) {
  const handleAdd = () => {
    const newRow: any = {};
    columns.forEach(c => {
      newRow[c.name] = c.defaultValue !== undefined ? c.defaultValue : "";
    });
    onChange([...value, newRow]);
  };

  const handleRemove = (index: number) => {
    const next = [...value];
    next.splice(index, 1);
    onChange(next);
  };

  const handleChange = (index: number, name: string, val: any) => {
    const next = [...value];
    next[index] = { ...next[index], [name]: val };
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl shadow-sm border border-slate-100">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/80 border-b border-slate-100">
            <tr>
              {columns.map(c => (
                <th key={c.name} className="px-3 py-3 text-xs font-bold text-slate-500">
                  {c.label} {c.required && <span className="text-red-500">*</span>}
                </th>
              ))}
              <th className="px-3 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {value.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                {columns.map(c => (
                  <td key={c.name} className="p-2 align-top">
                    {c.type === "select" ? (
                      <Select value={row[c.name] ? String(row[c.name]) : ""} onValueChange={(val) => handleChange(i, c.name, val)}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={c.placeholder || `Choose`} />
                        </SelectTrigger>
                        <SelectContent>
                          {!c.required && <SelectItem value="__none__">None</SelectItem>}
                          {(c.source ? (refs[c.source] || []) : c.options || []).map((opt: any) => {
                            const val = c.source ? String(opt.id) : opt.value;
                            const lbl = c.source ? optionLabel(c.source, opt) : opt.label;
                            return (
                              <SelectItem key={val} value={val}>{lbl}</SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input 
                        type={c.type === "number" ? "number" : "text"} 
                        value={row[c.name] ?? (c.type === "number" ? 0 : "")} 
                        onChange={(e) => handleChange(i, c.name, e.target.value)} 
                        placeholder={c.placeholder}
                        className="h-9"
                      />
                    )}
                  </td>
                ))}
                <td className="p-2 align-top text-center">
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleRemove(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {value.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-slate-400 text-sm border-dashed border-t">
                  No lines added yet. Click below to add a new line.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={handleAdd} className="mt-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
        <Plus className="h-4 w-4 mr-1" /> Add Line
      </Button>
    </div>
  );
}
